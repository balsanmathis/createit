import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/ratelimit'
import { sendVerificationEmail } from '@/lib/email'

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
      body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return true
  }
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()

  const allowed = await checkRateLimit('signup', ip, 3, '1 m')
  if (!allowed) {
    return NextResponse.json({ error: 'Trop de tentatives, réessayez dans 1 minute' }, { status: 429 })
  }

  const body = await request.json()
  const { email, password, turnstileToken, openTime } = body

  // Behavioral check: form submitted too fast = bot
  if (!openTime || Date.now() - openTime < 2000) {
    await new Promise(r => setTimeout(r, 1000))
    return NextResponse.json({ ok: true })
  }

  // Disposable email check
  const domain = typeof email === 'string' ? email.split('@')[1]?.toLowerCase() : ''
  if (!domain || DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ error: 'Veuillez utiliser une adresse email professionnelle' }, { status: 400 })
  }

  // Turnstile verification
  const turnstileValid = await verifyTurnstile(turnstileToken, ip)
  if (!turnstileValid) {
    await new Promise(r => setTimeout(r, 1000))
    return NextResponse.json({ ok: true })
  }

  const supabase = adminClient()

  // Create user via admin API — does NOT send any email, bypasses Supabase SMTP rate limits
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  })

  if (error) {
    const msg = error.message ?? ''
    return NextResponse.json(
      {
        error: msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')
          ? 'Un compte existe déjà avec cet email. Connectez-vous.'
          : msg,
      },
      { status: 400 }
    )
  }

  // Generate a verification link and send it via Resend (no Supabase SMTP involved)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.create-it.app'
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: { redirectTo: `${siteUrl}/auth/callback` },
  })

  if (!linkError && linkData?.properties?.action_link) {
    await sendVerificationEmail(email, linkData.properties.action_link).catch(err =>
      console.error('[signup] sendVerificationEmail failed:', err)
    )
  } else {
    console.error('[signup] generateLink failed:', linkError)
  }

  return NextResponse.json({
    user: { id: data.user?.id, email: data.user?.email },
    needsVerification: true,
  })
}
