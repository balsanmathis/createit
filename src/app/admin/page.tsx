import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import AdminChart from '@/components/admin/AdminChart'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

interface SupabaseStats {
  totalUsers: number
  totalSites: number
  usersThisMonth: number
  sitesThisMonth: number
}

interface AnalyticsData {
  visitors: { today: number; week: number; month: number }
  topPages: { path: string; views: number }[]
  chartData: { date: string; users: number }[]
}

async function getSupabaseStats(): Promise<SupabaseStats> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [usersTotal, sitesTotal, usersMonth, sitesMonth] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('sites').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
    supabase.from('sites').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
  ])

  return {
    totalUsers: usersTotal.count ?? 0,
    totalSites: sitesTotal.count ?? 0,
    usersThisMonth: usersMonth.count ?? 0,
    sitesThisMonth: sitesMonth.count ?? 0,
  }
}

async function getStripeRevenue(): Promise<number> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const firstDayOfMonth = Math.floor(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime() / 1000
  )

  let revenue = 0
  let hasMore = true
  let startingAfter: string | undefined

  while (hasMore) {
    const invoices = await stripe.invoices.list({
      created: { gte: firstDayOfMonth },
      status: 'paid',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    revenue += invoices.data.reduce((sum, inv) => sum + inv.amount_paid / 100, 0)
    hasMore = invoices.has_more
    if (hasMore && invoices.data.length > 0) {
      startingAfter = invoices.data[invoices.data.length - 1].id
    }
  }

  return revenue
}

async function getAnalyticsData(): Promise<AnalyticsData | null> {
  if (
    !process.env.GA_PROPERTY_ID ||
    !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY
  ) {
    return null
  }

  try {
    const ga = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    })

    const prop = `properties/${process.env.GA_PROPERTY_ID}`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = await Promise.all([
      ga.runReport({ property: prop, dateRanges: [{ startDate: 'today', endDate: 'today' }], metrics: [{ name: 'activeUsers' }] }),
      ga.runReport({ property: prop, dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], metrics: [{ name: 'activeUsers' }] }),
      ga.runReport({ property: prop, dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], metrics: [{ name: 'activeUsers' }] }),
      ga.runReport({
        property: prop,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 8,
      }),
      ga.runReport({
        property: prop,
        dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
    ])

    // Each result is a tuple [response, request, metadata] from the gRPC client
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getMetric = (res: any) => parseInt(res[0]?.rows?.[0]?.metricValues?.[0]?.value ?? '0')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getRows = (res: any): any[] => res[0]?.rows ?? []

    return {
      visitors: {
        today: getMetric(results[0]),
        week: getMetric(results[1]),
        month: getMetric(results[2]),
      },
      topPages: getRows(results[3]).map((row: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        path: row.dimensionValues?.[0]?.value ?? '/',
        views: parseInt(row.metricValues?.[0]?.value ?? '0'),
      })),
      chartData: getRows(results[4]).map((row: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        date: row.dimensionValues?.[0]?.value ?? '',
        users: parseInt(row.metricValues?.[0]?.value ?? '0'),
      })),
    }
  } catch (err) {
    console.error('[Admin] GA Data API error:', err)
    return null
  }
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: string
  accent: 'violet' | 'indigo' | 'amber' | 'emerald'
}) {
  const styles = {
    violet: 'border-violet-500/20 bg-violet-500/5',
    indigo: 'border-indigo-500/20 bg-indigo-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
  }

  return (
    <div className={`glass rounded-2xl p-5 border ${styles[accent]} flex flex-col gap-3`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-white/25 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  const [supabaseStats, stripeRevenue, analyticsData] = await Promise.all([
    getSupabaseStats(),
    getStripeRevenue(),
    getAnalyticsData(),
  ])

  const now = new Date()
  const monthLabel = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <DashboardSidebar activeHref="/dashboard">
        <div className="glass rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-400 text-sm">⚡</span>
            <span className="text-xs font-semibold text-amber-300">Admin</span>
          </div>
          <p className="text-xs text-white/30 truncate">{user.email}</p>
          <a
            href="/admin"
            className="block mt-2 text-xs text-center bg-amber-500/15 text-amber-300 border border-amber-500/20 py-1.5 rounded-lg font-medium hover:bg-amber-500/25 transition-colors"
          >
            Dashboard admin →
          </a>
        </div>
      </DashboardSidebar>

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Admin Dashboard</h1>
              <p className="text-white/30 text-sm">create-it.app — {monthLabel}</p>
            </div>
          </div>

          {/* GA not configured banner */}
          {!analyticsData && (
            <div className="glass rounded-2xl p-4 border border-white/5 mb-6 flex items-start gap-3">
              <span className="text-white/20 text-lg mt-0.5">📊</span>
              <div>
                <p className="text-sm text-white/50 font-medium">Google Analytics Data API non configuré</p>
                <p className="text-xs text-white/25 mt-0.5">
                  Ajoutez <code className="text-violet-400/70">GA_PROPERTY_ID</code>,{' '}
                  <code className="text-violet-400/70">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> et{' '}
                  <code className="text-violet-400/70">GOOGLE_PRIVATE_KEY</code> dans vos variables d&apos;environnement.
                </p>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {analyticsData ? (
              <>
                <StatCard
                  label="Visiteurs aujourd'hui"
                  value={analyticsData.visitors.today.toLocaleString('fr-FR')}
                  icon="👁"
                  accent="violet"
                />
                <StatCard
                  label="Visiteurs cette semaine"
                  value={analyticsData.visitors.week.toLocaleString('fr-FR')}
                  icon="📈"
                  accent="violet"
                />
                <StatCard
                  label="Visiteurs ce mois"
                  value={analyticsData.visitors.month.toLocaleString('fr-FR')}
                  icon="🌐"
                  accent="violet"
                />
              </>
            ) : (
              <>
                <StatCard label="Visiteurs aujourd'hui" value="—" icon="👁" accent="violet" />
                <StatCard label="Visiteurs cette semaine" value="—" icon="📈" accent="violet" />
                <StatCard label="Visiteurs ce mois" value="—" icon="🌐" accent="violet" />
              </>
            )}

            <StatCard
              label="Utilisateurs inscrits"
              value={supabaseStats.totalUsers.toLocaleString('fr-FR')}
              sub={`+${supabaseStats.usersThisMonth} ce mois`}
              icon="👤"
              accent="indigo"
            />
            <StatCard
              label="Sites générés"
              value={supabaseStats.totalSites.toLocaleString('fr-FR')}
              sub={`+${supabaseStats.sitesThisMonth} ce mois`}
              icon="🖥"
              accent="indigo"
            />
            <StatCard
              label={`Revenus — ${monthLabel}`}
              value={`${stripeRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`}
              icon="💰"
              accent="amber"
            />
          </div>

          {/* 30-day chart */}
          {analyticsData && analyticsData.chartData.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-white/5 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-white">Visiteurs — 30 derniers jours</h2>
                <span className="text-xs text-white/25">
                  {analyticsData.chartData.reduce((s, d) => s + d.users, 0).toLocaleString('fr-FR')} au total
                </span>
              </div>
              <AdminChart data={analyticsData.chartData} />
            </div>
          )}

          {/* Top pages */}
          {analyticsData && analyticsData.topPages.length > 0 && (
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-base font-bold text-white mb-5">Pages les plus visitées — 30 jours</h2>
              <div className="space-y-4">
                {analyticsData.topPages.map((page, i) => {
                  const pct = (page.views / analyticsData.topPages[0].views) * 100
                  return (
                    <div key={page.path} className="flex items-center gap-4">
                      <span className="text-white/20 text-xs font-mono w-4 shrink-0">{i + 1}</span>
                      <span className="flex-1 text-white/60 text-sm font-mono truncate min-w-0">{page.path}</span>
                      <span className="text-white/40 text-xs shrink-0">
                        {page.views.toLocaleString('fr-FR')} vues
                      </span>
                      <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
