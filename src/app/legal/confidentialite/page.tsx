import type { Metadata } from 'next'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import GlassCard from '@/components/ui/GlassCard'

export const metadata: Metadata = { title: 'Politique de confidentialité — CreateIt' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--fg)' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function ConfidentialitePage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <PublicNav />
      <main className="max-w-3xl mx-auto px-5 pt-24 pb-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>Politique de confidentialité</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--fg-subtle)' }}>Dernière mise à jour : mai 2025</p>

        <GlassCard className="p-8 space-y-8 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          <Section title="1. Responsable du traitement">
            <p>CreateIt SAS, Paris, France. Contact : <a href="mailto:createitapp@gmail.com" style={{ color: 'var(--accent)' }}>createitapp@gmail.com</a></p>
          </Section>

          <Section title="2. Données collectées">
            <p>Lors de l&apos;utilisation de CreateIt, nous collectons :</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Données d&apos;identification : email, mot de passe (haché), prénom</li>
              <li>Données d&apos;usage : prompts saisis, sites générés, tokens consommés</li>
              <li>Données de paiement : traitées directement par Stripe (non stockées chez nous)</li>
              <li>Données techniques : adresse IP, User-Agent, logs de connexion</li>
            </ul>
          </Section>

          <Section title="3. Finalités du traitement">
            <ul className="space-y-1 list-disc pl-5">
              <li>Fourniture du service de génération de sites web</li>
              <li>Gestion de votre compte et abonnement</li>
              <li>Amélioration du service (données agrégées et anonymisées)</li>
              <li>Envoi d&apos;emails transactionnels (confirmation, facturation)</li>
              <li>Sécurité et prévention de la fraude</li>
            </ul>
          </Section>

          <Section title="4. Base légale">
            <p>Le traitement est fondé sur l&apos;exécution du contrat (fourniture du service) et sur votre consentement pour les communications optionnelles.</p>
          </Section>

          <Section title="5. Durée de conservation">
            <p>Vos données sont conservées pendant la durée de votre abonnement, puis 3 ans à compter de la clôture de votre compte (obligations légales comptables). Les données de log sont conservées 1 an.</p>
          </Section>

          <Section title="6. Sous-traitants">
            <p>Nous faisons appel aux sous-traitants suivants, tous conformes au RGPD :</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li><strong style={{ color: 'var(--fg)' }}>Supabase</strong> — hébergement base de données (EU)</li>
              <li><strong style={{ color: 'var(--fg)' }}>Vercel</strong> — hébergement application</li>
              <li><strong style={{ color: 'var(--fg)' }}>Stripe</strong> — paiement</li>
              <li><strong style={{ color: 'var(--fg)' }}>Anthropic</strong> — génération IA (prompts non conservés au-delà de 30 jours)</li>
              <li><strong style={{ color: 'var(--fg)' }}>Resend</strong> — email transactionnel</li>
            </ul>
          </Section>

          <Section title="7. Vos droits">
            <p>Conformément au RGPD, vous disposez des droits d&apos;accès, rectification, effacement, portabilité et opposition. Pour les exercer : <a href="mailto:createitapp@gmail.com" style={{ color: 'var(--accent)' }}>createitapp@gmail.com</a>. Réponse sous 30 jours. Vous pouvez également saisir la CNIL.</p>
          </Section>

          <Section title="8. Cookies">
            <p>Voir notre <a href="/legal/cookies" style={{ color: 'var(--accent)' }}>politique de cookies</a> dédiée.</p>
          </Section>
        </GlassCard>
      </main>
      <PublicFooter />
    </div>
  )
}
