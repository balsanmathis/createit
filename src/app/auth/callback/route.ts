import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Prefer explicit app URL over origin derived from request (avoids Vercel internal URLs)
  const base = process.env.NEXT_PUBLIC_APP_URL ?? origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${base}${next}`)
    }
  }

  return NextResponse.redirect(`${base}/auth/login?error=callback_error`)
}
