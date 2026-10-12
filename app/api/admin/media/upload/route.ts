import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { handle } from '@/lib/db/admin-crud'
import { getDb } from '@/lib/db/mongo'
import { saveMedia } from '@/lib/db/media'
import { isCloudinaryConfigured } from '@/lib/cloudinary'

const MAX_BYTES = 100 * 1024 * 1024 // 100 MB (hero videos; Cloudinary free plan: images 10 MB, videos 100 MB)
const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|gif|avif|svg\+xml)|video\/(mp4|webm|quicktime)|application\/pdf)$/

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized()
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: 'Media storage is not configured (CLOUDINARY_* env vars missing)' }, { status: 503 })
  }

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File is too large (max 100 MB)' }, { status: 413 })
  }
  if (!ALLOWED_TYPES.test(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
  }

  return handle(async () => {
    const db = await getDb()
    const { name, url } = await saveMedia(db, new Uint8Array(await file.arrayBuffer()), {
      originalName: file.name,
      contentType: file.type,
    })
    return NextResponse.json({ fileName: name, publicUrl: url }, { status: 201 })
  })
}
