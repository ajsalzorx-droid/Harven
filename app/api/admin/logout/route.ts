import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from '@/lib/auth/jwt'
import { deleteAdminSession } from '@/lib/auth/session'

export async function POST() {
  try {
    // Use the signed token itself (not the full session check), so the session
    // row is removed even if it has already expired.
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value
    const payload = await verifyAdminToken(token)
    if (payload) await deleteAdminSession(payload.sid)
  } catch (err) {
    console.error('Admin logout error:', err)
  }

  const res = NextResponse.json({ success: true })
  res.cookies.delete(ADMIN_SESSION_COOKIE)
  return res
}
