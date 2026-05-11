import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const VERCEL_ANALYTICS_URL = 'https://vercel.com/balsanmathis-projects/createit/analytics'

// ─── Data fetching ────────────────────────────────────────────────────────────

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getStats() {
  const db = serviceClient()
  const now = new Date()
  const startOfDay   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

  const [usersTotal, usersMonth, sitesDay, sitesMonth, sitesTotal] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }),
    db.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    db.from('sites').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
    db.from('sites').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    db.from('sites').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalUsers:     usersTotal.count  ?? 0,
    usersThisMonth: usersMonth.count  ?? 0,
    sitesToday:     sitesDay.count    ?? 0,
    sitesThisMonth: sitesMonth.count  ?? 0,
    totalSites:     sitesTotal.count  ?? 0,
  }
}

async function getRecentUsers() {
  const { data } = await serviceClient()
    .from('users')
    .select('id, email, plan, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return (data ?? []) as { id: string; email: string; plan: string; created_at: string }[]
}

async function getRecentSites() {
  const db = serviceClient()
  const { data: sites } = await db
    .from('sites')
    .select('id, name, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!sites?.length) return []

  const userIds = [...new Set(sites.map((s: { user_id: string }) => s.user_id))]
  const { data: users } = await db.from('users').select('id, email').in('id', userIds)
  const emailMap = new Map((users ?? []).map((u: { id: string; email: string }) => [u.id, u.email]))

  return sites.map((s: { id: string; name: string; user_id: string; created_at: string }) => ({
    ...s,
    userEmail: emailMap.get(s.user_id) as string | undefined,
  }))
}

async function getStripeRevenue() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const now = new Date()
  const start = Math.floor(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).getTime() / 1000)

  let revenue = 0
  let hasMore = true
  let startingAfter: string | undefined

  while (hasMore) {
    const res = await stripe.invoices.list({
      created: { gte: start },
      status: 'paid',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    revenue += res.data.reduce((s, inv) => s + inv.amount_paid / 100, 0)
    hasMore = res.has_more
    if (hasMore && res.data.length) startingAfter = res.data[res.data.length - 1].id
  }

  return revenue
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function PlanBadge({ plan }: { plan: string }) {
  const s: Record<string, string> = {
    starter: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
    pro:     'bg-violet-500/20 text-violet-300 border-violet-500/20',
    agency:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${s[plan] ?? 'bg-white/5 text-white/30 border-white/10'}`}>
      {plan || 'gratuit'}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const [stats, recentUsers, recentSites, revenue] = await Promise.all([
    getStats(),
    getRecentUsers(),
    getRecentSites(),
    getStripeRevenue(),
  ])

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <DashboardSidebar activeHref="/analytics" />

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white">Analytics</h1>
              <p className="text-white/30 text-sm mt-0.5">create-it.app — {monthLabel}</p>
            </div>
            <a
              href={VERCEL_ANALYTICS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 glass border border-white/10 text-white/60 hover:text-white hover:border-violet-500/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Voir le trafic complet
              <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/5">
              <p className="text-3xl font-black text-white">{stats.totalUsers.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-white/40 mt-1">Utilisateurs inscrits</p>
              <p className="text-xs text-white/25 mt-1">+{stats.usersThisMonth} ce mois</p>
            </div>

            <div className="glass rounded-2xl p-5 border border-violet-500/20 bg-violet-500/5">
              <p className="text-3xl font-black text-white">{stats.sitesToday.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-white/40 mt-1">Sites générés aujourd&apos;hui</p>
            </div>

            <div className="glass rounded-2xl p-5 border border-violet-500/20 bg-violet-500/5">
              <p className="text-3xl font-black text-white">{stats.sitesThisMonth.toLocaleString('fr-FR')}</p>
              <p className="text-xs text-white/40 mt-1">Sites générés ce mois</p>
              <p className="text-xs text-white/25 mt-1">{stats.totalSites} au total</p>
            </div>

            <div className="glass rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
              <p className="text-3xl font-black text-white">
                {revenue.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
              </p>
              <p className="text-xs text-white/40 mt-1">Revenus {monthLabel}</p>
            </div>
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Last 5 registrations */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                <h2 className="text-sm font-bold text-white">Dernières inscriptions</h2>
              </div>
              {recentUsers.length === 0 ? (
                <p className="px-6 py-5 text-white/25 text-sm">Aucun utilisateur</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3 px-6 py-3.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-xs text-white/60 font-semibold shrink-0">
                        {u.email?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">{u.email}</p>
                        <p className="text-xs text-white/25">{fmt(u.created_at)}</p>
                      </div>
                      <PlanBadge plan={u.plan} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Last 5 generated sites */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0"></span>
                <h2 className="text-sm font-bold text-white">Derniers sites générés</h2>
              </div>
              {recentSites.length === 0 ? (
                <p className="px-6 py-5 text-white/25 text-sm">Aucun site généré</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentSites.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-6 py-3.5">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">{s.name || 'Sans titre'}</p>
                        <p className="text-xs text-white/25 truncate">
                          {s.userEmail ?? `${s.user_id.slice(0, 8)}…`}
                        </p>
                      </div>
                      <p className="text-xs text-white/25 shrink-0">{fmt(s.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
