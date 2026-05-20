import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import { EXAMPLES } from '@/data/examples'
import ExempleCtaButton from './ExempleCtaButton'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return EXAMPLES.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ex = EXAMPLES.find(e => e.slug === slug)
  if (!ex) return { title: 'Exemple — CreateIt' }
  return {
    title: `${ex.label} — Exemples CreateIt`,
    description: `Découvrez cet exemple de site "${ex.label}" généré par IA en 30 secondes avec CreateIt.`,
  }
}

export default async function ExempleDetailPage({ params }: Props) {
  const { slug } = await params
  const ex = EXAMPLES.find(e => e.slug === slug)
  if (!ex) notFound()

  const others = EXAMPLES.filter(e => e.slug !== slug).slice(0, 3)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />

      {/* Hero */}
      <AuroraBackground intensity="subtle" className="pt-[60px]">
        <section className="max-w-5xl mx-auto px-5 py-14">
          <Link
            href="/exemples"
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
            style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Retour aux exemples
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Info */}
            <div className="lg:w-80 shrink-0">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize mb-4 inline-block"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {ex.sector}
              </span>
              <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--fg)' }}>
                {ex.label}
              </h1>
              <p className="text-base mb-6" style={{ color: 'var(--fg-muted)' }}>
                {ex.desc}
              </p>
              <p className="text-sm mb-2 font-medium" style={{ color: 'var(--fg-subtle)' }}>Prompt utilisé :</p>
              <GlassCard className="p-4 mb-8">
                <p className="text-sm italic" style={{ color: 'var(--fg-muted)' }}>
                  &ldquo;{ex.prompt}&rdquo;
                </p>
              </GlassCard>

              <ExempleCtaButton prompt={ex.prompt} />
            </div>

            {/* Preview — browser frame */}
            <div className="flex-1 w-full">
              <GlassCard className="overflow-hidden">
                {/* Chrome bar */}
                <div
                  className="flex items-center gap-1.5 px-4 py-3"
                  style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
                >
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FC6358' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
                  <span
                    className="flex-1 mx-3 h-6 rounded text-xs flex items-center px-3"
                    style={{ background: 'var(--surface-2)', color: 'var(--fg-subtle)' }}
                  >
                    createit.app/sites/{ex.slug}
                  </span>
                </div>
                {/* Screenshot */}
                <div className="relative overflow-hidden" style={{ height: 420 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ex.img}
                    alt={ex.label}
                    className="w-full h-full object-cover object-top"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0"
                    style={{ height: 80, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.25))' }}
                  />
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      </AuroraBackground>

      {/* Autres exemples */}
      {others.length > 0 && (
        <section className="py-16 px-5" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-8" style={{ color: 'var(--fg)' }}>
              D&apos;autres exemples
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {others.map(o => (
                <GlassCard key={o.slug} hover className="overflow-hidden group">
                  <Link href={`/exemples/${o.slug}`} style={{ textDecoration: 'none' }}>
                    <div className="relative overflow-hidden" style={{ height: 140 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.img} alt={o.label} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                      <div
                        className="absolute inset-x-0 bottom-0"
                        style={{ height: 36, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.28))' }}
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--fg)' }}>{o.label}</p>
                      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{o.desc}</p>
                    </div>
                  </Link>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicFooter />
    </div>
  )
}
