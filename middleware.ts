import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/auth/jwt'
import { getValidAdminSession } from '@/lib/auth/session'

const ADMIN_LOGIN_PAGE = '/admin/login'
const ADMIN_LOGIN_API = '/api/admin/login'

// Admin responses depend on the session cookie and on the RSC request headers,
// so shared caches (e.g. Hostinger's CDN) must never store them.
function noStore(res: NextResponse) {
  res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate')
  res.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Cookie')
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminApi = pathname === '/api/admin' || pathname.startsWith('/api/admin/')

  if ((isAdminPage || isAdminApi) && pathname !== ADMIN_LOGIN_API) {
    // Verifies the JWT and the session row in the DB
    const session = await getValidAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)

    if (pathname === ADMIN_LOGIN_PAGE) {
      if (session) return noStore(NextResponse.redirect(new URL('/admin', request.url)))
    } else if (!session) {
      const res = isAdminApi
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL(ADMIN_LOGIN_PAGE, request.url))
      res.cookies.delete(ADMIN_SESSION_COOKIE)
      return noStore(res)
    }
  }

  return noStore(NextResponse.next())
}

export const config = {
  runtime: 'nodejs',
  // Only admin pages and admin APIs need the session check.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
