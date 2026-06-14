import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import RevenueChart from '@/components/admin/RevenueChart'
import SyncButton from '@/components/admin/SyncButton'
import EmailCampaignSection from '@/components/admin/EmailCampaignSection'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const VERCEL_ANALYTICS_URL = 'https://vercel.com/balsanmathis-projects/createit/analytics'

interface AdminStats {
  totalUsers: number
  usersThisMonth: number
  sitesToday: number
  sitesThisMonth: number
  totalSites: number
}

interface RecentUser {
  id: string
  email: string
  plan: string
  created_at: string
}

interface RecentSite {
  id: string
  name: string
  user_id: string
  created_at: string
  userEmail?: string
}

interface PaidSubscriber {
  email: string
  plan: string
  amount: number
  createdAt: number
  subscriptionId: string
}

interface SubscriptionStats {
  mrr: number
  activeCount: number
  byPlan: {
    starter: { count: number; mrr: number }
    pro: { count: number; mrr: number }
    ultra: { count: number; mrr: number }
    agency: { count: number; mrr: number }
  }
  subscribers: PaidSubscriber[]
}

interface RevenueData {
  currentMonth: number
  monthly: { month: string; amount: number }[]
}

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getAdminStats(): Promise<AdminStats> {
  const supabase = getServiceClient()
  const now = new Date()
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

  const [usersTotal, usersMonth, sitesDay, sitesMonth, sitesTotal] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('sites').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay),
    supabase.from('sites').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth),
    supabase.from('sites').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalUsers: usersTotal.count ?? 0,
    usersThisMonth: usersMonth.count ?? 0,
    sitesToday: sitesDay.count ?? 0,
    sitesThisMonth: sitesMonth.count ?? 0,
    totalSites: sitesTotal.count ?? 0,
  }
}

async function getRecentUsers(): Promise<RecentUser[]> {
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('users')
    .select('id, email, plan, created_at')
    .order('created_at', { ascending: false })
    .limit(10)
  return (data ?? []) as RecentUser[]
}

async function getRecentSites(): Promise<RecentSite[]> {
  const supabase = getServiceClient()
  const { data: sites } = await supabase
    .from('sites')
    .select('id, name, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(8)

  if (!sites || sites.length === 0) return []

  const userIds = [...new Set(sites.map((s: { user_id: string }) => s.user_id))]
  const { data: users } = await supabase.from('users').select('id, email').in('id', userIds)

  const emailMap = new Map((users ?? []).map((u: { id: string; email: string }) => [u.id, u.email]))
  return sites.map((s: { id: string; name: string; user_id: string; created_at: string }) => ({
    ...s,
    userEmail: emailMap.get(s.user_id) as string | undefined,
  }))
}

async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const stripe = getStripe()

  const result: SubscriptionStats = {
    mrr: 0,
    activeCount: 0,
    byPlan: {
      starter: { count: 0, mrr: 0 },
      pro: { count: 0, mrr: 0 },
      ultra: { count: 0, mrr: 0 },
      agency: { count: 0, mrr: 0 },
    },
    subscribers: [],
  }

  const priceIdToPlan: Record<string, string> = {}
  if (process.env.STRIPE_STARTER_PRICE_ID) priceIdToPlan[process.env.STRIPE_STARTER_PRICE_ID] = 'starter'
  if (process.env.STRIPE_PRO_PRICE_ID) priceIdToPlan[process.env.STRIPE_PRO_PRICE_ID] = 'pro'
  if (process.env.STRIPE_ULTRA_PRICE_ID) priceIdToPlan[process.env.STRIPE_ULTRA_PRICE_ID] = 'ultra'
  if (process.env.STRIPE_AGENCY_PRICE_ID) priceIdToPlan[process.env.STRIPE_AGENCY_PRICE_ID] = 'agency'

  let hasMore = true
  let startingAfter: string | undefined

  while (hasMore) {
    const batch = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
      expand: ['data.customer'],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })

    for (const sub of batch.data) {
      const priceItem = sub.items.data[0]
      if (!priceItem) continue

      const customer = sub.customer
      let email = sub.id
      if (typeof customer !== 'string' && !('deleted' in customer && customer.deleted)) {
        email = (customer as Stripe.Customer).email ?? sub.id
      }

      const priceId = priceItem.price.id
      const unitAmount = (priceItem.price.unit_amount ?? 0) / 100
      const plan = priceIdToPlan[priceId] ?? 'autre'

      result.mrr += unitAmount
      result.activeCount++

      if (plan === 'starter' || plan === 'pro' || plan === 'ultra' || plan === 'agency') {
        result.byPlan[plan].count++
        result.byPlan[plan].mrr += unitAmount
      }

      result.subscribers.push({ email, plan, amount: unitAmount, createdAt: sub.created, subscriptionId: sub.id })
    }

    hasMore = batch.has_more
    if (hasMore && batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id
  }

  result.subscribers.sort((a, b) => b.createdAt - a.createdAt)
  return result
}

async function getRevenueData(): Promise<RevenueData> {
  const stripe = getStripe()
  const now = new Date()

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1))
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
    return {
      label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      start: Math.floor(d.getTime() / 1000),
      end: Math.floor(end.getTime() / 1000),
    }
  })

  const allInvoices: { amount: number; created: number }[] = []
  let hasMore = true
  let startingAfter: string | undefined

  while (hasMore) {
    const batch = await stripe.invoices.list({
      created: { gte: months[0].start },
      status: 'paid',
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const inv of batch.data) allInvoices.push({ amount: inv.amount_paid / 100, created: inv.created })
    hasMore = batch.has_more
    if (hasMore && batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id
  }

  const monthly = months.map(m => ({
    month: m.label,
    amount: allInvoices
      .filter(inv => inv.created >= m.start && inv.created < m.end)
      .reduce((sum, inv) => sum + inv.amount, 0),
  }))

  const last = months[months.length - 1]
  const currentMonth = allInvoices
    .filter(inv => inv.created >= last.start && inv.created < last.end)
    .reduce((sum, inv) => sum + inv.amount, 0)

  return { currentMonth, monthly }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatUnixDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, string> = {
    starter: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
    pro: 'bg-violet-500/20 text-violet-300 border-violet-500/20',
    agency: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
    autre: 'bg-orange-500/20 text-orange-300 border-orange-500/20',
  }
  const label = plan || 'gratuit'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${styles[plan] ?? 'bg-white/5 text-white/30 border-white/10'}`}>
      {label}
    </span>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const [stats, recentUsers, recentSites, subStats, revenueData] = await Promise.all([
    getAdminStats(),
    getRecentUsers(),
    getRecentSites(),
    getSubscriptionStats(),
    getRevenueData(),
  ])

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const conversionRate = stats.totalUsers > 0
    ? ((subStats.activeCount / stats.totalUsers) * 100).toFixed(1)
    : '0.0'

  const PLAN_CONFIG = {
    starter: { label: 'Starter', color: 'blue', price: 20 },
    pro: { label: 'Pro', color: 'violet', price: 45 },
    agency: { label: 'Agency', color: 'emerald', price: 250 },
  } as const

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <DashboardSidebar />

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-xl">
                ⚡
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">Admin Dashboard</h1>
                <p className="text-white/30 text-sm">create-it.app — {monthLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <SyncButton />
              <a
                href="/admin/users"
                className="flex items-center gap-2 glass border border-white/10 text-white/60 hover:text-white hover:border-violet-500/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Utilisateurs
              </a>
              <a
                href={VERCEL_ANALYTICS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 glass border border-white/10 text-white/60 hover:text-white hover:border-violet-500/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Trafic Vercel
                <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Stats row 1 — utilisateurs & sites */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/5 col-span-2 sm:col-span-1">
              <p className="text-3xl font-black text-white">{fmt(stats.totalUsers)}</p>
              <p className="text-xs text-white/40 mt-1">Utilisateurs inscrits</p>
              <p className="text-xs text-white/25 mt-1">+{stats.usersThisMonth} ce mois</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-violet-500/20 bg-violet-500/5">
              <p className="text-3xl font-black text-white">{fmt(stats.sitesToday)}</p>
              <p className="text-xs text-white/40 mt-1">Sites générés aujourd&apos;hui</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-violet-500/20 bg-violet-500/5">
              <p className="text-3xl font-black text-white">{fmt(stats.sitesThisMonth)}</p>
              <p className="text-xs text-white/40 mt-1">Sites ce mois</p>
              <p className="text-xs text-white/25 mt-1">{fmt(stats.totalSites)} au total</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
              <p className="text-3xl font-black text-white">{fmt(revenueData.currentMonth)} €</p>
              <p className="text-xs text-white/40 mt-1">Revenus {monthLabel}</p>
            </div>
          </div>

          {/* Stats row 2 — revenus & abonnés */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/8 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">MRR</span>
              </div>
              <p className="text-3xl font-black text-amber-300">{fmt(subStats.mrr)} €</p>
              <p className="text-xs text-white/30 mt-1">Revenus récurrents mensuels</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="text-3xl font-black text-white">{subStats.activeCount}</p>
              <p className="text-xs text-white/40 mt-1">Abonnés actifs</p>
              <p className="text-xs text-white/25 mt-1">Stripe actif</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="text-3xl font-black text-white">{conversionRate}%</p>
              <p className="text-xs text-white/40 mt-1">Taux de conversion</p>
              <p className="text-xs text-white/25 mt-1">inscrits → payants</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/8">
              <p className="text-3xl font-black text-white">
                {fmt(revenueData.monthly.reduce((s, m) => s + m.amount, 0))} €
              </p>
              <p className="text-xs text-white/40 mt-1">Revenus 6 derniers mois</p>
            </div>
          </div>

          {/* Revenue chart */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              Revenus mensuels (6 mois)
            </h2>
            <RevenueChart data={revenueData.monthly} />
          </div>

          {/* Plan breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['starter', 'pro', 'agency'] as const).map(planKey => {
              const cfg = PLAN_CONFIG[planKey]
              const data = subStats.byPlan[planKey]
              const colorMap = {
                starter: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
                pro: 'border-violet-500/20 bg-violet-500/5 text-violet-300',
                agency: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300',
              }
              return (
                <div key={planKey} className={`glass rounded-2xl p-5 border ${colorMap[planKey]}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">{cfg.label}</span>
                    <span className="text-xs opacity-50">{cfg.price} €/mois</span>
                  </div>
                  <p className="text-4xl font-black text-white">{data.count}</p>
                  <p className="text-sm mt-1 opacity-60">abonnés</p>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/30">MRR</span>
                    <span className="text-sm font-bold text-white">{fmt(data.mrr)} €</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Paid subscribers table */}
          {subStats.subscribers.length > 0 && (
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 pb-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Abonnés payants ({subStats.activeCount})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-t border-white/5">
                      <th className="text-left text-[11px] font-medium text-white/30 px-6 py-3">Email</th>
                      <th className="text-left text-[11px] font-medium text-white/30 px-4 py-3">Plan</th>
                      <th className="text-right text-[11px] font-medium text-white/30 px-4 py-3">Montant</th>
                      <th className="text-right text-[11px] font-medium text-white/30 px-6 py-3">Abonné depuis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {subStats.subscribers.map(sub => (
                      <tr key={sub.subscriptionId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/20 flex items-center justify-center text-xs text-amber-300 font-semibold shrink-0">
                              {sub.email?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span className="text-sm text-white/70 truncate max-w-[220px]">{sub.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <PlanBadge plan={sub.plan} />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-white">{fmt(sub.amount)} €</span>
                          <span className="text-xs text-white/30">/mois</span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-xs text-white/30">{formatUnixDate(sub.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {subStats.subscribers.length === 0 && (
            <div className="glass rounded-2xl p-8 border border-white/5 text-center">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-white/40 text-sm">Aucun abonné payant pour l&apos;instant</p>
            </div>
          )}

          {/* Email campaign */}
          <EmailCampaignSection />

          {/* Recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent users */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                Dernières inscriptions
              </h2>
              {recentUsers.length === 0 ? (
                <p className="text-white/25 text-sm">Aucun utilisateur</p>
              ) : (
                <div className="space-y-3.5">
                  {recentUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-xs text-white/60 font-semibold shrink-0">
                        {u.email?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">{u.email}</p>
                        <p className="text-xs text-white/25">{formatDate(u.created_at)}</p>
                      </div>
                      <PlanBadge plan={u.plan} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent sites */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                Derniers sites générés
              </h2>
              {recentSites.length === 0 ? (
                <p className="text-white/25 text-sm">Aucun site généré</p>
              ) : (
                <div className="space-y-3.5">
                  {recentSites.map(s => (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">{s.name || 'Sans titre'}</p>
                        <p className="text-xs text-white/25 truncate">{s.userEmail ?? `${s.user_id.slice(0, 8)}…`}</p>
                      </div>
                      <p className="text-xs text-white/25 shrink-0 text-right">{formatDate(s.created_at)}</p>
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
