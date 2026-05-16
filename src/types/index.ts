export type Plan = 'free' | 'starter' | 'pro' | 'agency'

export interface User {
  id: string
  email: string
  plan: Plan | null
  sites_used_this_month: number
  tokens_used: number
  tokens_limit: number
  welcome_code: string | null
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

// Legacy (kept for existing code that still reads sites_used_this_month)
export const PLAN_LIMITS: Record<string, number> = {
  starter: 10,
  pro: 30,
  agency: 200,
}

export const PLAN_TOKEN_LIMITS: Record<Plan, number> = {
  free:    8_000,
  starter: 800_000,
  pro:     2_400_000,
  agency:  16_000_000,
}

export const TOKEN_COST_GENERATE = 8_000
export const TOKEN_COST_MODIFY   = 8_000

export const PLAN_PRICES: Record<Exclude<Plan, 'free'>, { monthly: number; priceId: string }> = {
  starter: { monthly: 20,  priceId: process.env.STRIPE_STARTER_PRICE_ID || '' },
  pro:     { monthly: 45,  priceId: process.env.STRIPE_PRO_PRICE_ID || '' },
  agency:  { monthly: 250, priceId: process.env.STRIPE_AGENCY_PRICE_ID || '' },
}
