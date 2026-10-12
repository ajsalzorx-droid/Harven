import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/jwt'
import { getValidAdminSession } from '@/lib/auth/session'

const ADMIN_LOGIN_PAGE = '/admin/login'
const ADMIN_LOGIN_API = '/api/admin/login'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/')

  if ((isAdminPage || isAdminApi) && pathname !== ADMIN_LOGIN_API) {
    // Verifies the JWT and the session row in the DB
    const session = await getValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)

    if (pathname === ADMIN_LOGIN_PAGE) {
      if (session) return NextResponse.redirect(new URL('/admin', request.url))
    } else if (!session) {
      const res = isAdminApi
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL(ADMIN_LOGIN_PAGE, request.url))
      res.cookies.delete(ADMIN_SESSION_COOKIE)
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  runtime: 'nodejs',
  // Only admin pages and admin APIs need the session check.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
