import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Site } from '@/types'
import SiteCard from '@/components/dashboard/SiteCard'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import PaymentSuccessToast from '@/components/dashboard/PaymentSuccessToast'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return m?.[1]?.trim() ?? ''
}

interface Props {
  searchParams: Promise<{ success?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const isAdmin = user.email === ADMIN_EMAIL

    const [sitesResult, profileResult, subscriptionResult] = await Promise.all([
      supabase.from('sites').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
    ])

    const sites = sitesResult.data
    const profile = profileResult.data
    const subscription = subscriptionResult.data
    const canGenerate = isAdmin || !!subscription

    return (
      <div className="min-h-screen bg-[#080810] text-white">
        {params.success === '1' && <PaymentSuccessToast />}

        <DashboardSidebar activeHref="/dashboard">
          {/* Plan badge */}
          <div className="glass rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Plan actuel</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-300'
                  : subscription
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'bg-white/10 text-white/40'
              }`}>
                {isAdmin ? 'Admin' : subscription ? profile?.plan || 'Pro' : 'Gratuit'}
              </span>
            </div>
            {isAdmin && (
              <p className="text-xs text-amber-300/60">Mode test actif</p>
            )}
            {!isAdmin && subscription && (
              <div>
                <div className="text-xs text-white/40 mb-1">
                  {profile?.sites_used_this_month || 0} sites ce mois
                </div>
                <Link href="/pricing" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  Gérer l&apos;abonnement →
                </Link>
              </div>
            )}
            {!isAdmin && !subscription && (
              <Link
                href="/pricing"
                className="block mt-1 text-xs text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Choisir un plan
              </Link>
            )}
          </div>
        </DashboardSidebar>

        {/* Main */}
        <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Mes sites</h1>
                <p className="text-white/40 text-sm">
                  {sites?.length || 0} site{(sites?.length || 0) !== 1 ? 's' : ''} créé{(sites?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <Link
                href="/generate"
                className={`flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-4 md:px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-violet-500/25 text-sm ${!canGenerate ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nouveau site</span>
                <span className="sm:hidden">Nouveau</span>
              </Link>
            </div>

            {isAdmin && (
              <div className="glass rounded-2xl p-4 border border-amber-500/20 mb-8 flex items-center gap-3">
                <span className="text-amber-400 text-lg">⚡</span>
                <p className="text-sm text-amber-300/80">
                  Mode admin actif — génération illimitée sans abonnement.
                </p>
              </div>
            )}

            {!isAdmin && !subscription && (
              <div className="glass-strong rounded-2xl p-6 border border-violet-500/20 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-white font-semibold mb-1">Aucun plan actif</p>
                  <p className="text-white/50 text-sm">Choisissez un plan pour commencer à générer des sites.</p>
                </div>
                <Link
                  href="/pricing"
                  className="shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Voir les plans
                </Link>
              </div>
            )}

            {sites && sites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {(sites as Site[]).map((site) => (
                  <SiteCard
                    key={site.id}
                    id={site.id}
                    name={site.name}
                    title={extractTitle(site.html_content)}
                    createdAt={site.created_at}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 md:py-24">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun site créé</h3>
                <p className="text-white/40 mb-6 text-sm px-4">Créez votre premier site web en quelques secondes avec l&apos;IA</p>
                {canGenerate && (
                  <Link
                    href="/generate"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Générer mon premier site
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    )
  } catch {
    redirect('/auth/login')
  }
}
