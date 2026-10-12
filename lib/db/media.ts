import { GridFSBucket, type Db } from 'mongodb'
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/cloudinary'

// Images/videos are stored on Cloudinary. MongoDB keeps one record per file in
// `media_assets` (Cloudinary URL + public_id); content documents store the URL.

export type MediaAsset = {
  _id: string
  public_id: string
  url: string
  resource_type: string
  format: string | null
  bytes: number
  width: number | null
  height: number | null
  original_name: string
  content_type: string
  source: string | null      // original location when imported (seed / migration)
  legacy_name: string | null // GridFS file name this was migrated from
  created_at: Date
}

const COLLECTION = 'media_assets'

export const MEDIA_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export function mediaAssets(db: Db) {
  return db.collection<MediaAsset>(COLLECTION)
}

// `data` is the file bytes, or a remote URL for Cloudinary to fetch.
export async function saveMedia(
  db: Db,
  data: Buffer | Uint8Array | string,
  opts: { originalName: string; contentType: string; source?: string; legacyName?: string }
) {
  const id = crypto.randomUUID()
  const result = await uploadToCloudinary(typeof data === 'string' ? data : Buffer.from(data), id)

  const asset: MediaAsset = {
    _id: id,
    public_id: result.public_id,
    url: result.secure_url,
    resource_type: result.resource_type,
    format: result.format ?? null,
    bytes: result.bytes,
    width: result.width ?? null,
    height: result.height ?? null,
    original_name: opts.originalName,
    content_type: opts.contentType,
    source: opts.source ?? null,
    legacy_name: opts.legacyName ?? null,
    created_at: new Date(),
  }
  await mediaAssets(db).insertOne(asset)
  return { name: id, url: asset.url }
}

export async function findMedia(db: Db, id: string) {
  return mediaAssets(db).findOne({ _id: id })
}

export async function listMedia(db: Db, limit = 200) {
  const assets = await mediaAssets(db).find({}).sort({ created_at: -1 }).limit(limit).toArray()
  return assets.map((a) => ({
    id: a._id,
    name: a._id,
    url: a.url,
    created_at: a.created_at,
    metadata: { size: a.bytes, mimetype: a.content_type, originalName: a.original_name },
  }))
}

export async function deleteMedia(db: Db, id: string) {
  const asset = await findMedia(db, id)
  if (!asset) return
  await deleteFromCloudinary(asset.public_id, asset.resource_type)
  await mediaAssets(db).deleteOne({ _id: id })
}

// ─── Legacy GridFS storage (files uploaded before the move to Cloudinary) ───
// Kept read-only as a backup; served by GET /api/media/<name>.

export type LegacyMediaFile = {
  _id: string
  length: number
  uploadDate: Date
  metadata?: { contentType?: string; originalName?: string; source?: string }
}

export const LEGACY_MEDIA_NAME_RE = /^[0-9a-f-]{36}\.[a-z0-9]{1,10}$/

export function legacyMediaBucket(db: Db) {
  return new GridFSBucket(db, { bucketName: 'media' })
}

export function findLegacyMedia(db: Db, name: string) {
  return db.collection<LegacyMediaFile>('media.files').findOne({ _id: name })
}
