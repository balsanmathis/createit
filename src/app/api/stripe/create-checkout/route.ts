import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { plan, promoCode } = await request.json()
    const planConfig = PLANS[plan as keyof typeof PLANS]
    if (!planConfig) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    // Look up promotion code in Stripe if provided
    let discounts: { promotion_code: string }[] | undefined
    if (promoCode?.trim()) {
      try {
        const promoCodes = await stripe.promotionCodes.list({ code: promoCode.trim(), limit: 1, active: true })
        if (promoCodes.data.length > 0) {
          discounts = [{ promotion_code: promoCodes.data[0].id }]
        }
      } catch {
        // Invalid promo code — ignore, let Stripe handle it
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?success=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      customer_email: user.email,
      allow_promotion_codes: !discounts,  // show Stripe's own promo field if no pre-applied code
      ...(discounts ? { discounts } : {}),
      metadata: { user_id: user.id, plan },
      subscription_data: { metadata: { user_id: user.id, plan } },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du checkout' }, { status: 500 })
  }
}
