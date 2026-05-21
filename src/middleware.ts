import { NextRequest, NextResponse } from 'next/server'

const BLOCKED_UA_FRAGMENTS = ['curl', 'wget', 'python-requests', 'scrapy', 'bot', 'crawler', 'spider']

const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/api/auth/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ua = (request.headers.get('user-agent') ?? '').toLowerCase()
  const acceptLang = request.headers.get('accept-language')
  const isAuthPath = AUTH_PATHS.some(p => pathname.startsWith(p))

  if (BLOCKED_UA_FRAGMENTS.some(f => ua.includes(f))) {
    console.warn(`[security] Blocked UA "${ua}" on ${pathname}`)
    return new NextResponse(null, { status: 403 })
  }

  if (!acceptLang) {
    console.warn(`[security] No accept-language on ${pathname} from UA "${ua}"`)
    return new NextResponse(null, { status: 403 })
  }

  // Slow down bots on auth POST requests
  if (isAuthPath && request.method === 'POST') {
    await new Promise(r => setTimeout(r, 500))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)'],
}
