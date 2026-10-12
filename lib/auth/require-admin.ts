import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from './jwt'
import { getValidAdminSession } from './session'

// Use at the top of every admin route handler. Middleware also checks this,
// but route handlers must never rely on middleware alone.
export async function requireAdmin() {
  const cookieStore = await cookies()
  return getValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
  

}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
