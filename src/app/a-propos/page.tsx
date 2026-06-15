import type { Metadata } from 'next'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'À propos — CreateIt',
  description: 'CreateIt est un générateur de sites web par IA fondé sur une conviction : créer une présence web professionnelle ne devrait pas prendre des semaines.',
}

const VALUES = [
  {
    title: 'Vitesse sans compromis',
    desc: 'Un site en 30 secondes, pas une maquette. Du code propre, exportable, hébergeable partout. Aucun intermédiaire.',
  },
  {
    title: 'Vous possédez votre code',
    desc: 'Zéro lock-in. Le ZIP que vous téléchargez est du HTML/CSS/JS pur. Vous pouvez l\'ouvrir dans VS Code, le modifier, le revendre.',
  },
  {
    title: 'Français d\'abord',
    desc: 'Le produit, le support et la documentation sont en français. Parce que la barrière de la langue ne devrait pas exister.',
  },
]

export default function AProposPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />

      {/* Hero */}
      <AuroraBackground intensity="subtle" className="pt-[60px]">
        <section className="max-w-3xl mx-auto px-5 py-20 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--accent)' }}>
            À propos
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" style={{ color: 'var(--fg)' }}>
            Créer un site ne devrait pas prendre des semaines
          </h1>
          <p className="text-base sm:text-lg" style={{ color: 'var(--fg-muted)' }}>
            CreateIt est né d&apos;une frustration simple : trop de freelances, entrepreneurs et agences perdent des jours entiers sur la phase technique alors que leur valeur est ailleurs.
          </p>
        </section>
      </AuroraBackground>

      {/* Mission */}
      <section className="py-16 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-8 sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight mb-5" style={{ color: 'var(--fg)' }}>
              Notre mission
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--fg-muted)' }}>
              Donner à n&apos;importe qui — qu&apos;il soit développeur ou non — la capacité de créer un site web professionnel en décrivant simplement ce qu&apos;il veut, en français, en quelques phrases.
            </p>
            <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--fg-muted)' }}>
              L&apos;IA génère la structure, le contenu, le design. Vous exportez le code, vous hébergez où vous voulez. Pas d&apos;abonnement d&apos;hébergement imposé, pas de plateforme propriétaire, pas de dépendance.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              Nous pensons que la technologie doit réduire la friction, pas en créer de nouvelles.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-5" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-center mb-10" style={{ color: 'var(--fg)' }}>
            Ce en quoi nous croyons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VALUES.map(v => (
              <GlassCard key={v.title} hover className="p-7">
                <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--fg)' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{v.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Histoire */}
      <section className="py-16 px-5" style={{ background: 'var(--bg)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-6" style={{ color: 'var(--fg)' }}>
            L&apos;histoire
          </h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            <p>
              CreateIt a été construit en 2025 par une équipe qui avait vécu de l&apos;intérieur la douleur de créer des sites web clients : les allers-retours infinis, les maquettes Figma qui ne se traduisent jamais exactement en code, les projets bloqués sur des détails techniques.
            </p>
            <p>
              Avec l&apos;émergence des LLMs capables de générer du code HTML/CSS de qualité, nous avons eu une conviction simple : si l&apos;IA peut écrire du code, elle peut écrire <em>le bon code</em> pour <em>le bon projet</em> si on lui donne le bon contexte.
            </p>
            <p>
              Nous avons construit CreateIt pour répondre à cette conviction. Le résultat : 2 847 sites créés le mois dernier par des freelances, entrepreneurs et agences qui ont retrouvé du temps pour ce qui compte vraiment.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 text-center" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <h2 className="text-2xl font-bold tracking-tight mb-4" style={{ color: 'var(--fg)' }}>
          Une question ? Une idée ?
        </h2>
        <p className="text-base mb-6" style={{ color: 'var(--fg-muted)' }}>
          Nous lisons tous les messages.
        </p>
        <a
          href="mailto:createitapp@gmail.com"
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          Nous contacter <ArrowRight size={14} />
        </a>
      </section>

      <PublicFooter />
    </div>
  )
}
