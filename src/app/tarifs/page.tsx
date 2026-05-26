import type { Metadata } from 'next'
import AuroraBackground from '@/components/ui/AuroraBackground'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import TarifsClient from './TarifsClient'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Tarifs — CreateIt',
  description: 'Gratuit, Starter 20 €/mois, Pro 45 €/mois, Agency 250 €/mois. Comparez les plans CreateIt et choisissez celui qui correspond à vos besoins.',
}

export default async function TarifsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />

      {/* Hero */}
      <AuroraBackground intensity="subtle" className="pt-[60px]">
        <section className="max-w-3xl mx-auto px-5 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            Tarifs
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
            Simple. Transparent. Sans surprise.
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
            Commencez gratuitement, évoluez selon vos besoins. Sans engagement, sans frais cachés.
          </p>
        </section>
      </AuroraBackground>

      <TarifsClient isLoggedIn={!!user} />

      <PublicFooter />
    </div>
  )
}
