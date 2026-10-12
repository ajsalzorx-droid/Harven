import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { handle } from '@/lib/db/admin-crud'
import { getDb } from '@/lib/db/mongo'
import { listMedia } from '@/lib/db/media'

export async function GET() {
  if (!(await requireAdmin())) return unauthorized()
  return handle(async () => NextResponse.json({ files: await listMedia(await getDb()) }))
}
