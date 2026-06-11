import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/dashboard', '/generate', '/sites', '/settings', '/analytics', '/prompt-builder', '/editor']
const ALLOWED_BOTS = [
  'googlebot',
  'google-inspectiontool',
  'bingbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'whatsapp',
]
const BLOCKED_UA_FRAGMENTS = ['curl', 'wget', 'python-requests', 'scrapy', 'go-http-client']
const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/api/auth/']

function isUserAgentBlocked(ua: string): boolean {
  if (ALLOWED_BOTS.some(bot => ua.includes(bot))) return false
  if (BLOCKED_UA_FRAGMENTS.some(f => ua.includes(f))) return true
  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ua = (request.headers.get('user-agent') ?? '').toLowerCase()
  const acceptLang = request.headers.get('accept-language')
  const isAllowedBot = ALLOWED_BOTS.some(bot => ua.includes(bot))

  if (isUserAgentBlocked(ua)) {
    console.warn(`[security] Blocked UA "${ua}" on ${pathname}`)
    return new NextResponse(null, { status: 403 })
  }

  if (!acceptLang && !isAllowedBot) {
    console.warn(`[security] No accept-language on ${pathname} from UA "${ua}"`)
    return new NextResponse(null, { status: 403 })
  }

  if (AUTH_PATHS.some(p => pathname.startsWith(p)) && request.method === 'POST') {
    await new Promise(r => setTimeout(r, 500))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user = null
  try {
    const { data: { user: u }, error } = await supabase.auth.getUser()
    if (!error) user = u
  } catch {
    // non-fatal — treat as unauthenticated
  }

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  supabaseResponse.headers.set('X-DNS-Prefetch-Control', 'on')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('X-Frame-Options', 'SAMEORIGIN')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
