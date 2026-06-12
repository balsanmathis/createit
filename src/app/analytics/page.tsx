import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import AnalyticsChart from '@/components/admin/AnalyticsChart'
import CustomersTable from '@/components/admin/CustomersTable'
import type { CustomerRow } from '@/components/admin/CustomersTable'

const ADMIN_EMAIL = 'balsanmathis08@gmail.com'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Data fetching ────────────────────────────────────────────────────────────

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
    for (const inv of batch.data) {
      allInvoices.push({ amount: inv.amount_paid / 100, created: inv.created })
    }
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

  const threeMonthStart = Math.floor(threeMonthsAgoStart.getTime() / 1000)
  const threeMonths = allInvoices
    .filter(inv => inv.created >= threeMonthStart)
    .reduce((sum, inv) => sum + inv.amount, 0)

  const currentMonthPayments = allInvoices.filter(
    inv => inv.created >= last.start && inv.created < last.end
  ).length

  return { monthly, currentMonth, currentMonthPayments, threeMonths }
}

async function getSubscriberStats() {
  const supabase = getServiceClient()

  const [totalRes, starterRes, proRes, agencyRes] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'starter'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'agency'),
  ])

  const starter = starterRes.count ?? 0
  const pro = proRes.count ?? 0
  const agency = agencyRes.count ?? 0
  const total = totalRes.count ?? 0
  const paid = starter + pro + agency
  const mrr = starter * 20 + pro * 45 + agency * 250

  return { total, paid, starter, pro, agency, mrr }
}

async function getPayingCustomers(): Promise<CustomerRow[]> {
  const supabase = getServiceClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, email, plan, tokens_used, tokens_limit, created_at, subscriptions(status, stripe_customer_id, stripe_subscription_id, current_period_end)')
    .in('plan', ['starter', 'pro', 'agency'])
    .order('created_at', { ascending: false })

  if (!users) return []

  return users.map((u: {
    id: string
    email: string
    plan: string
    tokens_used: number
    tokens_limit: number
    created_at: string
    subscriptions: Array<{
      status: string
      stripe_customer_id: string | null
      stripe_subscription_id: string | null
      current_period_end: string | null
    }> | null
  }) => {
    const sub = Array.isArray(u.subscriptions) ? u.subscriptions[0] : null
    return {
      id: u.id,
      email: u.email,
      plan: u.plan,
      tokensUsed: u.tokens_used ?? 0,
      tokensLimit: u.tokens_limit ?? 0,
      status: sub?.status ?? 'active',
      createdAt: u.created_at,
      periodEnd: sub?.current_period_end ?? null,
      stripeCustomerId: sub?.stripe_customer_id ?? null,
      stripeSubscriptionId: sub?.stripe_subscription_id ?? null,
    }
  })
}

async function getCancellations() {
  const supabase = getServiceClient()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  try {
    const { data, error } = await supabase
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

function fmt(n: number, decimals = 0) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Sparkline: 3 mini bars for last 3 months
function Sparkline({ data }: { data: { amount: number }[] }) {
  const last3 = data.slice(-3)
  const max = Math.max(...last3.map(d => d.amount), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 28, marginTop: 8 }}>
      {last3.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            borderRadius: 3,
            background: '#2563eb',
            opacity: 0.3 + (i / last3.length) * 0.7,
            height: `${Math.max((d.amount / max) * 100, 8)}%`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email !== ADMIN_EMAIL) redirect('/dashboard')

  const [revenue, stats, customers, cancellations] = await Promise.all([
    getRevenueData(),
    getSubscriberStats(),
    getPayingCustomers(),
    getCancellations(),
  ])

  const monthLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const conversionRate = stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : '0.0'

  const card = {
    wrapper: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 24 } as React.CSSProperties,
    label: { fontSize: 13, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12 },
    value: { fontSize: 32, fontWeight: 700, color: '#0f172a', lineHeight: 1 },
    sub: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <DashboardSidebar />

      <main style={{ marginLeft: 0, padding: '64px 24px 40px' }} className="md:ml-64 md:pt-8">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Analytics</h1>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>create-it.app — {monthLabel}</p>
          </div>

          {/* ── Section 1 : Stats cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="grid-analytics">
            {/* Card 1 — Revenus ce mois */}
            <div style={card.wrapper}>
              <p style={card.label}>Revenus ce mois</p>
              <p style={card.value}>{fmt(revenue.currentMonth)} €</p>
              <p style={card.sub}>{revenue.currentMonthPayments} paiement{revenue.currentMonthPayments !== 1 ? 's' : ''} ce mois</p>
            </div>

            {/* Card 2 — Revenus 3 mois */}
            <div style={card.wrapper}>
              <p style={card.label}>3 derniers mois</p>
              <p style={card.value}>{fmt(revenue.threeMonths)} €</p>
              <Sparkline data={revenue.monthly} />
            </div>

            {/* Card 3 — Abonnés actifs */}
            <div style={card.wrapper}>
              <p style={card.label}>Abonnés actifs</p>
              <p style={card.value}>{stats.paid}</p>
              <p style={card.sub}>
                Starter: {stats.starter} · Pro: {stats.pro} · Agency: {stats.agency}
              </p>
            </div>

            {/* Card 4 — MRR */}
            <div style={{ ...card.wrapper, borderColor: '#bfdbfe', background: '#eff6ff' }}>
              <p style={{ ...card.label, color: '#1d4ed8' }}>MRR</p>
              <p style={{ ...card.value, color: '#1d4ed8' }}>{fmt(stats.mrr)} €</p>
              <p style={{ ...card.sub, color: '#93c5fd' }}>Revenu récurrent mensuel estimé</p>
            </div>
          </div>

          {/* ── Section 2 : Revenue chart ── */}
          <div style={{ ...card.wrapper, marginBottom: 24 }}>
            <p style={{ ...card.label, marginBottom: 20 }}>Revenus mensuels — 6 derniers mois</p>
            <AnalyticsChart data={revenue.monthly} />
          </div>

          {/* ── Section 3 : Customers table ── */}
          <div style={{ ...card.wrapper, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <p style={card.label}>Clients payants</p>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{customers.length} client{customers.length !== 1 ? 's' : ''}</span>
            </div>
            <CustomersTable customers={customers} />
          </div>

          {/* ── Section 4 & 5 : Cancellations + Conversion ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>

            {/* Cancellations */}
            <div style={card.wrapper}>
              <p style={{ ...card.label, marginBottom: 16 }}>Résiliations récentes (30 jours)</p>
              {cancellations.length === 0 ? (
                <p style={{ fontSize: 13, color: '#94a3b8', padding: '16px 0', textAlign: 'center' }}>
                  Aucune résiliation sur les 30 derniers jours
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {['Email', 'Plan annulé', 'Raison', 'Date'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cancellations.map((c: { id: string; email: string; plan: string; reason: string; created_at: string }) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '10px 12px', color: '#0f172a' }}>{c.email}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                              {c.plan}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.reason || '—'}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {formatDate(c.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Conversion rate */}
            <div style={card.wrapper}>
              <p style={{ ...card.label, marginBottom: 20 }}>Taux de conversion</p>
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ fontSize: 56, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {conversionRate}%
                </p>
                <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 12 }}>
                  {stats.paid} payant{stats.paid !== 1 ? 's' : ''} sur {stats.total} inscrits
                </p>
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  {conversionRate}% des inscrits sont passés en plan payant
                </p>
              </div>
              <div style={{ marginTop: 20, height: 8, background: '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${conversionRate}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 8, transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>0%</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>100%</span>
              </div>

              <div style={{ marginTop: 20, borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Starter', count: stats.starter, price: 20, color: '#1d4ed8', bg: '#dbeafe' },
                  { label: 'Pro', count: stats.pro, price: 45, color: '#166534', bg: '#dcfce7' },
                  { label: 'Agency', count: stats.agency, price: 250, color: '#92400e', bg: '#fef3c7' },
                ].map(p => (
                  <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ background: p.bg, color: p.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12 }}>{p.label}</span>
                      <span style={{ fontSize: 13, color: '#0f172a' }}>{p.count} abonné{p.count !== 1 ? 's' : ''}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{fmt(p.count * p.price)} €/mois</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 900px) {
          .grid-analytics { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .grid-analytics { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
