import { getDb } from '@/lib/db/mongo'
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_SECONDS, signAdminToken, verifyAdminToken } from './jwt'

export type AdminSession = {
  id: string
  userId: string
  email: string
}

type SessionDoc = {
  _id: string
  user_id: string
  email: string
  ip: string | null
  user_agent: string | null
  created_at: Date
  expires_at: Date // TTL index removes the row after this time
  revoked_at: Date | null
}

type AdminUserDoc = { _id: string; email: string; password_hash: string; is_active: boolean }

export async function createAdminSession(input: {
  userId: string
  email: string
  ip: string | null
  userAgent: string | null
}) {
  const db = await getDb()
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000)
  const sessionId = crypto.randomUUID()

  await db.collection<SessionDoc>('admin_sessions').insertOne({
    _id: sessionId,
    user_id: input.userId,
    email: input.email,
    ip: input.ip,
    user_agent: input.userAgent?.slice(0, 500) ?? null,
    created_at: new Date(),
    expires_at: expiresAt,
    revoked_at: null,
  })

  const token = await signAdminToken({ sid: sessionId, sub: input.userId, email: input.email })
  return { token, expiresAt }
}

// Verifies the JWT signature/expiry, then checks the session in the DB
// (exists, not revoked, not expired, same user) and that the admin is still active.
export async function getValidAdminSession(token: string | undefined | null): Promise<AdminSession | null> {
  const payload = await verifyAdminToken(token)
  if (!payload) return null

  try {
    const db = await getDb()
    const session = await db.collection<SessionDoc>('admin_sessions').findOne({ _id: payload.sid })
    if (!session || session.revoked_at) return null
    if (session.expires_at.getTime() <= Date.now()) return null
    if (session.user_id !== payload.sub) return null

    const admin = await db
      .collection<AdminUserDoc>('admin_users')
      .findOne({ _id: session.user_id }, { projection: { email: 1, is_active: 1 } })
    if (!admin?.is_active) return null

    return { id: session._id, userId: session.user_id, email: admin.email }
  } catch (err) {
    console.error('Admin session lookup failed:', err)
    return null
  }
}

// Sign-out: remove the session from the DB so the token can never be used again.
export async function deleteAdminSession(sessionId: string) {
  const db = await getDb()
  await db.collection<SessionDoc>('admin_sessions').deleteOne({ _id: sessionId })
}

export function adminCookieOptions(expires: Date) {
  return {
    name: ADMIN_SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    expires,
  }
}
