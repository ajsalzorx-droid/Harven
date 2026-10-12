import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { handle } from '@/lib/db/admin-crud'
import { getDb } from '@/lib/db/mongo'
import { deleteMedia, findMedia, MEDIA_ID_RE } from '@/lib/db/media'

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized()

  const body = await req.json().catch(() => null)
  const fileName = body?.fileName
  if (typeof fileName !== 'string' || !MEDIA_ID_RE.test(fileName)) {
    return NextResponse.json({ error: 'Invalid fileName' }, { status: 400 })
  }

  return handle(async () => {
    const db = await getDb()
    if (!(await findMedia(db, fileName))) return NextResponse.json({ error: 'File not found' }, { status: 404 })
    await deleteMedia(db, fileName)
    return NextResponse.json({ success: true })
  })
}
