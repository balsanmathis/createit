import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

export interface SyncedUser {
  email: string
  stripeCustomerId: string
  stripeSubscriptionId: string | null
  plan: 'free' | 'starter' | 'pro' | 'agency'
  tokensLimit: number
  subscriptionStatus: 'free' | 'active' | 'canceling' | 'canceled' | 'refunded' | 'past_due'
  discountPercent: number
  discountCode: string | null
  hasRefund: boolean
  refundDate: string | null
  subscriptionCreatedAt: string | null
  renewalDate: string | null
  grossPaid: number
  netPaid: number
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function mapPriceToPlan(unitAmount: number): { plan: 'starter' | 'pro' | 'agency'; tokens: number } {
  if (unitAmount <= 2200)      return { plan: 'starter', tokens: 800_000 }
  else if (unitAmount <= 4600) return { plan: 'pro',     tokens: 2_400_000 }
  else                         return { plan: 'agency',  tokens: 16_000_000 }
}

function extractDiscount(sub: Stripe.Subscription): { percent: number; code: string | null } {
  // Legacy discount field
  if ((sub as Stripe.Subscription & { discount?: { coupon?: { percent_off?: number; id?: string } } }).discount?.coupon) {
    const d = (sub as Stripe.Subscription & { discount?: { coupon?: { percent_off?: number; id?: string } } }).discount!
    return { percent: d.coupon?.percent_off ?? 0, code: d.coupon?.id ?? null }
  }
  // New discounts[] array (flexible billing mode)
  const discounts = Array.isArray((sub as Stripe.Subscription & { discounts?: unknown[] }).discounts)
    ? ((sub as Stripe.Subscription & { discounts?: unknown[] }).discounts as Array<{ coupon?: { percent_off?: number; id?: string }; source?: { coupon?: string } }>)
    : []
  if (discounts.length > 0) {
    const d = discounts[0]
    const percent = d.coupon?.percent_off ?? 0
    const code = d.coupon?.id ?? d.source?.coupon ?? null
    return { percent, code }
  }
  return { percent: 0, code: null }
}

export async function syncAllUsersFromStripe(emails?: string[]): Promise<{ synced: number; results: SyncedUser[] }> {
  const stripe = getStripe()
  const results: SyncedUser[] = []

  let customers: Stripe.Customer[] = []

  if (emails && emails.length > 0) {
    // Fetch specific customers by email
    for (const email of emails) {
      const list = await stripe.customers.list({ email, limit: 1 })
      if (list.data[0]) customers.push(list.data[0])
    }
  } else {
    // Fetch all customers with pagination
    let hasMore = true
    let startingAfter: string | undefined
    while (hasMore) {
      const batch = await stripe.customers.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) })
      customers.push(...batch.data)
      hasMore = batch.has_more
      if (hasMore && batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id
    }
  }

  for (const customer of customers) {
    if (!customer.email) continue

    // Fetch subscriptions
    const subs = await stripe.subscriptions.list({
      customer: customer.id, status: 'all', limit: 10,
      expand: ['data.discounts', 'data.discount', 'data.items.data.price'],
    })
    const activeSub   = subs.data.find(s => s.status === 'active') ?? null
    const canceledSub = subs.data.find(s => s.status === 'canceled') ?? null
    const anySub      = activeSub ?? canceledSub ?? null

    // Fetch charges and refunds
    const charges = await stripe.charges.list({ customer: customer.id, limit: 20 })
    const refundedCharges = charges.data.filter(c => c.refunded || c.amount_refunded > 0)
    const paidCharges     = charges.data.filter(c => c.status === 'succeeded' && !c.refunded)
    const grossPaid  = paidCharges.reduce((s, c) => s + c.amount / 100, 0)
    const netPaid    = charges.data.reduce((s, c) => s + (c.amount - c.amount_refunded) / 100, 0)
    const hasRefund  = refundedCharges.length > 0
    const firstRefund = refundedCharges[0] ?? null

    let plan: 'free' | 'starter' | 'pro' | 'agency' = 'free'
    let tokensLimit    = 0
    let status: SyncedUser['subscriptionStatus'] = 'free'
    let discountPercent = 0
    let discountCode:   string | null = null
    let renewalDate:    string | null = null
    let subCreatedAt:   string | null = null

    if (hasRefund) {
      status = 'refunded'
      plan   = 'free'
    } else if (activeSub) {
      const unitAmount = activeSub.items.data[0]?.price?.unit_amount ?? 0
      const mapped     = mapPriceToPlan(unitAmount)
      plan         = mapped.plan
      tokensLimit  = mapped.tokens
      status       = activeSub.cancel_at_period_end ? 'canceling' : 'active'
      subCreatedAt = new Date(activeSub.created * 1000).toISOString()
      const disc   = extractDiscount(activeSub)
      discountPercent = disc.percent
      discountCode    = disc.code

      // Renewal: add 1 month from now as approximation (current_period_end removed in v22)
      const renewal = new Date()
      renewal.setMonth(renewal.getMonth() + 1)
      renewalDate = renewal.toISOString()
    } else if (canceledSub) {
      status = 'canceled'
    }

    results.push({
      email: customer.email,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: anySub?.id ?? null,
      plan, tokensLimit,
      subscriptionStatus: status,
      discountPercent, discountCode,
      hasRefund,
      refundDate: firstRefund ? new Date(firstRefund.created * 1000).toISOString() : null,
      subscriptionCreatedAt: subCreatedAt,
      renewalDate,
      grossPaid, netPaid,
    })
  }

  return { synced: results.length, results }
}

export async function upsertSyncedUsers(results: SyncedUser[]): Promise<{ updated: number; errors: string[] }> {
  const db = getServiceClient()
  let updated = 0
  const errors: string[] = []

  for (const r of results) {
    // Find user by email
    const { data: user } = await db.from('users').select('id, tokens_used').eq('email', r.email).single()
    if (!user) continue

    // Update users table (only existing columns)
    const usersUpdate: Record<string, unknown> = {
      plan: r.plan,
      tokens_limit: r.tokensLimit,
      ...(r.hasRefund ? { tokens_used: 0 } : {}),
    }

    const { error: uErr } = await db.from('users').update(usersUpdate).eq('id', user.id)
    if (uErr) { errors.push(`${r.email} users: ${uErr.message}`); continue }

    // Upsert subscriptions table
    if (r.stripeSubscriptionId) {
      const subPlan = r.plan === 'free' ? 'starter' : r.plan  // subscriptions check constraint excludes free
      const { error: sErr } = await db.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: r.stripeCustomerId,
        stripe_subscription_id: r.stripeSubscriptionId,
        plan: subPlan,
        status: r.subscriptionStatus === 'refunded' ? 'canceled'
          : r.subscriptionStatus === 'canceling' ? 'active'
          : r.subscriptionStatus === 'free' ? 'canceled'
          : r.subscriptionStatus,
        current_period_end: r.renewalDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'user_id' })
      if (sErr) errors.push(`${r.email} subscriptions: ${sErr.message}`)
    }

    updated++
  }

  return { updated, errors }
}
