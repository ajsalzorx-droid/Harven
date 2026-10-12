import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { handle, reorderDocs } from '@/lib/db/admin-crud'

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return unauthorized()
  const body = await req.json().catch(() => null)
  return handle(() => reorderDocs('products', body))
}
