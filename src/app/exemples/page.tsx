import type { Metadata } from 'next'
import AuroraBackground from '@/components/ui/AuroraBackground'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import ExemplesGrid from './ExemplesGrid'

export const metadata: Metadata = {
  title: 'Exemples — CreateIt',
  description: 'Découvrez des sites web générés par IA : restaurants, portfolios, boutiques, agences, blogs, coachs. Créez le vôtre en 30 secondes.',
}

interface Props {
  searchParams: Promise<{ secteur?: string }>
}

export default async function ExemplesPage({ searchParams }: Props) {
  const { secteur } = await searchParams
  const initialSector = secteur ?? 'tous'

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />

      {/* Hero */}
      <AuroraBackground intensity="subtle" className="pt-[60px]">
        <section className="max-w-4xl mx-auto px-5 py-16 text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Galerie
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
            Ce que vous pouvez créer
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'var(--fg-muted)' }}>
            Chaque exemple ci-dessous a été généré avec CreateIt en moins de 30 secondes. Cliquez pour voir le détail et créer un site similaire.
          </p>
        </section>
      </AuroraBackground>

      {/* Grid filtrable */}
      <section className="py-12 px-5 pb-20" style={{ background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto">
          <ExemplesGrid initialSector={initialSector} />
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
