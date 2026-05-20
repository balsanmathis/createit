'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import GlassCard from '@/components/ui/GlassCard'
import PricingCard, { type PricingPlan } from '@/components/ui/PricingCard'
import AuroraBackground from '@/components/ui/AuroraBackground'
import { cn } from '@/lib/utils'

const PLANS: PricingPlan[] = [
  {
    key: 'free',
    name: 'Gratuit',
    desc: 'Pour explorer les exemples',
    monthlyPrice: 0,
    tokens: '',
    features: ['Accès aux exemples', 'Voir les sites générés', 'Inspiration gratuite'],
    cta: 'Créer un compte',
    href: '/auth/signup',
  },
  {
    key: 'starter',
    name: 'Starter',
    desc: 'Pour les indépendants',
    monthlyPrice: 20,
    tokens: '800 000 tokens',
    features: ['Générations illimitées', 'Éditeur visuel', 'Export ZIP', 'Support email'],
    cta: 'Choisir Starter',
    href: '/auth/signup?plan=starter',
  },
  {
    key: 'pro',
    name: 'Pro',
    desc: 'Pour les professionnels',
    monthlyPrice: 45,
    tokens: '2 400 000 tokens',
    features: ['Éditeur visuel avancé', 'Export ZIP', 'Support prioritaire', 'Historique illimité'],
    cta: 'Choisir Pro',
    href: '/auth/signup?plan=pro',
  },
  {
    key: 'agency',
    name: 'Agency',
    desc: 'Pour les agences',
    monthlyPrice: 250,
    tokens: '16 000 000 tokens',
    features: ['Tout le Pro', 'Support dédié 24/7', 'API access', 'Revente autorisée', 'White label'],
    cta: 'Choisir Agency',
    href: '/auth/signup?plan=agency',
  },
]

type Row = { label: string; free: boolean | string; starter: boolean | string; pro: boolean | string; agency: boolean | string }

const COMPARISON: { category: string; rows: Row[] }[] = [
  {
    category: 'Génération',
    rows: [
      { label: 'Génération de sites', free: false,      starter: true,      pro: true,      agency: true },
      { label: 'Tokens inclus',       free: 'Aucun',    starter: '800 000', pro: '2 400 000', agency: '16 000 000' },
      { label: 'Temps de génération', free: '—',        starter: '< 30 s',  pro: '< 30 s',  agency: '< 30 s' },
    ],
  },
  {
    category: 'Éditeur',
    rows: [
      { label: 'Éditeur visuel',          free: true,  starter: true,  pro: true,  agency: true  },
      { label: 'Éditeur IA (instructions)', free: false, starter: false, pro: true,  agency: true  },
      { label: 'Modification de couleurs', free: true,  starter: true,  pro: true,  agency: true  },
      { label: 'Historique des versions',  free: false, starter: false, pro: true,  agency: true  },
    ],
  },
  {
    category: 'Export & hébergement',
    rows: [
      { label: 'Export ZIP (HTML/CSS/JS)', free: true,  starter: true,  pro: true,  agency: true  },
      { label: 'Code 100 % propriétaire', free: true,  starter: true,  pro: true,  agency: true  },
      { label: 'Hébergement libre',        free: true,  starter: true,  pro: true,  agency: true  },
    ],
  },
  {
    category: 'Business',
    rows: [
      { label: 'Revente à des clients',   free: false, starter: true,  pro: true,  agency: true  },
      { label: 'White label',             free: false, starter: false, pro: false, agency: true  },
      { label: 'Accès API',              free: false, starter: false, pro: false, agency: true  },
      { label: "Membres d'équipe",        free: false, starter: false, pro: false, agency: true  },
    ],
  },
  {
    category: 'Support',
    rows: [
      { label: 'Documentation',          free: true,  starter: true,  pro: true,  agency: true  },
      { label: 'Support email',          free: false, starter: true,  pro: true,  agency: true  },
      { label: 'Support prioritaire',    free: false, starter: false, pro: true,  agency: true  },
      { label: 'Support dédié 24/7',     free: false, starter: false, pro: false, agency: true  },
    ],
  },
]

const FAQS = [
  { q: "Le code m'appartient-il vraiment ?", a: "Oui, entièrement. Vous téléchargez du HTML/CSS/JS standard sans dépendance à CreateIt." },
  { q: 'Comment fonctionne la période d\'essai ?', a: "Le plan Gratuit est permanent (pas de période d'essai limitée). Vous pouvez tester sans carte bancaire." },
  { q: 'Puis-je changer de plan à tout moment ?', a: "Oui, upgradez ou downgradez en un clic depuis votre tableau de bord. Le changement est immédiat." },
  { q: 'Que se passe-t-il si j\'épuise mes tokens ?', a: "Vous pouvez consulter et exporter vos sites existants. Pour générer de nouveaux sites, passez au plan supérieur ou attendez le renouvellement mensuel." },
  { q: 'Les tokens se renouvellent-ils chaque mois ?', a: "Oui, les tokens se renouvellent automatiquement chaque mois à la date d'anniversaire de votre abonnement. Ils ne s'accumulent pas." },
  { q: 'Y a-t-il des frais cachés ?', a: "Non. Le prix affiché est le prix final, tout inclus. Pas de frais d'installation, pas de frais de dépassement (génération bloquée si tokens épuisés)." },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={16} style={{ color: '#22c55e', margin: '0 auto' }} />
  if (value === false) return <X size={14} style={{ color: 'var(--fg-subtle)', margin: '0 auto' }} />
  return <span className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{value}</span>
}

export default function TarifsClient() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* Plans grid */}
      <section className="py-16 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center rounded-xl p-1 gap-1" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {(['monthly', 'annual'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={billing === b ? { background: 'var(--accent)', color: 'white' } : { color: 'var(--fg-muted)', background: 'transparent' }}
                >
                  {b === 'monthly' ? 'Mensuel' : 'Annuel'}
                  {b === 'annual' && (
                    <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: billing === 'annual' ? 'rgba(255,255,255,0.25)' : 'var(--accent-light)', color: billing === 'annual' ? 'white' : 'var(--accent)' }}>
                      −20 %
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {PLANS.map(plan => (
              <PricingCard key={plan.key} plan={plan} highlighted={plan.key === 'pro'} billing={billing} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 px-5" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-10" style={{ color: 'var(--fg)' }}>
            Comparaison détaillée
          </h2>

          <GlassCard className="overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-5 text-xs font-semibold uppercase tracking-wider py-3 px-4" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--fg-subtle)' }}>
              <div className="col-span-1">Fonctionnalité</div>
              {PLANS.map(p => (
                <div key={p.key} className="text-center" style={{ color: p.key === 'pro' ? 'var(--accent)' : undefined }}>
                  {p.name}
                </div>
              ))}
            </div>

            {/* Rows */}
            {COMPARISON.map((cat, ci) => (
              <div key={ci}>
                {/* Category header */}
                <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', color: 'var(--fg-subtle)' }}>
                  {cat.category}
                </div>
                {cat.rows.map((row, ri) => (
                  <div
                    key={ri}
                    className="grid grid-cols-5 py-3 px-4 items-center"
                    style={{ borderBottom: '1px solid var(--border)', background: ri % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}
                  >
                    <div className="text-sm col-span-1" style={{ color: 'var(--fg-muted)' }}>{row.label}</div>
                    <div className="text-center"><Cell value={row.free} /></div>
                    <div className="text-center"><Cell value={row.starter} /></div>
                    <div className="text-center"><Cell value={row.pro} /></div>
                    <div className="text-center"><Cell value={row.agency} /></div>
                  </div>
                ))}
              </div>
            ))}

            {/* CTA row */}
            <div className="grid grid-cols-5 py-4 px-4 gap-2 items-center" style={{ background: 'var(--surface-2)' }}>
              <div className="text-xs font-semibold" style={{ color: 'var(--fg-subtle)' }}>Commencer</div>
              {PLANS.map(plan => (
                <div key={plan.key} className="flex justify-center">
                  <Link
                    href={plan.href}
                    className="text-xs font-semibold px-3 py-2 rounded-lg transition-all text-center"
                    style={
                      plan.key === 'pro'
                        ? { background: 'var(--accent)', color: '#fff', textDecoration: 'none' }
                        : { border: '1px solid var(--border)', color: 'var(--fg-muted)', textDecoration: 'none' }
                    }
                  >
                    {plan.key === 'free' ? 'Gratuit' : `${plan.monthlyPrice} €/mois`}
                  </Link>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-8" style={{ color: 'var(--fg)' }}>
            Questions fréquentes
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <GlassCard key={i} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  aria-expanded={openFaq === i}
                  style={{ color: 'var(--fg)' }}
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronDown size={16} className="shrink-0 transition-transform duration-200"
                    style={{ color: 'var(--fg-muted)', transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <AuroraBackground intensity="medium" className="py-20 px-5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
            Commencez gratuitement
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--fg-muted)' }}>
            Sans carte bancaire. Sans engagement. Créez votre premier site en 30 secondes.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold transition-all"
            style={{ background: 'var(--accent)', textDecoration: 'none', boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
          >
            Créer mon premier site →
          </Link>
        </div>
      </AuroraBackground>
    </>
  )
}
