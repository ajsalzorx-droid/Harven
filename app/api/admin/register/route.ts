import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/mongo'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { hashPassword, validateNewCredentials } from '@/lib/auth/password'

// Registers a new admin. Only an already logged-in admin can do this —
// there is no public sign-up. The first admin is created by the first-run seed (lib/db/seed.ts).
export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized()

  const body = await req.json().catch(() => null)
  const parsed = validateNewCredentials(body?.email, body?.password)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const db = await getDb()
  const admin = {
    _id: crypto.randomUUID(),
    email: parsed.email,
    password_hash: await hashPassword(parsed.password),
    is_active: true,
    created_at: new Date(),
    last_login_at: null,
  }

  try {
    await db.collection('admin_users').insertOne(admin as any)
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 409 })
    }
    console.error('Admin register error:', error)
    return NextResponse.json({ error: 'Failed to register admin' }, { status: 500 })
  }

  return NextResponse.json({ admin: { id: admin._id, email: admin.email, created_at: admin.created_at } }, { status: 201 })
}
