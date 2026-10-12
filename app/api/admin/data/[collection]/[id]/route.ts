import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { deleteDoc, getDoc, handle, updateDoc } from '@/lib/db/admin-crud'

type Ctx = { params: Promise<{ collection: string; id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { collection, id } = await params
  return handle(() => getDoc(collection, id))
}

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { collection, id } = await params
  const body = await req.json().catch(() => null)
  return handle(() => updateDoc(collection, id, body))
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { collection, id } = await params
  return handle(() => deleteDoc(collection, id))
}
