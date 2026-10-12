import { getDb, isDbConfigured, toApi } from './mongo'

// Public, read-only queries. They never throw: on a missing/unreachable DB
// they return empty results so pages fall back to their built-in content.

async function safeList(collection: string, filter: object, sort: Record<string, 1 | -1>, limit?: number) {
  if (!isDbConfigured()) return []
  try {
    const db = await getDb()
    let cursor = db.collection(collection).find(filter).sort(sort)
    if (limit) cursor = cursor.limit(limit)
    const docs = await cursor.toArray()
    return docs.map((d) => toApi(d)!) as any[]
  } catch (err) {
    console.error(`DB read failed (${collection}):`, err)
    return []
  }
}

export const getActiveProducts = (limit?: number) =>
  safeList('products', { is_active: true }, { sort_order: 1 }, limit)

export const getActiveSignatureBrands = (limit?: number) =>
  safeList('signature_brands', { is_active: true }, { sort_order: 1 }, limit)

export const getActiveSlides = () =>
  safeList('slides', { is_active: true }, { sort_order: 1 })

export async function getPublishedLandingPage(slug: string) {
  if (!isDbConfigured()) return null
  try {
    const db = await getDb()
    return toApi(await db.collection('landing_pages').findOne({ slug, is_published: true }))
  } catch (err) {
    console.error('DB read failed (landing_pages):', err)
    return null
  }
}

export async function getProductCategoryNames(): Promise<string[]> {
  const rows = await safeList('product_categories', {}, { name: 1 })
  return rows.map((r) => r.name).filter(Boolean)
}

// Options for the contact form "Product Interest" dropdown: every active
// product and signature-brand product, in display order, without duplicates.
export async function getProductInterestOptions(): Promise<string[]> {
  const [products, brands] = await Promise.all([getActiveProducts(), getActiveSignatureBrands()])
  return Array.from(new Set([...products, ...brands].map((p) => p.name).filter(Boolean)))
}
