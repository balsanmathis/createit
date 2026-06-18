import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import PromoCodesManager from '@/components/admin/PromoCodesManager'
import LandingContentEditor from '@/components/admin/LandingContentEditor'
import AnalyticsChart from '@/components/admin/AnalyticsChart'
import CustomersTable from '@/components/admin/CustomersTable'
import type { CustomerRow } from '@/components/admin/CustomersTable'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const VERCEL_ANALYTICS_URL = 'https://vercel.com/balsanmathis-projects/createit/analytics'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Existing data functions ──────────────────────────────────────────────────

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

const PAGE_SIZE = 30

async function getAllUsers(page: number) {
  const from = (page - 1) * PAGE_SIZE
  const db = serviceClient()
  const { data, count } = await db
    .from('users')
    .select('id, email, plan, created_at, tokens_used, tokens_limit', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
  return {
    users: (data ?? []) as { id: string; email: string; plan: string; created_at: string; tokens_used: number; tokens_limit: number }[],
    total: count ?? 0,
  }
}

async function getAllSites(page: number) {
  const from = (page - 1) * PAGE_SIZE
  const db = serviceClient()
  const { data: sites, count } = await db
    .from('sites')
    .select('id, name, user_id, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  if (!sites?.length) return { sites: [], total: count ?? 0 }

  const userIds = [...new Set(sites.map((s: { user_id: string }) => s.user_id))]
  const { data: users } = await db.from('users').select('id, email').in('id', userIds)
  const emailMap = new Map((users ?? []).map((u: { id: string; email: string }) => [u.id, u.email]))

  return {
    sites: sites.map((s: { id: string; name: string; user_id: string; created_at: string }) => ({
      ...s,
      userEmail: emailMap.get(s.user_id) as string | undefined,
    })),
    total: count ?? 0,
  }
}

// ─── Revenue tab data functions ───────────────────────────────────────────────

async function getRevenueData() {
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

  const threeMonthsAgoStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1))

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
    amount: allInvoices.filter(i => i.created >= m.start && i.created < m.end).reduce((s, i) => s + i.amount, 0),
  }))

  const last = months[months.length - 1]
  const currentMonth = monthly[monthly.length - 1].amount
  const currentMonthPayments = allInvoices.filter(i => i.created >= last.start && i.created < last.end).length
  const threeMonths = allInvoices.filter(i => i.created >= Math.floor(threeMonthsAgoStart.getTime() / 1000)).reduce((s, i) => s + i.amount, 0)

  return { monthly, currentMonth, currentMonthPayments, threeMonths }
}

async function getSubscriberStats() {
  const db = serviceClient()
  const stripe = getStripe()

  const priceIdToPlan: Record<string, string> = {}
  if (process.env.STRIPE_STARTER_PRICE_ID) priceIdToPlan[process.env.STRIPE_STARTER_PRICE_ID] = 'starter'
  if (process.env.STRIPE_PRO_PRICE_ID)     priceIdToPlan[process.env.STRIPE_PRO_PRICE_ID]     = 'pro'
  if (process.env.STRIPE_ULTRA_PRICE_ID)   priceIdToPlan[process.env.STRIPE_ULTRA_PRICE_ID]   = 'ultra'
  if (process.env.STRIPE_AGENCY_PRICE_ID)  priceIdToPlan[process.env.STRIPE_AGENCY_PRICE_ID]  = 'agency'

  const [totalRes, starterRes, proRes, agencyRes, ultraRes] = await Promise.all([
    db.from('users').select('*', { count: 'exact', head: true }),
    db.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'starter'),
    db.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    db.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'agency'),
    db.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'ultra'),
  ])

  // Pre-fetch all coupons once to resolve discount percentages
  const couponsRes = await stripe.coupons.list({ limit: 100 })
  const couponPercentMap = new Map(couponsRes.data.map(c => [c.id, c.percent_off ?? 0]))

  // Compute real MRR from Stripe — accounts for applied promo codes/discounts
  let mrr = 0
  const mrrByPlan: Record<string, number> = { starter: 0, pro: 0, ultra: 0, agency: 0 }
  let hasMore = true
  let startingAfter: string | undefined
  while (hasMore) {
    const batch = await stripe.subscriptions.list({
      status: 'active', limit: 100,
      expand: ['data.discounts'],
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    for (const sub of batch.data) {
      const priceItem = sub.items.data[0]
      if (!priceItem) continue
      const baseAmount = (priceItem.price.unit_amount ?? 0) / 100
      const discounts = sub.discounts as unknown as Array<{ source?: { type?: string; coupon?: string } }>
      const couponId = discounts?.[0]?.source?.coupon ?? null
      const percentOff = couponId ? (couponPercentMap.get(couponId) ?? 0) : 0
      const actual = Math.round(baseAmount * (1 - percentOff / 100) * 100) / 100
      mrr += actual
      const plan = priceIdToPlan[priceItem.price.id]
      if (plan && plan in mrrByPlan) mrrByPlan[plan] += actual
    }
    hasMore = batch.has_more
    if (hasMore && batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id
  }

  const starter = starterRes.count ?? 0
  const pro     = proRes.count     ?? 0
  const agency  = agencyRes.count  ?? 0
  const ultra   = ultraRes.count   ?? 0
  return {
    total: totalRes.count ?? 0,
    paid: starter + pro + agency + ultra,
    starter, pro, agency, ultra,
    mrr,
    mrrByPlan,
  }
}

async function getPayingCustomers(): Promise<CustomerRow[]> {
  const db = serviceClient()
  const stripe = getStripe()

  const { data: users } = await db
    .from('users')
    .select('id, email, plan, tokens_used, tokens_limit, created_at, subscriptions(status, stripe_customer_id, stripe_subscription_id, current_period_end)')
    .in('plan', ['starter', 'pro', 'ultra', 'agency'])
    .order('created_at', { ascending: false })

  if (!users) return []

  // Build a map of sub ID → actual monthly amount from Stripe (with discounts)
  const subAmountMap = new Map<string, { actualMonthly: number; discountPercent: number }>()
  const subIds = users
    .flatMap((u: { subscriptions: Array<{ stripe_subscription_id: string | null }> | null }) =>
      Array.isArray(u.subscriptions) ? u.subscriptions.map(s => s.stripe_subscription_id) : []
    )
    .filter(Boolean) as string[]

  if (subIds.length > 0) {
    const couponsRes = await stripe.coupons.list({ limit: 100 })
    const couponPercentMap = new Map(couponsRes.data.map(c => [c.id, c.percent_off ?? 0]))

    let hasMore = true
    let startingAfter: string | undefined
    while (hasMore) {
      const batch = await stripe.subscriptions.list({
        status: 'active', limit: 100,
        expand: ['data.discounts'],
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      })
      for (const sub of batch.data) {
        if (!subIds.includes(sub.id)) continue
        const baseAmount = (sub.items.data[0]?.price.unit_amount ?? 0) / 100
        const discounts = sub.discounts as unknown as Array<{ source?: { type?: string; coupon?: string } }>
        const couponId = discounts?.[0]?.source?.coupon ?? null
        const percentOff = couponId ? (couponPercentMap.get(couponId) ?? 0) : 0
        subAmountMap.set(sub.id, {
          actualMonthly: Math.round(baseAmount * (1 - percentOff / 100) * 100) / 100,
          discountPercent: percentOff,
        })
      }
      hasMore = batch.has_more
      if (hasMore && batch.data.length > 0) startingAfter = batch.data[batch.data.length - 1].id
    }
  }

  return users.map((u: {
    id: string; email: string; plan: string
    tokens_used: number; tokens_limit: number; created_at: string
    subscriptions: Array<{ status: string; stripe_customer_id: string | null; stripe_subscription_id: string | null; current_period_end: string | null }> | null
  }) => {
    const sub = Array.isArray(u.subscriptions) ? u.subscriptions[0] : null
    const stripeInfo = sub?.stripe_subscription_id ? subAmountMap.get(sub.stripe_subscription_id) : undefined
    return {
      id: u.id, email: u.email, plan: u.plan,
      tokensUsed: u.tokens_used ?? 0, tokensLimit: u.tokens_limit ?? 0,
      status: sub?.status ?? 'active', createdAt: u.created_at,
      periodEnd: sub?.current_period_end ?? null,
      stripeCustomerId: sub?.stripe_customer_id ?? null,
      stripeSubscriptionId: sub?.stripe_subscription_id ?? null,
      actualMonthly: stripeInfo?.actualMonthly,
      discountPercent: stripeInfo?.discountPercent,
    }
  })
}

async function getCancellations() {
  const db = serviceClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  try {
    const { data, error } = await db
      .from('cancellations')
      .select('id, email, plan, reason, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtNum(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    starter: { bg: 'var(--accent-light)', color: 'var(--accent)' },
    pro:     { bg: 'rgba(124,58,237,0.15)', color: 'var(--accent)' },
    agency:  { bg: 'var(--success-light)', color: 'var(--success)' },
  }
  const s = styles[plan] ?? { bg: 'var(--surface)', color: 'var(--fg-muted)' }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0" style={{ background: s.bg, color: s.color }}>
      {plan || 'gratuit'}
    </span>
  )
}

function Sparkline({ data }: { data: { amount: number }[] }) {
  const last3 = data.slice(-3)
  const max = Math.max(...last3.map(d => d.amount), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 24, marginTop: 8 }}>
      {last3.map((d, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 3, background: '#dbeafe', height: `${Math.max((d.amount / max) * 100, 8)}%`, opacity: 0.4 + (i / last3.length) * 0.6 }} />
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ tab?: string; page?: string }>
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/dashboard')

  const { tab, page: pageParam } = await searchParams
  const activeTab = tab === 'promo' ? 'promo'
    : tab === 'landing' ? 'landing'
    : tab === 'sites' ? 'sites'
    : tab === 'users' ? 'users'
    : tab === 'revenus' ? 'revenus'
    : 'overview'
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const isRevenu = activeTab === 'revenus'

  const [stats, recentUsers, recentSites, allUsersData, allSitesData, revenueData, subStats, customers, cancellations] = await Promise.all([
    getStats(),
    activeTab === 'overview' ? getRecentUsers() : Promise.resolve([]),
    activeTab === 'overview' ? getRecentSites() : Promise.resolve([]),
    activeTab === 'users' ? getAllUsers(currentPage) : Promise.resolve({ users: [], total: 0 }),
    activeTab === 'sites' ? getAllSites(currentPage) : Promise.resolve({ sites: [], total: 0 }),
    isRevenu ? getRevenueData() : Promise.resolve({ monthly: [], currentMonth: 0, currentMonthPayments: 0, threeMonths: 0 }),
    isRevenu ? getSubscriberStats() : Promise.resolve({ total: 0, paid: 0, starter: 0, pro: 0, agency: 0, ultra: 0, mrr: 0, mrrByPlan: { starter: 0, pro: 0, ultra: 0, agency: 0 } }),
    isRevenu ? getPayingCustomers() : Promise.resolve([]),
    isRevenu ? getCancellations() : Promise.resolve([]),
  ])

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const conversionRate = subStats.total > 0 ? ((subStats.paid / subStats.total) * 100).toFixed(1) : '0.0'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardSidebar />

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--fg)' }}>Analytics</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--fg-muted)' }}>create-it.app — {monthLabel}</p>
            </div>
            <a
              href={VERCEL_ANALYTICS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Voir le trafic complet
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--fg-subtle)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl flex-wrap" style={{ background: 'var(--surface)', border: '1px solid var(--border)', width: 'fit-content' }}>
            {[
              { key: 'overview', label: 'Vue d\'ensemble', href: '/analytics' },
              { key: 'revenus',  label: '💰 Revenus',      href: '/analytics?tab=revenus' },
              { key: 'sites',    label: `Sites (${stats.totalSites})`,      href: '/analytics?tab=sites' },
              { key: 'users',    label: `Utilisateurs (${stats.totalUsers})`, href: '/analytics?tab=users' },
              { key: 'promo',    label: 'Codes promo',    href: '/analytics?tab=promo' },
              { key: 'landing',  label: 'Landing Page',   href: '/analytics?tab=landing' },
            ].map((t) => (
              <Link
                key={t.key}
                href={t.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={activeTab === t.key
                  ? { background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' }
                  : { color: 'var(--fg-muted)', border: '1px solid transparent' }}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {/* ── Tab: Overview ── */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { value: stats.totalUsers.toLocaleString('fr-FR'),     label: 'Utilisateurs inscrits',      sub: `+${stats.usersThisMonth} ce mois` },
                  { value: stats.sitesToday.toLocaleString('fr-FR'),     label: "Sites générés aujourd'hui",  sub: null },
                  { value: stats.sitesThisMonth.toLocaleString('fr-FR'), label: 'Sites générés ce mois',      sub: `${stats.totalSites} au total` },
                ].map((card, i) => (
                  <div key={i} className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{card.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>{card.label}</p>
                    {card.sub && <p className="text-xs mt-0.5" style={{ color: 'var(--fg-subtle)' }}>{card.sub}</p>}
                  </div>
                ))}
                <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--fg-muted)' }}>Revenus & abonnés</p>
                  <Link href="/analytics?tab=revenus" className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    Voir l&apos;onglet Revenus →
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }}></span>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Dernières inscriptions</h2>
                  </div>
                  {recentUsers.length === 0 ? (
                    <p className="px-5 py-5 text-sm" style={{ color: 'var(--fg-muted)' }}>Aucun utilisateur</p>
                  ) : (
                    <div>
                      {recentUsers.map((u, i) => (
                        <div key={u.id} className="flex items-center gap-3 px-5 py-3.5" style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            {u.email?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: 'var(--fg)' }}>{u.email}</p>
                            <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>{fmt(u.created_at)}</p>
                          </div>
                          <PlanBadge plan={u.plan} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }}></span>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Derniers sites générés</h2>
                  </div>
                  {recentSites.length === 0 ? (
                    <p className="px-5 py-5 text-sm" style={{ color: 'var(--fg-muted)' }}>Aucun site généré</p>
                  ) : (
                    <div>
                      {recentSites.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3 px-5 py-3.5" style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: 'var(--fg)' }}>{s.name || 'Sans titre'}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--fg-subtle)' }}>{s.userEmail ?? `${s.user_id.slice(0, 8)}…`}</p>
                          </div>
                          <p className="text-xs shrink-0" style={{ color: 'var(--fg-subtle)' }}>{fmt(s.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── Tab: Revenus ── */}
          {activeTab === 'revenus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* 4 stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }} className="grid-rev">
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                  <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12 }}>Revenus ce mois</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{fmtNum(revenueData.currentMonth)} €</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>{revenueData.currentMonthPayments} paiement{revenueData.currentMonthPayments !== 1 ? 's' : ''} ce mois</p>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                  <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12 }}>3 derniers mois</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{fmtNum(revenueData.threeMonths)} €</p>
                  <Sparkline data={revenueData.monthly} />
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                  <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12 }}>Abonnés actifs</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{subStats.paid}</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>Starter: {subStats.starter} · Pro: {subStats.pro} · Agency: {subStats.agency}</p>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 24 }}>
                  <p style={{ fontSize: 13, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12 }}>MRR</p>
                  <p style={{ fontSize: 32, fontWeight: 700, color: '#1d4ed8', lineHeight: 1 }}>{fmtNum(subStats.mrr)} €</p>
                  <p style={{ fontSize: 13, color: '#93c5fd', marginTop: 8 }}>Revenu récurrent mensuel estimé</p>
                </div>
              </div>

              {/* Revenue chart */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 20 }}>Revenus mensuels — 6 derniers mois</p>
                <AnalyticsChart data={revenueData.monthly} />
              </div>

              {/* Paying customers table */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Clients payants</p>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{customers.length} client{customers.length !== 1 ? 's' : ''}</span>
                </div>
                <CustomersTable customers={customers} />
              </div>

              {/* Cancellations + Conversion */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }} className="grid-cancel">

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                  <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 16 }}>Résiliations récentes (30 jours)</p>
                  {cancellations.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>Aucune résiliation sur les 30 derniers jours ✓</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            {['Email', 'Plan annulé', 'Raison', 'Date'].map(h => (
                              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cancellations.map((c: { id: string; email: string; plan: string; reason: string; created_at: string }) => (
                            <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                              <td style={{ padding: '10px 12px', color: '#0f172a' }}>{c.email}</td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{c.plan}</span>
                              </td>
                              <td style={{ padding: '10px 12px', color: '#64748b', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.reason || '—'}</td>
                              <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDate(c.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 }}>
                  <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 20 }}>Taux de conversion</p>
                  <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
                    <p style={{ fontSize: 52, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{conversionRate}%</p>
                    <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 10 }}>{subStats.paid} payant{subStats.paid !== 1 ? 's' : ''} / {subStats.total} inscrits</p>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${conversionRate}%`, background: 'linear-gradient(90deg,#2563eb,#7c3aed)', borderRadius: 8 }} />
                  </div>
                  <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Starter', count: subStats.starter, plan: 'starter', bg: '#dbeafe', color: '#1e40af' },
                      { label: 'Pro',     count: subStats.pro,     plan: 'pro',     bg: '#dcfce7', color: '#166534' },
                      { label: 'Agency',  count: subStats.agency,  plan: 'agency',  bg: '#fef3c7', color: '#92400e' },
                    ].map(p => (
                      <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: p.bg, color: p.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12 }}>{p.label}</span>
                          <span style={{ fontSize: 13, color: '#0f172a' }}>{p.count} abonné{p.count !== 1 ? 's' : ''}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{fmtNum((subStats.mrrByPlan as Record<string, number>)?.[p.plan] ?? 0)} €/mois</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── Tab: Sites ── */}
          {activeTab === 'sites' && (() => {
            const { sites, total } = allSitesData
            const totalPages = Math.ceil(total / PAGE_SIZE)
            return (
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }}></span>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Tous les sites générés</h2>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{total.toLocaleString('fr-FR')} sites</span>
                </div>
                {sites.length === 0 ? (
                  <p className="px-5 py-5 text-sm" style={{ color: 'var(--fg-muted)' }}>Aucun site généré</p>
                ) : (
                  <>
                    <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
                      {sites.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3 px-5 py-3.5" style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: 'var(--fg)' }}>{s.name || 'Sans titre'}</p>
                            <p className="text-xs truncate" style={{ color: 'var(--fg-subtle)' }}>{s.userEmail ?? `${s.user_id.slice(0, 8)}…`}</p>
                          </div>
                          <p className="text-xs shrink-0" style={{ color: 'var(--fg-subtle)' }}>{fmt(s.created_at)}</p>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                        <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>Page {currentPage} / {totalPages}</span>
                        <div className="flex gap-2">
                          {currentPage > 1 && (
                            <Link href={`/analytics?tab=sites&page=${currentPage - 1}`} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>← Précédent</Link>
                          )}
                          {currentPage < totalPages && (
                            <Link href={`/analytics?tab=sites&page=${currentPage + 1}`} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--accent)' }}>Suivant →</Link>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })()}

          {/* ── Tab: Users ── */}
          {activeTab === 'users' && (() => {
            const { users, total } = allUsersData
            const totalPages = Math.ceil(total / PAGE_SIZE)
            return (
              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--accent)' }}></span>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>Tous les utilisateurs</h2>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{total.toLocaleString('fr-FR')} utilisateurs</span>
                </div>
                {users.length === 0 ? (
                  <p className="px-5 py-5 text-sm" style={{ color: 'var(--fg-muted)' }}>Aucun utilisateur</p>
                ) : (
                  <>
                    <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
                      {users.map((u, i) => (
                        <div key={u.id} className="flex items-center gap-3 px-5 py-3.5" style={i > 0 ? { borderTop: '1px solid var(--border)' } : {}}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' }}>
                            {u.email?.[0]?.toUpperCase() ?? '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate" style={{ color: 'var(--fg)' }}>{u.email}</p>
                            <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>{fmt(u.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{u.tokens_used ?? 0}/{u.tokens_limit ?? '∞'}</span>
                            <PlanBadge plan={u.plan} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="px-5 py-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                        <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>Page {currentPage} / {totalPages}</span>
                        <div className="flex gap-2">
                          {currentPage > 1 && (
                            <Link href={`/analytics?tab=users&page=${currentPage - 1}`} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>← Précédent</Link>
                          )}
                          {currentPage < totalPages && (
                            <Link href={`/analytics?tab=users&page=${currentPage + 1}`} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--accent)' }}>Suivant →</Link>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })()}

          {activeTab === 'promo'   && <PromoCodesManager />}
          {activeTab === 'landing' && <LandingContentEditor />}

        </div>
      </main>

      <style>{`
        @media (max-width: 900px) { .grid-rev { grid-template-columns: repeat(2,1fr) !important; } .grid-cancel { grid-template-columns: 1fr !important; } }
        @media (max-width: 500px) { .grid-rev { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
