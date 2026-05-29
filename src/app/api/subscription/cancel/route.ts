import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { Resend } from 'resend'
import { checkRateLimit } from '@/lib/ratelimit'
import { headers } from 'next/headers'

function getAdmin() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  try {
    // Rate limit: 3 requests per hour per IP
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const allowed = await checkRateLimit('cancel-subscription', ip, 3, '1 h')
    if (!allowed) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une heure.' }, { status: 429 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const reason = typeof body.reason === 'string' ? body.reason : ''

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, status, plan')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé.' }, { status: 404 })
    }

    if (subscription.status === 'canceling') {
      return NextResponse.json({ error: 'Votre abonnement est déjà en cours de résiliation.' }, { status: 400 })
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json({ error: 'Identifiant d\'abonnement Stripe manquant.' }, { status: 400 })
    }

    // Cancel at period end via Stripe
    const updated = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Determine cancel date (cancel_at is Unix timestamp when set, else fallback 30 days)
    const cancelAtTimestamp = (updated as { cancel_at?: number | null }).cancel_at
    const cancelAt = cancelAtTimestamp
      ? new Date(cancelAtTimestamp * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Update Supabase subscriptions table
    const admin = getAdmin()
    await admin.from('subscriptions').update({
      status: 'canceling',
      cancel_at: cancelAt,
    }).eq('user_id', user.id)

    // Log to cancellations table (best-effort)
    try {
      await admin.from('cancellations').insert({
        user_id: user.id,
        reason: reason || null,
        date: new Date().toISOString(),
        plan: subscription.plan || 'unknown',
      })
    } catch {
      // Table might not exist yet — non-blocking
    }

    // Send confirmation email via Resend (best-effort)
    if (process.env.RESEND_API_KEY && user.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const cancelDateFr = new Date(cancelAt).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long', year: 'numeric',
        })
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'CreateIt <hello@create-it.app>',
          to: user.email,
          subject: 'Votre résiliation CreateIt a été prise en compte',
          html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:40px 20px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #e2e8f0;">
<p style="font-size:24px;margin:0 0 16px">📋</p>
<h1 style="font-size:22px;font-weight:800;margin:0 0 12px">Résiliation confirmée</h1>
<p style="font-size:15px;color:#64748b;line-height:1.6;margin:0 0 20px">
  Votre résiliation a bien été prise en compte.<br>
  Votre accès <strong>Plan ${subscription.plan}</strong> reste actif jusqu'au <strong>${cancelDateFr}</strong>.
  Après cette date, votre compte passe automatiquement en plan gratuit.
</p>
<p style="font-size:13px;color:#94a3b8;">Vous pouvez réactiver votre abonnement à tout moment depuis <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://create-it.app'}/settings/subscription" style="color:#2563eb;">votre espace abonnement</a>.</p>
<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
<p style="font-size:12px;color:#94a3b8;margin:0">© 2025 CreateIt · <a href="https://create-it.app" style="color:#2563eb;text-decoration:none;">create-it.app</a></p>
</div></body></html>`,
        })
      } catch {
        // Email failure is non-blocking
      }
    }

    return NextResponse.json({ success: true, cancelAt })
  } catch (err) {
    console.error('[cancel-subscription]', err)
    return NextResponse.json({ error: 'Erreur lors de la résiliation. Réessayez.' }, { status: 500 })
  }
}
