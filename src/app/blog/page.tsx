import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'

export const metadata: Metadata = {
  title: 'Blog — CreateIt',
  description: 'Conseils, tutoriels et actualités autour de la création de sites web par IA.',
}

const ARTICLES = [
  {
    slug: 'creer-site-web-ia-30-secondes',
    tag: 'Guide',
    title: "Comment créer un site web professionnel en 30 secondes avec l'IA",
    excerpt: "Fini les semaines de développement et les budgets d'agence. Découvrez comment CreateIt génère un site complet en quelques secondes.",
    date: '12 mai 2025',
    readTime: '4 min',
  },
  {
    slug: 'freelance-multiplier-projets-ia',
    tag: 'Freelance',
    title: "Freelance : multipliez vos projets grâce à la génération de sites par IA",
    excerpt: "Un premier draft en 30 secondes, vous finalisez à la main. Voici comment des freelances livrent 3× plus de projets par mois sans travailler plus.",
    date: '5 mai 2025',
    readTime: '6 min',
  },
  {
    slug: 'prompt-parfait-site-web',
    tag: 'Tutoriel',
    title: 'Écrire le prompt parfait pour générer votre site web idéal',
    excerpt: 'La qualité du résultat dépend de la qualité de votre description. Voici les formules qui donnent systématiquement les meilleurs résultats.',
    date: '28 avril 2025',
    readTime: '5 min',
  },
  {
    slug: 'agence-web-ia-workflow',
    tag: 'Agence',
    title: "Comment les agences web intègrent l'IA dans leur workflow de production",
    excerpt: "Générer 10 drafts clients en 5 minutes. Présenter plusieurs directions créatives sans surcoût. Les agences qui ont adopté CreateIt témoignent.",
    date: '20 avril 2025',
    readTime: '7 min',
  },
  {
    slug: 'exporter-site-heberger-partout',
    tag: 'Guide',
    title: "Exporter son site CreateIt et l'héberger n'importe où",
    excerpt: "Le code HTML/CSS/JS généré par CreateIt vous appartient. Voici comment l'héberger sur Netlify, Vercel, GitHub Pages ou votre propre serveur.",
    date: '14 avril 2025',
    readTime: '5 min',
  },
  {
    slug: 'entrepreneur-landing-page-rapide',
    tag: 'Entrepreneur',
    title: "Lancer une landing page en une heure : le guide de l'entrepreneur pressé",
    excerpt: "Pas de budget, pas de dev, pas le temps. Voici comment valider une idée avec une page soignée avant même d'avoir un produit.",
    date: '7 avril 2025',
    readTime: '4 min',
  },
]

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  Guide:        { bg: 'rgba(124,58,237,0.1)',  color: '#7C3AED' },
  Freelance:    { bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
  Tutoriel:     { bg: 'rgba(245,158,11,0.1)',  color: '#D97706' },
  Agence:       { bg: 'rgba(59,130,246,0.1)',  color: '#2563EB' },
  Entrepreneur: { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626' },
}

export default function BlogPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />

      <AuroraBackground intensity="subtle" className="pt-[60px]">
        <section className="max-w-3xl mx-auto px-5 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" style={{ color: 'var(--fg)' }}>
            Conseils, guides & actualités
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Tout ce que vous devez savoir pour créer, lancer et gérer un site web professionnel avec l&apos;IA.
          </p>
        </section>
      </AuroraBackground>

      <section className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-5">
            {ARTICLES.map((article, i) => {
              const tagStyle = TAG_COLORS[article.tag] ?? { bg: 'var(--surface-2)', color: 'var(--fg-muted)' }
              return (
                <GlassCard key={article.slug} hover className="group">
                  <Link
                    href={`/blog/${article.slug}`}
                    style={{ textDecoration: 'none', display: 'block', padding: '1.5rem' }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <span
                        className="hidden sm:flex shrink-0 items-center justify-center w-10 h-10 rounded-xl text-sm font-bold"
                        style={{ background: 'var(--surface-2)', color: 'var(--fg-subtle)' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: tagStyle.bg, color: tagStyle.color }}
                          >
                            {article.tag}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
                            {article.date} · {article.readTime} de lecture
                          </span>
                        </div>
                        <h2 className="text-base font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>
                          {article.title}
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                          {article.excerpt}
                        </p>
                      </div>

                      <ArrowRight
                        size={16}
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                        style={{ color: 'var(--accent)' }}
                      />
                    </div>
                  </Link>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 px-5" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-3" style={{ color: 'var(--fg)' }}>
            Restez informé
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
            Nouveaux articles, fonctionnalités et conseils — directement dans votre boîte mail.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--border)',
                color: 'var(--fg)',
              }}
            />
            <button
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              S&apos;abonner
            </button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
