import type { Metadata } from 'next'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import GlassCard from '@/components/ui/GlassCard'

export const metadata: Metadata = { title: 'Mentions légales — CreateIt' }

export default function MentionsLegalesPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>Mentions légales</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--fg-subtle)' }}>Dernière mise à jour : mai 2025</p>

        <GlassCard className="p-8 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          <Section title="Éditeur du site">
            <p>Le site <strong style={{ color: 'var(--fg)' }}>CreateIt</strong> (create-it.app) est édité par :</p>
            <p className="mt-2">
              CreateIt SAS<br />
              Capital social : 1 000 €<br />
              RCS Paris — numéro en cours d&apos;immatriculation<br />
              Siège social : Paris, France<br />
              Email : <a href="mailto:bonjour@create-it.app" style={{ color: 'var(--accent)' }}>bonjour@create-it.app</a>
            </p>
          </Section>

          <Section title="Directeur de la publication">
            <p>Mathis Balsan, co-fondateur de CreateIt.</p>
          </Section>

          <Section title="Hébergement">
            <p>
              Le site est hébergé par <strong style={{ color: 'var(--fg)' }}>Vercel Inc.</strong><br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>vercel.com</a>
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, logotypes, interface graphique) est la propriété exclusive de CreateIt SAS, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
            </p>
          </Section>

          <Section title="Limitation de responsabilité">
            <p>
              CreateIt SAS ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du service. Les sites générés par l&apos;IA sont fournis « en l&apos;état » ; il appartient à l&apos;utilisateur de vérifier leur contenu avant diffusion.
            </p>
          </Section>

          <Section title="Médiation">
            <p>
              En cas de litige, vous pouvez recourir au service de médiation de votre choix. Conformément à l&apos;article L. 612-1 du Code de la consommation, nous adhérons au dispositif de médiation disponible sur <a href="https://www.mediation-conso.fr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>mediation-conso.fr</a>.
            </p>
          </Section>
        </GlassCard>
      </main>
      <PublicFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--fg)' }}>{title}</h2>
      {children}
    </div>
  )
}
