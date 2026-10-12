import type { Db } from 'mongodb'
import { isCloudinaryConfigured } from '@/lib/cloudinary'
import { legacyMediaBucket, mediaAssets, saveMedia, type LegacyMediaFile } from './media'

// One-time move of files from MongoDB GridFS to Cloudinary. Every
// "/api/media/<name>" URL saved in content is rewritten to the Cloudinary URL.
// GridFS files are left in place as a backup. Safe to re-run: files already
// copied are skipped, and it only marks itself done when every file succeeded.

const MIGRATION_ID = 'migrate_gridfs_to_cloudinary'
const LOCK_STALE_MS = 15 * 60 * 1000

// Fields that can hold an image/video URL.
const URL_FIELDS: Record<string, string[]> = {
  products: ['image_url'],
  signature_brands: ['image_url'],
  slides: ['image_url', 'video_url'],
  landing_pages: ['hero_image_url'],
}

async function readGridfsFile(db: Db, name: string) {
  const chunks: Buffer[] = []
  for await (const chunk of legacyMediaBucket(db).openDownloadStream(name as any)) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks)
}

export async function migrateGridfsToCloudinary(db: Db) {
  if (!isCloudinaryConfigured()) return

  const meta = db.collection<{ _id: string; status: string; started_at: Date; [k: string]: unknown }>('_meta')
  const existing = await meta.findOne({ _id: MIGRATION_ID })
  if (existing?.status === 'done') return
  if (existing?.status === 'running' && Date.now() - existing.started_at.getTime() < LOCK_STALE_MS) return

  // Take the lock (upsert on a stale/failed run, insert on the first run).
  const lock = await meta.findOneAndUpdate(
    { _id: MIGRATION_ID, $or: [{ status: { $ne: 'running' } }, { started_at: { $lt: new Date(Date.now() - LOCK_STALE_MS) } }] },
    { $set: { status: 'running', started_at: new Date() } },
    { upsert: true, returnDocument: 'after' }
  ).catch(() => null) // duplicate key = another instance holds a fresh lock
  if (!lock) return

  const files = await db.collection<LegacyMediaFile>('media.files').find({}).toArray()
  const urlMap = new Map<string, string>() // "/api/media/<name>" -> Cloudinary URL
  let failed = 0

  if (files.length > 0) console.log(`[media] Copying ${files.length} files from MongoDB to Cloudinary…`)
  for (const f of files) {
    try {
      const done = await mediaAssets(db).findOne({ legacy_name: f._id })
      const url = done
        ? done.url
        : (await saveMedia(db, await readGridfsFile(db, f._id), {
            originalName: f.metadata?.originalName || f._id,
            contentType: f.metadata?.contentType || 'application/octet-stream',
            source: f.metadata?.source,
            legacyName: f._id,
          })).url
      urlMap.set(`/api/media/${f._id}`, url)
      urlMap.set(`/api/media/${encodeURIComponent(f._id)}`, url)
    } catch (err: any) {
      failed++
      console.error(`[media] Failed to copy ${f._id}: ${err?.message || err}`)
    }
  }

  // Rewrite stored URLs.
  let updated = 0
  for (const [collection, fields] of Object.entries(URL_FIELDS)) {
    const docs = await db.collection(collection).find({ $or: fields.map((f) => ({ [f]: { $regex: '^/api/media/' } })) }).toArray()
    for (const doc of docs) {
      const $set: Record<string, string> = {}
      for (const f of fields) if (urlMap.has(doc[f])) $set[f] = urlMap.get(doc[f])!
      if (Object.keys($set).length) {
        await db.collection(collection).updateOne({ _id: doc._id }, { $set })
        updated++
      }
    }
  }

  // Landing page content blocks are free-form JSON: replace URLs anywhere inside.
  for (const page of await db.collection('landing_pages').find({ content_blocks: { $ne: null } }).toArray()) {
    let json = JSON.stringify(page.content_blocks)
    const before = json
    for (const [from, to] of urlMap) json = json.split(from).join(to)
    if (json !== before) {
      await db.collection('landing_pages').updateOne({ _id: page._id }, { $set: { content_blocks: JSON.parse(json) } })
      updated++
    }
  }

  await meta.updateOne(
    { _id: MIGRATION_ID },
    { $set: { status: failed ? 'failed' : 'done', finished_at: new Date(), files: files.length, failed, documents_updated: updated } }
  )
  if (files.length > 0) {
    console.log(`[media] Cloudinary migration ${failed ? `finished with ${failed} failures (will retry on next start)` : 'done'}: ${files.length - failed} files, ${updated} documents updated.`)
  }
}
