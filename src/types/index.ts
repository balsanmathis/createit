export type Plan = 'starter' | 'pro' | 'agency'

export interface User {
  id: string
  email: string
  plan: Plan | null
  sites_used_this_month: number
  created_at: string
}

export interface Site {
  id: string
  user_id: string
  name: string
  prompt: string
  html_content: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  plan: Plan
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  current_period_end: string
}

export const PLAN_LIMITS: Record<Plan, number> = {
  starter: 10,
  pro: 30,
  agency: 200,
}

export const PLAN_PRICES: Record<Plan, { monthly: number; priceId: string }> = {
  starter: { monthly: 20, priceId: process.env.STRIPE_STARTER_PRICE_ID || '' },
  pro: { monthly: 45, priceId: process.env.STRIPE_PRO_PRICE_ID || '' },
  agency: { monthly: 250, priceId: process.env.STRIPE_AGENCY_PRICE_ID || '' },
}
