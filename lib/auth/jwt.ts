import { SignJWT, jwtVerify } from 'jose'

export const ADMIN_SESSION_COOKIE = 'harven_admin_session'
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8 // 8 hours

const ISSUER = 'harven-admin'
const AUDIENCE = 'harven-admin'

export type AdminTokenPayload = {
  sid: string   // admin_sessions.id
  sub: string   // admin_users._id
  email: string
}

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be set (at least 32 characters)')
  }
  return new TextEncoder().encode(secret)
}

export async function signAdminToken({ sid, sub, email }: AdminTokenPayload) {
  return new SignJWT({ sid, email })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_TTL_SECONDS}s`)
    .sign(getSecret())
}

// Returns null for any missing, tampered, expired or malformed token (fails closed).
export async function verifyAdminToken(token: string | undefined | null): Promise<AdminTokenPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ['HS256'],
    })
    if (typeof payload.sid !== 'string' || typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      return null
    }
    return { sid: payload.sid, sub: payload.sub, email: payload.email }
  } catch (err: any) {
    if (err?.message?.includes('ADMIN_JWT_SECRET')) console.error(err.message)
    return null
  }
}
