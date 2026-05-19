import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import PromoCodesManager from '@/components/admin/PromoCodesManager'
import LandingContentEditor from '@/components/admin/LandingContentEditor'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const VERCEL_ANALYTICS_URL = 'https://vercel.com/balsanmathis-projects/createit/analytics'

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

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    starter: { bg: '#eff6ff', color: '#2563eb' },
    pro:     { bg: '#f5f3ff', color: '#7c3aed' },
    agency:  { bg: '#ecfdf5', color: '#059669' },
  }
  const s = styles[plan] ?? { bg: '#f1f5f9', color: '#64748b' }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ background: s.bg, color: s.color }}>
      {plan || 'gratuit'}
    </span>
  )
}

interface Props {
  searchParams: Promise<{ tab?: string }>
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const { tab } = await searchParams
  const activeTab = tab === 'promo' ? 'promo' : tab === 'landing' ? 'landing' : 'overview'

  const [stats, recentUsers, recentSites, revenue] = await Promise.all([
    getStats(),
    getRecentUsers(),
    getRecentSites(),
    getStripeRevenue(),
  ])

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeHref="/analytics" />

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0f172a]">Analytics</h1>
              <p className="text-[#94a3b8] text-sm mt-0.5">create-it.app — {monthLabel}</p>
            </div>
            <a
              href={VERCEL_ANALYTICS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1] px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Voir le trafic complet
              <svg className="w-3 h-3 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit bg-white border border-[#e2e8f0] shadow-sm">
            {[
              { key: 'overview', label: 'Vue d\'ensemble', href: '/analytics' },
              { key: 'promo',    label: 'Codes promo',    href: '/analytics?tab=promo' },
              { key: 'landing',  label: 'Landing Page',   href: '/analytics?tab=landing' },
            ].map((t) => (
              <Link
                key={t.key}
                href={t.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={activeTab === t.key
                  ? { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                  : { color: '#64748b', border: '1px solid transparent' }}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { value: stats.totalUsers.toLocaleString('fr-FR'),     label: 'Utilisateurs inscrits',      sub: `+${stats.usersThisMonth} ce mois` },
                  { value: stats.sitesToday.toLocaleString('fr-FR'),     label: "Sites générés aujourd'hui",  sub: null },
                  { value: stats.sitesThisMonth.toLocaleString('fr-FR'), label: 'Sites générés ce mois',      sub: `${stats.totalSites} au total` },
                  { value: `${revenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`, label: `Revenus ${monthLabel}`, sub: null },
                ].map((card, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-[#e2e8f0] shadow-sm">
                    <p className="text-3xl font-black text-[#2563eb]">{card.value}</p>
                    <p className="text-xs text-[#64748b] mt-1">{card.label}</p>
                    {card.sub && <p className="text-xs text-[#94a3b8] mt-0.5">{card.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Last 5 registrations */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb] shrink-0"></span>
                    <h2 className="text-sm font-semibold text-[#0f172a]">Dernières inscriptions</h2>
                  </div>
                  {recentUsers.length === 0 ? (
                    <p className="px-5 py-5 text-[#94a3b8] text-sm">Aucun utilisateur</p>
                  ) : (
                    <div className="divide-y divide-[#f1f5f9]">
                      {recentUsers.map(u => (
                        <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                          <div className="w-8 h-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-xs text-[#2563eb] font-semibold shrink-0">
                            {u.email?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0f172a] truncate">{u.email}</p>
                            <p className="text-xs text-[#94a3b8]">{fmt(u.created_at)}</p>
                          </div>
                          <PlanBadge plan={u.plan} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Last 5 generated sites */}
                <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb] shrink-0"></span>
                    <h2 className="text-sm font-semibold text-[#0f172a]">Derniers sites générés</h2>
                  </div>
                  {recentSites.length === 0 ? (
                    <p className="px-5 py-5 text-[#94a3b8] text-sm">Aucun site généré</p>
                  ) : (
                    <div className="divide-y divide-[#f1f5f9]">
                      {recentSites.map(s => (
                        <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                          <div className="w-8 h-8 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#0f172a] truncate">{s.name || 'Sans titre'}</p>
                            <p className="text-xs text-[#94a3b8] truncate">
                              {s.userEmail ?? `${s.user_id.slice(0, 8)}…`}
                            </p>
                          </div>
                          <p className="text-xs text-[#94a3b8] shrink-0">{fmt(s.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

          {activeTab === 'promo' && <PromoCodesManager />}
          {activeTab === 'landing' && <LandingContentEditor />}

        </div>
      </main>
    </div>
  )
}
