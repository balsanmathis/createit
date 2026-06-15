import type { Metadata } from 'next'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import GlassCard from '@/components/ui/GlassCard'

export const metadata: Metadata = { title: 'Politique de cookies — CreateIt' }

const COOKIES = [
  { name: 'sb-*', type: 'Authentification', purpose: 'Session utilisateur Supabase', duration: '7 jours', required: true },
  { name: '__stripe_*', type: 'Paiement', purpose: 'Détection de fraude Stripe', duration: 'Session', required: true },
  { name: 'locale', type: 'Préférences', purpose: 'Langue sélectionnée (FR/EN)', duration: '1 an', required: false },
  { name: '_vercel_*', type: 'Performance', purpose: 'Analytics Vercel (anonymisé)', duration: '1 an', required: false },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--fg)' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function CookiesPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>Politique de cookies</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--fg-subtle)' }}>Dernière mise à jour : mai 2025</p>

        <GlassCard className="p-8 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          <Section title="Qu'est-ce qu'un cookie ?">
            <p>Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d&apos;un site. Il permet de mémoriser des informations sur votre session et vos préférences.</p>
          </Section>

          <Section title="Cookies utilisés">
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Nom', 'Type', 'Finalité', 'Durée', 'Obligatoire'].map(h => (
                      <th key={h} className="py-2 pr-3 text-left font-semibold" style={{ color: 'var(--fg)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COOKIES.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2 pr-3 font-mono" style={{ color: 'var(--fg)' }}>{c.name}</td>
                      <td className="py-2 pr-3">{c.type}</td>
                      <td className="py-2 pr-3">{c.purpose}</td>
                      <td className="py-2 pr-3">{c.duration}</td>
                      <td className="py-2 pr-3">{c.required ? 'Oui' : 'Non'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Cookies tiers publicitaires">
            <p>CreateIt n&apos;utilise <strong style={{ color: 'var(--fg)' }}>aucun cookie publicitaire ou de tracking</strong> à des fins de ciblage commercial. Nous ne revendons aucune donnée à des tiers.</p>
          </Section>

          <Section title="Comment gérer les cookies ?">
            <p>Vous pouvez gérer ou supprimer les cookies via les paramètres de votre navigateur :</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Chrome</a></li>
              <li><a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Firefox</a></li>
              <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Safari</a></li>
            </ul>
            <p className="mt-2">La désactivation des cookies obligatoires (authentification) empêche la connexion au service.</p>
          </Section>

          <Section title="Contact">
            <p>Pour toute question : <a href="mailto:createitapp@gmail.com" style={{ color: 'var(--accent)' }}>createitapp@gmail.com</a></p>
          </Section>
        </GlassCard>
      </main>
      <PublicFooter />
    </div>
  )
}
