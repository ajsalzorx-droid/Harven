import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { createDoc, handle, listDocs } from '@/lib/db/admin-crud'

// Admin list includes drafts (is_active = false).
export async function GET() {
  if (!(await requireAdmin())) return unauthorized()
  return handle(() => listDocs('products'))
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized()
  const body = await req.json().catch(() => null)
  return handle(() => createDoc('products', body))
}
