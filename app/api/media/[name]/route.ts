import { Readable } from 'node:stream'
import { getDb, isDbConfigured } from '@/lib/db/mongo'
import { findLegacyMedia, legacyMediaBucket, LEGACY_MEDIA_NAME_RE } from '@/lib/db/media'

type Ctx = { params: Promise<{ name: string }> }

// Serves files uploaded before the move to Cloudinary (kept in GridFS as a
// backup). New uploads use Cloudinary URLs directly. Supports Range requests.
export async function GET(req: Request, { params }: Ctx) {
  const { name } = await params
  if (!LEGACY_MEDIA_NAME_RE.test(name)|| !isDbConfigured()) return new Response('Not found', { status: 404 })

  try {
    const db = await getDb()
    const file = await findLegacyMedia(db, name)
    if (!file) return new Response('Not found', { status: 404 })

    const size = file.length
    const headers: Record<string, string> = {
      'Content-Type': file.metadata?.contentType || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
      // Names are unique and files are never modified in place.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    }
    if (headers['Content-Type'] === 'image/svg+xml') {
      headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox"
    }

    const range = req.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/)
    if (range && size > 0) {
      let start = range[1] ? Number(range[1]) : size - Number(range[2])
      let end = range[1] && range[2] ? Number(range[2]) : size - 1
      start = Math.max(0, start)
      end = Math.min(end, size - 1)
      if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
      }
      const stream = legacyMediaBucket(db).openDownloadStream(name as any, { start, end: end + 1 })
      return new Response(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) },
      })
    }

    const stream = legacyMediaBucket(db).openDownloadStream(name as any)
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: { ...headers, 'Content-Length': String(size) },
    })
  } catch (err) {
    console.error('Media serve error:', err)
    return new Response('Server error', { status: 500 })
  }
}
