import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { generateWelcomeCode, sendWelcomeEmail } from '@/lib/email'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Find or create the base WELCOME20 coupon in Stripe
async function getOrCreateWelcomeCoupon(): Promise<string> {
  const list = await stripe.coupons.list({ limit: 100 })
  const existing = list.data.find(c => c.name === 'WELCOME20-BASE')

  if (existing) return existing.id

  const coupon = await stripe.coupons.create({
    name: 'WELCOME20-BASE',
    percent_off: 20,
    duration: 'forever',
    currency: 'eur',
  })
  return coupon.id
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    const db = serviceClient()

    // Find user by email
    const { data: user } = await db
      .from('users')
      .select('id, welcome_code, tokens_limit')
      .eq('email', email)
      .single()

    if (!user) {
      // User not in public.users yet — might be lag from trigger
      // Return success silently to not block signup
      return NextResponse.json({ ok: true })
    }

    // Idempotent — only create code once
    if (user.welcome_code) {
      return NextResponse.json({ ok: true, code: user.welcome_code })
    }

    const code = generateWelcomeCode()

    // Create Stripe promotion code (expires in 48h, single use)
    try {
      const couponId = await getOrCreateWelcomeCoupon()
      await stripe.promotionCodes.create({
        promotion: { type: 'coupon', coupon: couponId },
        code,
        max_redemptions: 1,
        expires_at: Math.floor(Date.now() / 1000) + 48 * 3600,
        metadata: { user_id: user.id, email },
      })
    } catch (stripeErr) {
      console.error('[welcome] Stripe promo code creation failed:', stripeErr)
      // Don't block the welcome email if Stripe fails
    }

    // Save code in Supabase
    await db.from('users').update({ welcome_code: code }).eq('id', user.id)

    // Send welcome email
    await sendWelcomeEmail(email, code)

    return NextResponse.json({ ok: true, code })
  } catch (error) {
    console.error('[welcome] error:', error)
    // Always return 200 to not break signup UX
    return NextResponse.json({ ok: true })
  }
}
