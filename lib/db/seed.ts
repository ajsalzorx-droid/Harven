import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Db } from 'mongodb'
import { isCloudinaryConfigured } from '@/lib/cloudinary'
import { mediaAssets, saveMedia } from './media'
import { migrateGridfsToCloudinary } from './migrate-cloudinary'

// Runs once per database: creates indexes and, for every collection that is
// still empty, inserts the initial site data. Images are uploaded to Cloudinary.

const globalForSeed = globalThis as unknown as { _harvenSeed?: Promise<void> }

// Initial admin login: admin@gmail.com (scrypt hash — the password is not stored).
const SEED_ADMIN_EMAIL = 'admin@gmail.com'
const SEED_ADMIN_PASSWORD_HASH = 'scrypt$16384$8$1$0GT9PkZUh1RF5COXOYj9sw==$JbulyejYj9VZ4AfN3awQUKyfXBhMKHFg7ZFliQ4C+7/JifqX6zgHLuB/0Xw9FsCM+CeRuL1Z3YWH0wICDb3g/w=='

const LOCK_STALE_MS = 10 * 60 * 1000

export function ensureSeeded(db: Db) {
  // Never seed while `next build` is prerendering pages.
  if (process.env.NEXT_PHASE === 'phase-production-build') return Promise.resolve()

  if (!globalForSeed._harvenSeed) {
    globalForSeed._harvenSeed = runSetup(db).catch((err) => {
      console.error('[seed] Initial data seed failed:', err)
      globalForSeed._harvenSeed = undefined // retry on a later request
    })
  }
  return globalForSeed._harvenSeed
}

async function runSetup(db: Db) {
  await runSeed(db)
  await migrateGridfsToCloudinary(db)
}

async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection('admin_users').createIndex({ email: 1 }, { unique: true }),
    db.collection('admin_sessions').createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }),
    db.collection('admin_sessions').createIndex({ user_id: 1 }),
    db.collection('landing_pages').createIndex({ slug: 1 }, { unique: true }),
    db.collection('product_categories').createIndex({ name: 1 }, { unique: true }),
    db.collection('brand_types').createIndex({ name: 1 }, { unique: true }),
    db.collection('products').createIndex({ is_active: 1, sort_order: 1 }),
    db.collection('signature_brands').createIndex({ is_active: 1, sort_order: 1 }),
    db.collection('slides').createIndex({ is_active: 1, sort_order: 1 }),
    db.collection('inquiries').createIndex({ created_at: -1 }),
    db.collection('media_assets').createIndex({ created_at: -1 }),
    db.collection('media_assets').createIndex({ source: 1 }),
    db.collection('media_assets').createIndex({ legacy_name: 1 }),
  ])
}

async function runSeed(db: Db) {
  await ensureIndexes(db)

  const meta = db.collection<{ _id: string; status: string; started_at: Date; finished_at?: Date }>('_meta')
  const existing = await meta.findOne({ _id: 'seed' })
  if (existing?.status === 'done') return
  if (existing && Date.now() - existing.started_at.getTime() < LOCK_STALE_MS) return // another instance is seeding
  if (existing) await meta.deleteOne({ _id: 'seed' })

  try {
    await meta.insertOne({ _id: 'seed', status: 'running', started_at: new Date() })
  } catch {
    return // lost the race to another instance
  }

  try {
    console.log('[seed] Seeding initial data…')
    await seedData(db)
    await meta.updateOne({ _id: 'seed' }, { $set: { status: 'done', finished_at: new Date() } })
    console.log('[seed] Done.')
  } catch (err) {
    await meta.deleteOne({ _id: 'seed' }).catch(() => {})
    throw err
  }
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif',
}

// Uploads an image (local /public path or remote URL) to Cloudinary once and
// returns its Cloudinary URL. Falls back to the original URL on failure.
function createImageImporter(db: Db) {
  const cache = new Map<string, string>()

  return async function importImage(src: string): Promise<string> {
    if (cache.has(src)) return cache.get(src)!

    const already = await mediaAssets(db).findOne({ source: src })
    if (already) {
      cache.set(src, already.url)
      return already.url
    }
    if (!isCloudinaryConfigured()) return src // local /public paths still work as-is

    try {
      let data: Buffer
      let contentType: string
      let originalName: string

      if (src.startsWith('/')) {
        const file = path.join(process.cwd(), 'public', src)
        data = await fs.readFile(file)
        originalName = path.basename(src)
        contentType = CONTENT_TYPES[originalName.split('.').pop()!.toLowerCase()] || 'application/octet-stream'
        // Some .png files in /public are really JPEGs — sniff the bytes.
        if (data[0] === 0xff && data[1] === 0xd8) contentType = 'image/jpeg'
      } else {
        const res = await fetch(src, { signal: AbortSignal.timeout(15000) })
        contentType = res.headers.get('content-type')?.split(';')[0] || ''
        if (!res.ok || !contentType.startsWith('image/')) throw new Error(`HTTP ${res.status} ${contentType}`)
        data = Buffer.from(await res.arrayBuffer())
        originalName = `${new URL(src).pathname.split('/').pop() || 'image'}.${contentType.split('/')[1] || 'jpg'}`
      }

      const { url } = await saveMedia(db, data, { originalName, contentType, source: src })
      cache.set(src, url)
      return url
    } catch (err: any) {
      console.warn(`[seed] Could not import image ${src}: ${err?.message || err}. Keeping original URL.`)
      cache.set(src, src)
      return src
    }
  }
}

async function isEmpty(db: Db, name: string) {
  return (await db.collection(name).countDocuments({}, { limit: 1 })) === 0
}

const id = () => crypto.randomUUID()

async function seedData(db: Db) {
  const importImage = createImageImporter(db)
  const now = new Date()

  if (await isEmpty(db, 'admin_users')) {
    await db.collection('admin_users').insertOne({
      _id: id() as any,
      email: SEED_ADMIN_EMAIL,
      password_hash: SEED_ADMIN_PASSWORD_HASH,
      is_active: true,
      created_at: now,
      last_login_at: null,
    })
  }

  if (await isEmpty(db, 'product_categories')) {
    await db.collection('product_categories').insertMany(
      ['Spices', 'Grains', 'Fresh Produce', 'Dry Fruits', 'Frozen'].map((name) => ({ _id: id() as any, name, created_at: now }))
    )
  }

  if (await isEmpty(db, 'brand_types')) {
    await db.collection('brand_types').insertMany(
      ['KeraZone', 'Fiori'].map((name) => ({ _id: id() as any, name, created_at: now }))
    )
  }

  if (await isEmpty(db, 'slides')) {
    const slides = [
      {
        title: "<strong>Sourcing</strong> the<br/><em>World's Best.</em>",
        subtitle: 'It is trust. It is consistency. It is a promise that travels across borders.',
        badge_text: 'UAE-Based · Global Trading · Est. 2024',
        cta_text: 'Explore Our Range',
        cta_link: '/products',
        image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
        sort_order: 1,
      },
      {
        title: '<strong>Premium</strong> Spices<br/><em>& Commodities.</em>',
        subtitle: 'Direct from the source to your wholesale operations.',
        badge_text: 'Discover Quality',
        cta_text: 'View Products',
        cta_link: '/products',
        image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=80',
        sort_order: 2,
      },
    ]
    const docs = []
    for (const s of slides) {
      docs.push({ _id: id() as any, ...s, media_type: 'image', video_url: null, is_active: true, image_url: await importImage(s.image_url), created_at: now })
    }
    await db.collection('slides').insertMany(docs)
  }

  if (await isEmpty(db, 'products')) {
    const products: [string, string, string, string, string[]][] = [
      ['Cardamom', 'Spices', 'https://images.unsplash.com/photo-1622824497447-b284a5493027?w=400&q=80', 'Premium Jumbo green cardamom pods sourced from high altitude farms.', ['Guatemala', 'India', 'Jumbo Size']],
      ['Black Pepper', 'Spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80', 'High-quality Black Pepper, heavily sorted and cleaned with high ASTA values.', ['Vietnam', 'High ASTA']],
      ['Coffee Beans', 'Spices', 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&q=80', 'Premium globally sourced coffee beans ready for industrial roasting.', ['Raw Beans', 'Vietnam', 'Origins']],
      ['Cloves', 'Spices', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80', 'Long Cloves selected precisely to meet international consistency standards.', ['Long', 'Cambodia']],
      ['Cinnamon', 'Spices', 'https://images.unsplash.com/photo-1737315551131-f6bb19d9aab0?w=400&q=80', 'Authentic Cinnamon bark sourced from trusted South Asian partners.', ['Bark', 'Premium']],
      ['White Rice', 'Grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', 'Multiple varieties of rice including Basmati and White broken rice.', ['5% Broken', 'Long Grain']],
      ['Wheat', 'Grains', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80', 'High protein milling wheat suitable for continuous industrial processing.', ['Hard Red', 'High Protein']],
      ['Coconuts', 'Fresh Produce', 'https://images.unsplash.com/photo-1560769680-ba2f3767c785?w=400&q=80', 'Raw and tender coconuts shipped globally with stringent freshness controls.', ['Raw', 'Tender']],
      ['Mangoes & Avocados', 'Fresh Produce', 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=400&q=80', 'Fresh fruit assortments including avocados, apples, and passion fruit.', ['Seasonal', 'Global Origin']],
      ['Almonds', 'Dry Fruits', 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&q=80', 'Nonpareil Californian almonds, packed for extended shelf life logistics.', ['California', 'Nonpareil']],
      ['Cashews', 'Dry Fruits', 'https://images.unsplash.com/photo-1573555657105-47a0bb37c3ea?w=400&q=80', 'W320 and W240 grade cashews ensuring consistent size and maximum crunch.', ['W320', 'Vietnam']],
      ['Pistachios & Pecans', 'Dry Fruits', 'https://images.unsplash.com/photo-1610137512859-aa919f651a05?w=400&q=80', 'Assortment including Brazil Nuts, Pine Nuts, Hazelnuts and Macadamia.', ['Bulk Deals', 'Premium Quality']],
      ['Frozen Meats', 'Frozen', 'https://images.unsplash.com/photo-1547637205-fde0c9011f9d?w=400&q=80', 'Carefully handled frozen meats and food items meeting strict controls.', ['Regulated', 'Cold Chain']],
    ]
    const docs = []
    for (const [i, [name, category, image, description, tags]] of products.entries()) {
      docs.push({ _id: id() as any, name, category, image_url: await importImage(image), description, tags, is_active: true, sort_order: i + 1, created_at: now })
    }
    await db.collection('products').insertMany(docs)
  }

  if (await isEmpty(db, 'signature_brands')) {
    const brands = [
      {
        name: 'Black Stingless Bee Honey', tagline: "Nature's Rare Sweetness",
        description: 'Sourced from the untouched forests of Kerala, this rare honey is produced by stingless bees (Tetragonula iridipennis). Rich in antioxidants and enzymes, with a unique tangy-sweet profile.',
        origin: 'Kerala, India', packaging: '250g Glass Jar | 5kg Bulk Pail', certification: 'Organic, FSSAI, Lab-Tested',
        moq: '50 units (retail) | 500kg (bulk)', grade: null, image_url: '/brands/kerazone/honey.jpg',
        accent: 'amber', badge: 'Rare', cta_text: 'Request Spec Sheet', brand_type: 'KeraZone',
      },
      {
        name: 'Kerala Green Cardamom', tagline: 'The Queen of Spices',
        description: 'Premium Alleppey Green Cardamom, hand-picked at peak maturity. Bold aroma, vibrant green pods, and high volatile oil content—perfect for gourmet food, beverages, and pharma applications.',
        origin: 'Idukki, Kerala, India', packaging: '1kg Vacuum Pack | 25kg Carton', certification: 'ISO 22000, HACCP, Spice Board Approved',
        moq: '100kg', grade: '8mm+ Bold Pods', image_url: '/brands/kerazone/cardamom.jpg',
        accent: 'emerald', badge: 'Export Grade', cta_text: 'Inquire for Bulk Pricing', brand_type: 'KeraZone',
      },
      {
        name: 'Virgin Coconut Oil (1L)', tagline: 'Pure Goodness in Every Drop.',
        description: 'Our extra virgin coconut oil is cold-pressed from the finest Kerala coconuts. Unrefined, unbleached, and non-deodorized to maintain maximum nutritional value.',
        origin: 'Kerala, India', packaging: '1L Glass Bottle | 20L Bulk Drum', certification: 'HACCP, GMP Certified',
        moq: '200 Litres', grade: null, image_url: '/brands/kerazone/oil.jpg',
        accent: 'forest', badge: null, cta_text: 'Get Quote', brand_type: 'KeraZone',
      },
      {
        name: 'Mangozy', tagline: 'Pure Fruit Solutions',
        description: '100% Premium Alphonso Mango Pulp. Unsweetened. Ideal for manufacturing & catering.',
        origin: 'India', packaging: '3.1 KG Bulk Format Can', certification: 'Export Quality',
        moq: '1 Pallet', grade: '16° - 18° Brix Min', image_url: '/brands/fiori/mangozy.jpg',
        accent: 'terracotta', badge: 'Bestseller', cta_text: 'Partner with Fióri', brand_type: 'Fiori',
      },
    ]
    const docs = []
    for (const [i, b] of brands.entries()) {
      docs.push({ _id: id() as any, ...b, image_url: await importImage(b.image_url), is_active: true, sort_order: i + 1, created_at: now })
    }
    await db.collection('signature_brands').insertMany(docs)
  }

  // Put the site's own images into the media library too.
  for (const dir of ['images', 'images/pepper', 'brands/kerazone', 'brands/fiori']) {
    const files = await fs.readdir(path.join(process.cwd(), 'public', dir)).catch(() => [] as string[])
    for (const f of files) {
      if (/\.(jpe?g|png|webp|gif|svg)$/i.test(f)) await importImage(`/${dir}/${f}`)
    }
  }
}
