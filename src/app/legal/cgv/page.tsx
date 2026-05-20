import type { Metadata } from 'next'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import GlassCard from '@/components/ui/GlassCard'

export const metadata: Metadata = { title: 'CGV — CreateIt' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--fg)' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function CGVPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>Conditions Générales de Vente</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--fg-subtle)' }}>Dernière mise à jour : mai 2025</p>

        <GlassCard className="p-8 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          <Section title="1. Objet">
            <p>Les présentes CGV régissent les ventes de services d&apos;abonnement à la plateforme CreateIt (create-it.app), permettant la génération de sites web par intelligence artificielle.</p>
          </Section>

          <Section title="2. Plans et tarifs">
            <p>CreateIt propose les plans suivants :</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li><strong style={{ color: 'var(--fg)' }}>Gratuit</strong> — 0 €/mois, 8 000 tokens</li>
              <li><strong style={{ color: 'var(--fg)' }}>Starter</strong> — 20 €/mois (ou 192 €/an), 800 000 tokens</li>
              <li><strong style={{ color: 'var(--fg)' }}>Pro</strong> — 45 €/mois (ou 432 €/an), 2 400 000 tokens</li>
              <li><strong style={{ color: 'var(--fg)' }}>Agency</strong> — 250 €/mois (ou 2 400 €/an), 16 000 000 tokens</li>
            </ul>
            <p className="mt-2">Tous les prix s&apos;entendent TTC. Les abonnements annuels bénéficient d&apos;une réduction de 20 %.</p>
          </Section>

          <Section title="3. Commande et paiement">
            <p>L&apos;abonnement est souscrit en ligne via la plateforme. Le paiement est effectué par carte bancaire via Stripe, prestataire de paiement sécurisé. Aucune donnée bancaire n&apos;est stockée sur nos serveurs.</p>
          </Section>

          <Section title="4. Droit de rétractation">
            <p>Conformément à l&apos;article L. 221-28 du Code de la consommation, le droit de rétractation de 14 jours ne s&apos;applique pas aux contenus numériques fournis immédiatement après souscription, sous réserve de l&apos;accord préalable de l&apos;utilisateur. Cet accord est recueilli lors de la souscription.</p>
          </Section>

          <Section title="5. Résiliation">
            <p>Vous pouvez résilier votre abonnement à tout moment depuis votre tableau de bord. La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement n&apos;est effectué pour la période déjà facturée.</p>
          </Section>

          <Section title="6. Propriété du contenu généré">
            <p>Les sites web générés via CreateIt vous appartiennent intégralement. Vous êtes libre de les utiliser, modifier, héberger et revendre (sauf plan Gratuit) sans restriction. CreateIt ne conserve aucun droit sur le contenu généré.</p>
          </Section>

          <Section title="7. Limitation de responsabilité">
            <p>CreateIt SAS ne peut être tenu responsable de l&apos;inadéquation du contenu généré aux besoins spécifiques de l&apos;utilisateur, ni des dommages indirects résultant de l&apos;utilisation du service.</p>
          </Section>

          <Section title="8. Loi applicable">
            <p>Les présentes CGV sont soumises au droit français. Tout litige sera soumis aux juridictions compétentes de Paris.</p>
          </Section>
        </GlassCard>
      </main>
      <PublicFooter />
    </div>
  )
}
