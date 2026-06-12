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

// Resolve user_id from metadata, falling back to customer email lookup
async function resolveUserId(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  metadataUserId: string | undefined,
  customerEmail: string | null | undefined,
  customerId: string | null | undefined,
  context: string
): Promise<string | null> {
  if (metadataUserId) return metadataUserId

  // Fallback 1: look up by customer_email directly on the event
  if (customerEmail) {
    const { data } = await supabaseAdmin.from('users').select('id').eq('email', customerEmail).single()
    if (data?.id) {
      console.warn(`[webhook:${context}] no user_id in metadata — resolved via email ${customerEmail}`)
      return data.id
    }
  }

  // Fallback 2: fetch email from Stripe customer object
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      if (!customer.deleted && customer.email) {
        const { data } = await supabaseAdmin.from('users').select('id').eq('email', customer.email).single()
        if (data?.id) {
          console.warn(`[webhook:${context}] no user_id in metadata — resolved via Stripe customer email ${customer.email}`)
          return data.id
        }
      }
    } catch (e) {
      console.error(`[webhook:${context}] failed to fetch Stripe customer ${customerId}:`, e)
    }
  }

  console.error(`[webhook:${context}] could not resolve user_id — metadata missing and no email match`, {
    metadataUserId, customerEmail, customerId,
  })
  return null
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

        const customerId     = session.customer as string
        const subscriptionId = session.subscription as string
        let plan = session.metadata?.plan as keyof typeof PLAN_TOKEN_LIMITS | undefined

        const userId = await resolveUserId(
          supabaseAdmin,
          session.metadata?.user_id,
          session.customer_email,
          customerId,
          'checkout.session.completed'
        )
        if (!userId) break

        // If plan missing from session metadata, try subscription metadata
        if (!plan) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId)
            plan = sub.metadata?.plan as keyof typeof PLAN_TOKEN_LIMITS | undefined
          } catch { /* ignore */ }
        }

        if (!plan || !(plan in PLAN_TOKEN_LIMITS)) {
          console.error('[webhook:checkout.session.completed] unknown plan', { plan, sessionId: session.id })
          break
        }

        const sub         = await stripe.subscriptions.retrieve(subscriptionId)
        const tokensLimit = PLAN_TOKEN_LIMITS[plan]

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

        console.log(`[webhook] checkout.session.completed — user ${userId} → plan=${plan}, tokens=${tokensLimit}`)
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription

        const userId = await resolveUserId(
          supabaseAdmin,
          sub.metadata?.user_id,
          null,
          sub.customer as string,
          event.type
        )
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
          console.log(`[webhook] ${event.type} — user ${userId} downgraded to free (status=${status})`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice        = event.data.object as Stripe.Invoice
        const subscriptionId = getSubscriptionIdFromInvoice(invoice)
        if (!subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)

        const userId = await resolveUserId(
          supabaseAdmin,
          sub.metadata?.user_id,
          invoice.customer_email,
          invoice.customer as string,
          'invoice.payment_succeeded'
        )
        if (!userId) break

        const plan        = (sub.metadata?.plan || 'starter') as keyof typeof PLAN_TOKEN_LIMITS
        const tokensLimit = PLAN_TOKEN_LIMITS[plan] ?? PLAN_TOKEN_LIMITS.starter

        await supabaseAdmin.from('subscriptions').update({
          status: 'active',
          current_period_end: monthFromNow(),
        }).eq('user_id', userId)

        await supabaseAdmin.from('users').update({
          tokens_used: 0,
          tokens_limit: tokensLimit,
          sites_used_this_month: 0,
        }).eq('id', userId)

        console.log(`[webhook] invoice.payment_succeeded — user ${userId} reset tokens, plan=${plan}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice        = event.data.object as Stripe.Invoice
        const subscriptionId = getSubscriptionIdFromInvoice(invoice)
        if (!subscriptionId) break

        const sub    = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = sub.metadata?.user_id

        await supabaseAdmin.from('subscriptions').update({
          status: sub.status,
        }).eq('stripe_subscription_id', subscriptionId)

        console.warn(`[webhook] invoice.payment_failed — user ${userId ?? 'unknown'}, sub ${subscriptionId}, status=${sub.status}`)
        break
      }

      case 'charge.refunded': {
        const charge     = event.data.object as Stripe.Charge
        const customerId = typeof charge.customer === 'string' ? charge.customer : charge.customer?.id
        if (!customerId) break

        const userId = await resolveUserId(
          supabaseAdmin,
          undefined,
          charge.billing_details?.email,
          customerId,
          'charge.refunded'
        )
        if (!userId) break

        await supabaseAdmin.from('users').update({
          plan: 'free',
          tokens_limit: PLAN_TOKEN_LIMITS.free,
          tokens_used: 0,
        }).eq('id', userId)

        await supabaseAdmin.from('subscriptions').update({
          status: 'canceled',
        }).eq('user_id', userId)

        console.log(`[webhook] charge.refunded — user ${userId} downgraded to free (charge ${charge.id})`)
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
