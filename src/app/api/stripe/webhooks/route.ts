import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { PLAN_TOKEN_LIMITS } from '@/types'
import type Stripe from 'stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function monthFromNow(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details
  if (!subDetails) return null
  const sub = subDetails.subscription
  return typeof sub === 'string' ? sub : sub?.id ?? null
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.user_id
        const plan   = session.metadata?.plan as keyof typeof PLAN_TOKEN_LIMITS | undefined
        const customerId    = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId || !plan) break

        const sub         = await stripe.subscriptions.retrieve(subscriptionId)
        const tokensLimit = PLAN_TOKEN_LIMITS[plan] ?? PLAN_TOKEN_LIMITS.starter

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: sub.status,
          current_period_end: monthFromNow(),
        }, { onConflict: 'user_id' })

        await supabaseAdmin.from('users').upsert({
          id: userId,
          plan,
          tokens_used: 0,
          tokens_limit: tokensLimit,
          sites_used_this_month: 0,
        }, { onConflict: 'id' })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id
        if (!userId) break

        const plan   = (sub.metadata?.plan || 'starter') as keyof typeof PLAN_TOKEN_LIMITS
        const status = sub.status

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          plan,
          status,
          current_period_end: monthFromNow(),
        }, { onConflict: 'user_id' })

        if (status === 'canceled' || status === 'unpaid') {
          await supabaseAdmin.from('users').update({
            plan: 'free',
            tokens_limit: PLAN_TOKEN_LIMITS.free,
            tokens_used: 0,
          }).eq('id', userId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice        = event.data.object as Stripe.Invoice
        const subscriptionId = getSubscriptionIdFromInvoice(invoice)
        if (!subscriptionId) break

        const sub    = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.user_id
        if (!userId) break

        const plan        = (sub.metadata?.plan || 'starter') as keyof typeof PLAN_TOKEN_LIMITS
        const tokensLimit = PLAN_TOKEN_LIMITS[plan] ?? PLAN_TOKEN_LIMITS.starter

        await supabaseAdmin.from('subscriptions').update({
          status: 'active',
          current_period_end: monthFromNow(),
        }).eq('user_id', userId)

        // Monthly reset
        await supabaseAdmin.from('users').update({
          tokens_used: 0,
          tokens_limit: tokensLimit,
          sites_used_this_month: 0,
        }).eq('id', userId)
        break
      }

      case 'invoice.payment_failed': {
        const invoice        = event.data.object as Stripe.Invoice
        const subscriptionId = getSubscriptionIdFromInvoice(invoice)
        if (!subscriptionId) break

        const sub    = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.user_id
        if (!userId) break

        await supabaseAdmin.from('subscriptions').update({
          status: sub.status,
        }).eq('stripe_subscription_id', subscriptionId)

        console.warn(`Payment failed for user ${userId} — subscription ${subscriptionId} is now ${sub.status}`)
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
