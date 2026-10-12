import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { createDoc, handle } from '@/lib/db/admin-crud'

const TABLES = ['product_categories', 'brand_types']

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized()
  const table = new URL(req.url).searchParams.get('table') || ''
  if (!TABLES.includes(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  const body = await req.json().catch(() => null)
  return handle(() => createDoc(table, body))
}
