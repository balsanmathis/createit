import type { Metadata } from 'next'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact — CreateIt',
  description: 'Une question, une idée, un bug ? Écrivez-nous. Nous répondons sous 24 heures.',
}

const INFO = [
  { icon: '✉️', label: 'Email', value: 'createitapp@gmail.com' },
  { icon: '⏱', label: 'Temps de réponse', value: 'Sous 24 heures ouvrées' },
  { icon: '🌍', label: 'Langues', value: 'Français, English' },
]

export default function ContactPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />

      {/* Hero */}
      <AuroraBackground intensity="subtle" className="pt-[60px]">
        <section className="max-w-3xl mx-auto px-5 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            Contact
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
            On vous répond
          </h1>
          <p className="text-base sm:text-lg" style={{ color: 'var(--fg-muted)' }}>
            Une question sur le produit, les tarifs ou un bug ? Écrivez-nous, nous lisons tous les messages.
          </p>
        </section>
      </AuroraBackground>

      {/* Content */}
      <section className="py-16 px-5 pb-24" style={{ background: 'var(--bg)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Info col */}
          <div className="space-y-4">
            {INFO.map(item => (
              <GlassCard key={item.label} className="p-5 flex items-start gap-4">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{item.value}</p>
                </div>
              </GlassCard>
            ))}

            <GlassCard className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--fg-subtle)' }}>
                Déjà client ?
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>
                Pour toute question liée à votre compte ou facturation, passez directement par le dashboard.
              </p>
              <a
                href="/dashboard/aide"
                className="text-sm font-semibold"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                Accéder à l&apos;aide →
              </a>
            </GlassCard>
          </div>

          {/* Form col */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
