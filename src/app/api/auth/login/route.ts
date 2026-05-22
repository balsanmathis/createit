import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()

  const allowed = await checkRateLimit('login', ip, 10, '1 m')
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives, réessayez dans 1 minute' },
      { status: 429 }
    )
  }

  const { email, password } = await request.json()

  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies)
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message === 'Invalid login credentials'
            ? 'Email ou mot de passe incorrect.'
            : error.message,
      },
      { status: 400 }
    )
  }

  const response = NextResponse.json({ ok: true })
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )
  return response
}
