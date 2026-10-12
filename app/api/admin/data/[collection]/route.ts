import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { createDoc, handle, listDocs } from '@/lib/db/admin-crud'

type Ctx = { params: Promise<{ collection: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { collection } = await params
  return handle(() => listDocs(collection))
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized()
  const { collection } = await params
  const body = await req.json().catch(() => null)
  return handle(() => createDoc(collection, body))
}
