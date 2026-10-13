import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/mongo'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

type AdminUserDoc = { _id: string; email: string; password_hash: string; is_active: boolean }

// Changes the logged-in admin's password. Requires the current password,
// then signs out every other session for this admin.
export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return unauthorized()

  const body = await req.json().catch(() => null)
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''
  const confirmPassword = typeof body?.confirmPassword === 'string' ? body.confirmPassword : ''

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'All password fields are required' }, { status: 400 })
  }
  if (newPassword.length < 8 || newPassword.length > 200) {
    return NextResponse.json({ error: 'New password must be 8–200 characters' }, { status: 400 })
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New password and confirmation do not match' }, { status: 400 })
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: 'New password must be different from the previous password' }, { status: 400 })
  }

  try {
    const db = await getDb()
    const admin = await db.collection<AdminUserDoc>('admin_users').findOne({ _id: session.userId })
    if (!admin) return unauthorized()

    if (currentPassword.length > 200 || !(await verifyPassword(currentPassword, admin.password_hash))) {
      return NextResponse.json({ error: 'Previous password is incorrect' }, { status: 400 })
    }

    await db.collection<AdminUserDoc>('admin_users').updateOne(
      { _id: admin._id },
      { $set: { password_hash: await hashPassword(newPassword), password_changed_at: new Date() } as any }
    )
    // Keep this session; sign out everywhere else.
    await db.collection('admin_sessions').deleteMany({ user_id: admin._id, _id: { $ne: session.id } as any })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin change password error:', err)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
