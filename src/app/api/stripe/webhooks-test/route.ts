import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { PLAN_TOKEN_LIMITS } from '@/types'

// Dedicated test-mode webhook — only accepts livemode:false events
// Uses STRIPE_TEST_SECRET_KEY and STRIPE_TEST_WEBHOOK_SECRET

function getStripeTest(): Stripe {
  const key = process.env.STRIPE_TEST_SECRET_KEY
  if (!key) throw new Error('STRIPE_TEST_SECRET_KEY not set')
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' })
}

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

async function resolveUserId(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  stripeTest: Stripe,
  metadataUserId: string | undefined,
  customerEmail: string | null | undefined,
  customerId: string | null | undefined,
  context: string
): Promise<string | null> {
  if (metadataUserId) return metadataUserId

  if (customerEmail) {
    const { data } = await supabaseAdmin.from('users').select('id').eq('email', customerEmail).single()
    if (data?.id) return data.id
  }

  if (customerId) {
    try {
      const customer = await stripeTest.customers.retrieve(customerId) as Stripe.Customer
      if (!customer.deleted && customer.email) {
        const { data } = await supabaseAdmin.from('users').select('id').eq('email', customer.email).single()
        if (data?.id) return data.id
      }
    } catch { /* ignore */ }
  }

  console.error(`[webhook-test:${context}] could not resolve user_id`, { metadataUserId, customerEmail, customerId })
  return null
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  const secret = process.env.STRIPE_TEST_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'STRIPE_TEST_WEBHOOK_SECRET not set' }, { status: 500 })

  const stripeTest = getStripeTest()

  let event: Stripe.Event
  try {
    event = stripeTest.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    console.error('[webhook-test] signature error:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // This endpoint ONLY accepts test events — reject live events
  if (event.livemode) {
    console.error('[webhook-test] live event rejected on test endpoint', event.type)
    return NextResponse.json({ received: true, skipped: 'live_event_on_test_endpoint' })
  }

  console.log(`[webhook-test] ${event.type}`)
  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break
        if (session.payment_status !== 'paid') {
          console.warn('[webhook-test] checkout not paid, skipping', session.payment_status)
          break
        }

        const customerId     = session.customer as string
        const subscriptionId = session.subscription as string
        let plan = session.metadata?.plan as keyof typeof PLAN_TOKEN_LIMITS | undefined

        const userId = await resolveUserId(supabaseAdmin, stripeTest, session.metadata?.user_id, session.customer_email, customerId, 'checkout.session.completed')
        if (!userId) break

        if (!plan) {
          try {
            const sub = await stripeTest.subscriptions.retrieve(subscriptionId)
            plan = sub.metadata?.plan as keyof typeof PLAN_TOKEN_LIMITS | undefined
          } catch { /* ignore */ }
        }

        if (!plan || !(plan in PLAN_TOKEN_LIMITS)) {
          console.error('[webhook-test] unknown plan', { plan })
          break
        }

        const sub         = await stripeTest.subscriptions.retrieve(subscriptionId)
        const tokensLimit = PLAN_TOKEN_LIMITS[plan]

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: sub.status,
          current_period_end: monthFromNow(),
        }, { onConflict: 'user_id' })

        await supabaseAdmin.from('users').update({
          plan,
          tokens_used: 0,
          tokens_limit: tokensLimit,
          sites_used_this_month: 0,
        }).eq('id', userId)

        console.log(`[webhook-test] ✅ checkout.session.completed — user ${userId} → plan=${plan}`)
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = await resolveUserId(supabaseAdmin, stripeTest, sub.metadata?.user_id, null, sub.customer as string, event.type)
        if (!userId) break

        const plan   = (sub.metadata?.plan || 'starter') as keyof typeof PLAN_TOKEN_LIMITS
        const status = sub.status

        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          plan, status,
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

        const sub    = await stripeTest.subscriptions.retrieve(subscriptionId)
        const userId = await resolveUserId(supabaseAdmin, stripeTest, sub.metadata?.user_id, invoice.customer_email, invoice.customer as string, 'invoice.payment_succeeded')
        if (!userId) break

        const plan        = (sub.metadata?.plan || 'starter') as keyof typeof PLAN_TOKEN_LIMITS
        const tokensLimit = PLAN_TOKEN_LIMITS[plan] ?? PLAN_TOKEN_LIMITS.starter

        await supabaseAdmin.from('subscriptions').update({ status: 'active', current_period_end: monthFromNow() }).eq('user_id', userId)
        await supabaseAdmin.from('users').update({ tokens_used: 0, tokens_limit: tokensLimit, sites_used_this_month: 0 }).eq('id', userId)

        console.log(`[webhook-test] ✅ invoice.payment_succeeded — user ${userId} reset tokens`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice        = event.data.object as Stripe.Invoice
        const subscriptionId = getSubscriptionIdFromInvoice(invoice)
        if (!subscriptionId) break
        const sub = await stripeTest.subscriptions.retrieve(subscriptionId)
        await supabaseAdmin.from('subscriptions').update({ status: sub.status }).eq('stripe_subscription_id', subscriptionId)
        break
      }

      case 'charge.refunded': {
        const charge     = event.data.object as Stripe.Charge
        const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id
        if (!customerId) break
        const userId = await resolveUserId(supabaseAdmin, stripeTest, undefined, charge.billing_details?.email, customerId, 'charge.refunded')
        if (!userId) break
        await supabaseAdmin.from('users').update({ plan: 'free', tokens_limit: PLAN_TOKEN_LIMITS.free, tokens_used: 0 }).eq('id', userId)
        await supabaseAdmin.from('subscriptions').update({ status: 'canceled' }).eq('user_id', userId)
        break
      }
    }
  } catch (err) {
    console.error('[webhook-test] processing error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
