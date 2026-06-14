'use client'

import { useState } from 'react'
import { toast } from 'sonner'

const PLANS = [
  {
    key: 'starter',
    price: 20,
    popular: false,
    tokens: '800 000 tokens',
    features_fr: [
      '800 000 tokens inclus',
      'Éditeur visuel inclus',
      'Export ZIP',
      'Support email',
      'Historique 30 jours',
    ],
    features_en: [
      '800,000 tokens included',
      'Visual editor included',
      'ZIP export',
      'Email support',
      '30-day history',
    ],
  },
  {
    key: 'pro',
    price: 45,
    popular: true,
    tokens: '2 400 000 tokens',
    features_fr: [
      '2 400 000 tokens inclus',
      'Éditeur visuel inclus',
      'Export ZIP',
      'Support prioritaire',
      'Historique illimité',
    ],
    features_en: [
      '2,400,000 tokens included',
      'Visual editor included',
      'ZIP export',
      'Priority support',
      'Unlimited history',
    ],
  },
  {
    key: 'ultra',
    price: 250,
    popular: false,
    tokens: '16 000 000 tokens',
    features_fr: [
      '16 000 000 tokens inclus',
      'Éditeur visuel inclus',
      'Export ZIP',
      'Support dédié 24/7',
      'Historique illimité',
      'API access',
      'White label',
    ],
    features_en: [
      '16,000,000 tokens included',
      'Visual editor included',
      'ZIP export',
      'Dedicated 24/7 support',
      'Unlimited history',
      'API access',
      'White label',
    ],
  },
  {
    key: 'agency',
    price: 399,
    popular: false,
    tokens: '35 000 000 tokens',
    features_fr: [
      '35 000 000 tokens inclus',
      'Tout le plan Ultra',
      'Support dédié 24/7',
      'API access',
      'White label',
      'Membres d\'équipe illimités',
    ],
    features_en: [
      '35,000,000 tokens included',
      'Everything in Ultra',
      'Dedicated 24/7 support',
      'API access',
      'White label',
      'Unlimited team members',
    ],
  },
]

const NAMES: Record<string, { fr: string; en: string }> = {
  starter: { fr: 'Starter', en: 'Starter' },
  pro:     { fr: 'Pro',     en: 'Pro'     },
  ultra:   { fr: 'Ultra',   en: 'Ultra'   },
  agency:  { fr: 'Agency',  en: 'Agency'  },
}

const DESC: Record<string, { fr: string; en: string }> = {
  starter: { fr: 'Parfait pour débuter',         en: 'Perfect for getting started' },
  pro:     { fr: 'Pour les professionnels',       en: 'For professionals'           },
  ultra:   { fr: 'Pour les agences ambitieuses', en: 'For ambitious agencies'       },
  agency:  { fr: 'Volume maximal',               en: 'Maximum volume'              },
}

const F = "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

interface PricingSectionProps {
  locale?: 'fr' | 'en'
  initialPromoCode?: string
}

export default function PricingSection({ locale = 'fr', initialPromoCode }: PricingSectionProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState(initialPromoCode?.toUpperCase() ?? '')

  const handleCheckout = async (planKey: string) => {
    setLoading(planKey)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, promoCode: promoCode.trim() || undefined }),
      })
      const data = await res.json()

      if (res.status === 401) {
        window.location.href = `/auth/login?redirect=/pricing`
        return
      }
      if (!res.ok || !data.url) {
        toast.error(data.error || (locale === 'fr' ? 'Erreur lors du checkout' : 'Checkout error'))
        return
      }
      window.location.href = data.url
    } catch {
      toast.error(locale === 'fr' ? 'Erreur réseau' : 'Network error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <section id="tarifs" style={{ padding: '80px 24px', fontFamily: F }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 12 }}>
            {locale === 'fr' ? 'Tarifs simples et transparents' : 'Simple and transparent pricing'}
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
            {locale === 'fr'
              ? 'Commencez gratuitement, évoluez selon vos besoins. Sans engagement.'
              : 'Start free, scale as you grow. No commitment.'}
          </p>
        </div>

        {/* Promo code */}
        <div className="flex justify-center" style={{ marginBottom: 40 }}>
          <div
            className="flex items-center gap-3 max-w-xs w-full rounded-lg px-4 py-2.5"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <svg className="w-4 h-4 shrink-0" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <input
              type="text"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder={locale === 'fr' ? 'Code promo (optionnel)' : 'Promo code (optional)'}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: '#0f172a' }}
            />
            {promoCode && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#2563eb' }}>
                ✓
              </span>
            )}
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className="relative flex flex-col"
              style={{
                background: '#ffffff',
                border: plan.popular ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 28,
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ background: '#2563eb' }}>
                    {locale === 'fr' ? 'Populaire' : 'Popular'}
                  </span>
                </div>
              )}

              {/* Plan name + desc */}
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                {NAMES[plan.key][locale]}
              </p>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                {DESC[plan.key][locale]}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 42, fontWeight: 700, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>
                  {plan.price}€
                </span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>
                  {locale === 'fr' ? '/mois' : '/month'}
                </span>
              </div>

              {/* Tokens badge */}
              <div
                style={{ background: '#f1f5f9', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 24 }}
              >
                {plan.tokens}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1" style={{ marginBottom: 24 }}>
                {(locale === 'fr' ? plan.features_fr : plan.features_en).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5" style={{ fontSize: 13, color: '#64748b' }}>
                    <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#2563eb' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading === plan.key}
                className="w-full text-center py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                style={{
                  background: plan.popular ? '#2563eb' : 'transparent',
                  color: plan.popular ? 'white' : '#0f172a',
                  border: plan.popular ? 'none' : '1px solid #e2e8f0',
                }}
                onMouseEnter={(e) => {
                  if (plan.popular) e.currentTarget.style.background = '#1d4ed8';
                  else e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  if (plan.popular) e.currentTarget.style.background = '#2563eb';
                  else e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {loading === plan.key && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {loading === plan.key
                  ? (locale === 'fr' ? 'Chargement…' : 'Loading…')
                  : (locale === 'fr' ? 'Commencer' : 'Get started')}
              </button>
            </div>
          ))}
        </div>

        {/* Free tier note */}
        <div className="text-center mt-10">
          <p style={{ fontSize: 14, color: '#64748b' }}>
            {locale === 'fr'
              ? 'Commencez gratuitement avec 8 000 tokens — aucune carte bancaire requise.'
              : 'Start free with 8,000 tokens — no credit card required.'}
          </p>
        </div>
      </div>
    </section>
  )
}
