import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GlassCard from '@/components/ui/GlassCard'

const FAQ = [
  {
    q: "Comment générer mon premier site ?",
    a: "Cliquez sur \"Nouveau site\" dans la barre latérale, décrivez votre site en quelques phrases, choisissez la qualité, puis lancez la génération. L'IA crée le site en 10 à 60 secondes.",
  },
  {
    q: "Qu'est-ce qu'un token ?",
    a: "Un token représente environ 4 caractères de texte. Chaque génération consomme un certain nombre de tokens selon le niveau de qualité choisi. Votre quota se renouvelle à chaque cycle de facturation.",
  },
  {
    q: "Puis-je modifier mon site après génération ?",
    a: "Oui. Cliquez sur un site depuis votre dashboard pour ouvrir l'éditeur. Vous pouvez demander des modifications en langage naturel ou éditer le code HTML directement.",
  },
  {
    q: "Comment exporter mon site ?",
    a: "Depuis le dashboard, cliquez sur \"Exporter\" sur la carte d'un site. Vous pouvez télécharger un fichier HTML unique ou une archive ZIP prête à déployer.",
  },
  {
    q: "Puis-je résilier mon abonnement à tout moment ?",
    a: "Oui. Rendez-vous dans Abonnement → Portail Stripe pour gérer ou résilier votre abonnement. La résiliation prend effet à la fin de la période en cours.",
  },
  {
    q: "Mes sites m'appartiennent-ils ?",
    a: "Oui. Tout le contenu généré vous appartient intégralement. Vous êtes libre de l'utiliser, le modifier et le déployer sans restriction (sauf plan Gratuit pour la revente).",
  },
]

export default async function AidePage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/auth/login')

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <DashboardSidebar />
        <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>Aide</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
              Questions fréquentes et ressources pour bien démarrer.
            </p>

            <GlassCard className="p-6 divide-y" style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
              {FAQ.map((item, i) => (
                <div key={i} className="py-5 first:pt-0 last:pb-0">
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--fg)' }}>{item.q}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>{item.a}</p>
                </div>
              ))}
            </GlassCard>

            <div className="mt-6 p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fg)' }}>Vous ne trouvez pas votre réponse ?</p>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Notre équipe répond sous 24h.</p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none' }}
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  } catch {
    redirect('/auth/login')
  }
}
