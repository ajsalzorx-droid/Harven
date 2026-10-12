import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { deleteDoc, handle } from '@/lib/db/admin-crud'

const TABLES = ['product_categories', 'brand_types']
type Ctx = { params: Promise<{ id: string }> }

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { id } = await params
  const table = new URL(req.url).searchParams.get('table') || ''
  if (!TABLES.includes(table)) return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  return handle(() => deleteDoc(table, id))
}
