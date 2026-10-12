import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db/mongo'
import { adminCookieOptions, createAdminSession } from '@/lib/auth/session'
import { verifyDummyPassword, verifyPassword } from '@/lib/auth/password'

// Simple per-IP brute-force throttle (per server instance).
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10
const attempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > MAX_ATTEMPTS
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!email || !password || email.length > 254 || password.length > 200) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  try {
    const db = await getDb()
    const admin = await db
      .collection<{ _id: string; email: string; password_hash: string; is_active: boolean }>('admin_users')
      .findOne({ email })

    const valid = admin
      ? await verifyPassword(password, admin.password_hash)
      : await verifyDummyPassword(password)

    if (!admin || !valid || !admin.is_active) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const { token, expiresAt } = await createAdminSession({
      userId: admin._id,
      email: admin.email,
      ip: ip === 'unknown' ? null : ip,
      userAgent: req.headers.get('user-agent'),
    })
    await db.collection('admin_users').updateOne({ _id: admin._id as any }, { $set: { last_login_at: new Date() } })

    attempts.delete(ip)
    const res = NextResponse.json({ success: true })
    res.cookies.set({ ...adminCookieOptions(expiresAt), value: token })
    return res
  } catch (err: any) {
    console.error('Admin login error:', err)
    // Show the real cause locally (e.g. missing env var, table not created); stay generic in production.
    const detail = process.env.NODE_ENV === 'development' ? `: ${err?.message || err}` : ''
    return NextResponse.json({ error: `Login is temporarily unavailable${detail}` }, { status: 500 })
  }
}
