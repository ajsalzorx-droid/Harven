import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { deleteDoc, handle, updateDoc } from '@/lib/db/admin-crud'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { id } = await params
  const body = await req.json().catch(() => null)
  return handle(() => updateDoc('products', id, body))
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { id } = await params
  return handle(() => deleteDoc('products', id))
}
