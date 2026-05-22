import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { checkRateLimit } from '@/lib/ratelimit'

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com',
  'throwaway.email', 'sharklasers.com', 'guerrillamailblock.com',
  'grr.la', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de',
  'guerrillamail.net', 'guerrillamail.org', 'spam4.me', 'trashmail.com',
  'trashmail.me', 'trashmail.net', 'mailnull.com', 'spamgourmet.com',
  'discard.email', 'spamspot.com', 'dispostable.com', 'maildrop.cc',
  'getairmail.com', 'fakeinbox.com', 'filzmail.com', 'spamfree24.org',
  'spamgob.com', 'tempr.email', 'nwldx.com', 'spam.la',
])

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!process.env.TURNSTILE_SECRET_KEY) return true
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v1/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return true
  }
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()

  const allowed = await checkRateLimit('signup', ip, 3, '1 m')
  if (!allowed) {
    return NextResponse.json(
      { error: 'Trop de tentatives, réessayez dans 1 minute' },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { email, password, turnstileToken, openTime } = body

  // Behavioral check: form submitted too fast = bot
  if (!openTime || Date.now() - openTime < 2000) {
    await new Promise(r => setTimeout(r, 1000))
    return NextResponse.json({ ok: true }) // silent reject
  }

  // Disposable email check
  const domain = typeof email === 'string' ? email.split('@')[1]?.toLowerCase() : ''
  if (!domain || DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json(
      { error: 'Veuillez utiliser une adresse email professionnelle' },
      { status: 400 }
    )
  }

  // Turnstile verification
  const turnstileValid = await verifyTurnstile(turnstileToken, ip)
  if (!turnstileValid) {
    await new Promise(r => setTimeout(r, 1000))
    return NextResponse.json({ ok: true }) // silent reject
  }

  // Create the user via Supabase
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

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return NextResponse.json(
      {
        error:
          error.message === 'User already registered'
            ? 'Un compte existe déjà avec cet email. Connectez-vous.'
            : error.message,
      },
      { status: 400 }
    )
  }

  const response = NextResponse.json({ user: { id: data.user?.id, email: data.user?.email } })
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )
  return response
}
