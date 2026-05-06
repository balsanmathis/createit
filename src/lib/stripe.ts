import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 20,
    sites: 10,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  pro: {
    name: 'Pro',
    price: 45,
    sites: 30,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
  agency: {
    name: 'Agency',
    price: 250,
    sites: 200,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
  },
} as const
