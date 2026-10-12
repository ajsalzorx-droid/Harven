import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { handle, reorderDocs } from '@/lib/db/admin-crud'

type Ctx = { params: Promise<{ collection: string }> }

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { collection } = await params
  const body = await req.json().catch(() => null)
  return handle(() => reorderDocs(collection, body))
}
