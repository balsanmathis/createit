import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GlassCard from '@/components/ui/GlassCard'
import AbonnementActions from './AbonnementActions'

const PLANS: Record<string, { label: string; tokens: string; price: string }> = {
  free:    { label: 'Gratuit', tokens: '8 000',        price: '0 €/mois' },
  starter: { label: 'Starter', tokens: '800 000',      price: '20 €/mois' },
  pro:     { label: 'Pro',     tokens: '2 400 000',    price: '45 €/mois' },
  ultra:   { label: 'Ultra',   tokens: '16 000 000',   price: '250 €/mois' },
  agency:  { label: 'Agency',  tokens: '35 000 000',   price: '399 €/mois' },
}

export default async function AbonnementPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/auth/login')

    const [profileResult, subscriptionResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
    ])

    const profile = profileResult.data
    const subscription = subscriptionResult.data
    const planKey = profile?.plan || 'free'
    const plan = PLANS[planKey] ?? PLANS.free

    const tokensUsed = profile?.tokens_used ?? 0
    const tokensLimit = profile?.tokens_limit ?? 8_000
    const tokensRemaining = Math.max(0, tokensLimit - tokensUsed)
    const tokenPct = tokensLimit > 0 ? Math.round((tokensRemaining / tokensLimit) * 100) : 0

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <DashboardSidebar />
        <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold tracking-tight mb-8" style={{ color: 'var(--fg)' }}>Abonnement</h1>

            <div className="space-y-6">
              {/* Current plan */}
              <GlassCard className="p-6">
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--fg)' }}>Plan actuel</h2>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{plan.label}</p>
                    <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{plan.price}</p>
                  </div>
                  {subscription && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      Actif
                    </span>
                  )}
                </div>
                {subscription && (
                  <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                    Renouvellement automatique · Résiliez à tout moment depuis le portail client
                  </p>
                )}
              </GlassCard>

              {/* Token usage */}
              <GlassCard className="p-6">
                <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--fg)' }}>Utilisation des tokens</h2>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    {tokensRemaining.toLocaleString('fr-FR')} restants sur {tokensLimit.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: tokenPct > 20 ? 'var(--accent)' : '#ef4444' }}>
                    {tokenPct}%
                  </p>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${tokenPct}%`,
                      background: tokenPct > 50 ? 'var(--accent)' : tokenPct > 20 ? '#f97316' : '#ef4444',
                    }}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
                  {tokensUsed.toLocaleString('fr-FR')} tokens utilisés ce cycle
                </p>
              </GlassCard>

              {/* Actions */}
              <AbonnementActions hasSubscription={!!subscription} />

              {/* Upgrade CTA */}
              {!subscription && (
                <div className="rounded-2xl p-6 text-center"
                  style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--fg)' }}>Passez à un plan payant</p>
                  <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
                    Débloquez jusqu&apos;à 16 millions de tokens et des fonctionnalités avancées.
                  </p>
                  <Link
                    href="/tarifs"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--accent)' }}
                  >
                    Voir les plans →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  } catch {
    redirect('/auth/login')
  }
}
