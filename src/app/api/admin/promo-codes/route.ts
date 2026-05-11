import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) return null
  return user
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const [coupons, promoCodes] = await Promise.all([
      stripe.coupons.list({ limit: 50 }),
      stripe.promotionCodes.list({ limit: 50 }),
    ])

    const result = promoCodes.data.map(pc => {
      const couponRef = pc.promotion?.coupon
      const couponId = typeof couponRef === 'string' ? couponRef : (couponRef as { id?: string } | null)?.id
      const coupon = coupons.data.find(c => c.id === couponId)
      return {
        id: pc.id,
        code: pc.code,
        active: pc.active,
        timesRedeemed: pc.times_redeemed,
        maxRedemptions: pc.max_redemptions,
        expiresAt: pc.expires_at,
        couponName: coupon?.name ?? '—',
        percentOff: coupon?.percent_off ?? null,
        amountOff: coupon?.amount_off ?? null,
        duration: coupon?.duration ?? 'once',
      }
    })

    return NextResponse.json({ promoCodes: result })
  } catch (error) {
    console.error('Promo codes GET error:', error)
    return NextResponse.json({ error: 'Erreur Stripe' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  try {
    const { code, percentOff, duration, maxRedemptions } = await request.json()

    if (!code?.trim()) return NextResponse.json({ error: 'Code requis' }, { status: 400 })
    if (!percentOff || percentOff < 1 || percentOff > 100) {
      return NextResponse.json({ error: 'Pourcentage invalide (1-100)' }, { status: 400 })
    }

    const coupon = await stripe.coupons.create({
      name: code.toUpperCase(),
      percent_off: Number(percentOff),
      duration: duration ?? 'once',
      currency: 'eur',
    })

    const promoCode = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code: code.toUpperCase(),
      ...(maxRedemptions ? { max_redemptions: Number(maxRedemptions) } : {}),
    })

    return NextResponse.json({ ok: true, promoCode: { id: promoCode.id, code: promoCode.code } })
  } catch (error: unknown) {
    console.error('Promo code create error:', error)
    const msg = error instanceof Error ? error.message : 'Erreur lors de la création'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
