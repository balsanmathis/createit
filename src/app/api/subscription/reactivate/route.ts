import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé.' }, { status: 404 })
    }

    if (subscription.status !== 'canceling') {
      return NextResponse.json({ error: 'Votre abonnement n\'est pas en cours de résiliation.' }, { status: 400 })
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json({ error: 'Identifiant d\'abonnement Stripe manquant.' }, { status: 400 })
    }

    // Remove cancel_at_period_end
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false,
    })

    // Update Supabase
    await supabase.from('subscriptions').update({
      status: 'active',
      cancel_at: null,
    }).eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[reactivate-subscription]', err)
    return NextResponse.json({ error: 'Erreur lors de la réactivation.' }, { status: 500 })
  }
}
