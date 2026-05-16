'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const PLANS = [
  {
    key: 'starter',
    price: 20,
    sites: 10,
    popular: false,
    features_fr: [
      '~100 sites générés par mois',
      '800 000 tokens inclus',
      'Éditeur visuel inclus',
      'Export ZIP',
      'Support email',
      'Historique 30 jours',
    ],
    features_en: [
      '~100 sites generated per month',
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
    sites: 25,
    popular: true,
    features_fr: [
      '~300 sites générés par mois',
      '2 400 000 tokens inclus',
      'Éditeur visuel inclus',
      'Export ZIP',
      'Templates 21st.dev',
      'Support prioritaire',
      'Historique illimité',
    ],
    features_en: [
      '~300 sites generated per month',
      '2,400,000 tokens included',
      'Visual editor included',
      'ZIP export',
      '21st.dev templates',
      'Priority support',
      'Unlimited history',
    ],
  },
  {
    key: 'agency',
    price: 250,
    sites: 160,
    popular: false,
    features_fr: [
      '~2 000 sites générés par mois',
      '16 000 000 tokens inclus',
      'Éditeur visuel inclus',
      'Export ZIP',
      'Templates 21st.dev',
      'Support dédié 24/7',
      'Historique illimité',
      'API access',
      'White label',
    ],
    features_en: [
      '~2,000 sites generated per month',
      '16,000,000 tokens included',
      'Visual editor included',
      'ZIP export',
      '21st.dev templates',
      'Dedicated 24/7 support',
      'Unlimited history',
      'API access',
      'White label',
    ],
  },
]

const NAMES = {
  starter: { fr: 'Starter', en: 'Starter' },
  pro: { fr: 'Pro', en: 'Pro' },
  agency: { fr: 'Agency', en: 'Agency' },
}

const DESC = {
  starter: { fr: 'Parfait pour débuter', en: 'Perfect for getting started' },
  pro: { fr: 'Pour les professionnels', en: 'For professionals' },
  agency: { fr: 'Pour les agences', en: 'For agencies' },
}

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
    <section id="pricing" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(124,109,250,0.07)_0%,transparent_60%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6 border border-violet-500/20">
            <span className="text-sm text-violet-300 font-medium">
              {locale === 'fr' ? 'Tarifs' : 'Pricing'}
            </span>
          </div>
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-6">
            {locale === 'fr' ? 'Tarifs simples' : 'Simple pricing'}<br />
            <span className="gradient-text">{locale === 'fr' ? 'et transparents' : 'and transparent'}</span>
          </h2>
          <p className="text-xl text-white/50 max-w-xl mx-auto">
            {locale === 'fr'
              ? 'Choisissez le plan qui correspond à vos besoins. Sans engagement, résiliable à tout moment.'
              : 'Choose the plan that fits your needs. No commitment, cancel anytime.'}
          </p>
        </motion.div>

        {/* Promo code input */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 max-w-sm w-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <svg className="w-4 h-4 shrink-0" style={{ color: 'rgba(124,58,237,0.7)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <input
              type="text"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              placeholder={locale === 'fr' ? 'Code promo (optionnel)' : 'Promo code (optional)'}
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: '#e2e8f0' }}
            />
            {promoCode && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd' }}>
                ✓
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'glass-strong border-violet-500/40 glow'
                  : 'glass border-white/5'
              } border transition-all duration-300 hover:-translate-y-1`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {locale === 'fr' ? '⭐ Populaire' : '⭐ Popular'}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-semibold text-violet-400 mb-1 uppercase tracking-wider">
                  {NAMES[plan.key as keyof typeof NAMES][locale]}
                </div>
                <div className="text-white/50 text-sm mb-4">
                  {DESC[plan.key as keyof typeof DESC][locale]}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-white">{plan.price}€</span>
                  <span className="text-white/40 mb-2">{locale === 'fr' ? '/ mois' : '/ month'}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {(locale === 'fr' ? plan.features_fr : plan.features_en).map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading === plan.key}
                className={`w-full text-center py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-violet-500/25'
                    : 'glass border border-white/10 hover:border-violet-500/30 text-white hover:text-violet-200'
                }`}
              >
                {loading === plan.key && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {loading === plan.key
                  ? (locale === 'fr' ? 'Chargement...' : 'Loading...')
                  : (locale === 'fr' ? 'Commencer' : 'Get started')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
