'use client'

import { useState } from 'react'

export interface AdminUser {
  id: string
  email: string
  plan: string
  tokensUsed: number
  tokensLimit: number
  createdAt: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscriptionStatus: string | null
  discountPercent: number
  discountCode: string | null
  hasRefund: boolean
  refundDate: string | null
  grossPaid: number
  netPaid: number
}

const PLAN_TOKEN_LIMITS: Record<string, number> = {
  free: 0,
  starter: 800_000,
  pro: 2_400_000,
  agency: 16_000_000,
}

const PLAN_COLORS: Record<string, string> = {
  free:    'bg-white/5 text-white/40 border-white/10',
  starter: 'bg-blue-500/20 text-blue-300 border-blue-500/20',
  pro:     'bg-violet-500/20 text-violet-300 border-violet-500/20',
  agency:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-500/20 text-green-300 border-green-500/20',
  canceling: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
  canceled:  'bg-red-500/20 text-red-300 border-red-500/20',
  refunded:  'bg-orange-500/20 text-orange-300 border-orange-500/20',
  past_due:  'bg-red-500/20 text-red-300 border-red-500/20',
  free:      'bg-white/5 text-white/40 border-white/10',
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}k`
  return String(n)
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${color}`}>
      {label}
    </span>
  )
}

function TokenBar({ used, limit }: { used: number; limit: number }) {
  if (limit === 0) return <span className="text-xs text-white/20">—</span>
  const pct = Math.min(100, (used / limit) * 100)
  const color = pct > 85 ? '#ef4444' : pct > 60 ? '#f97316' : '#6366f1'
  return (
    <div className="w-28">
      <div className="flex justify-between text-[10px] text-white/30 mb-1">
        <span>{fmtK(used)}</span>
        <span>{fmtK(limit)}</span>
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function UserDrawer({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const [plan, setPlan] = useState(user.plan)
  const [tokensLimit, setTokensLimit] = useState(user.tokensLimit)
  const [tokensAdd, setTokensAdd] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  function handlePlanChange(newPlan: string) {
    setPlan(newPlan)
    setTokensLimit(PLAN_TOKEN_LIMITS[newPlan] ?? user.tokensLimit)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, tokensLimit: tokensLimit + tokensAdd }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Erreur inconnue')
      }
      setMsg('Sauvegardé ✓')
      setTimeout(() => { onSaved(); onClose() }, 900)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  async function resetTokens() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokensUsed: 0 }),
      })
      if (!res.ok) throw new Error('Erreur reset')
      setMsg('Tokens remis à 0 ✓')
      setTimeout(() => { onSaved(); onClose() }, 900)
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  const stripeUrl = user.stripeCustomerId
    ? `https://dashboard.stripe.com/customers/${user.stripeCustomerId}`
    : null
  const stripeSubUrl = user.stripeSubscriptionId
    ? `https://dashboard.stripe.com/subscriptions/${user.stripeSubscriptionId}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/60 backdrop-blur-sm" />
      <div
        className="w-full max-w-md bg-[#0d0d1a] border-l border-white/10 h-full overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white/70">
              {user.email[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate max-w-[220px]">{user.email}</p>
              <p className="text-xs text-white/30 mt-0.5">
                Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none mt-1">
            ✕
          </button>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 px-6 pt-5">
          <Badge label={user.plan || 'free'} color={PLAN_COLORS[user.plan] ?? PLAN_COLORS.free} />
          {user.subscriptionStatus && (
            <Badge label={user.subscriptionStatus} color={STATUS_COLORS[user.subscriptionStatus] ?? STATUS_COLORS.free} />
          )}
          {user.hasRefund && <Badge label="remboursé" color="bg-orange-500/20 text-orange-300 border-orange-500/20" />}
          {user.discountCode && (
            <Badge label={`promo ${user.discountPercent}% (${user.discountCode})`} color="bg-amber-500/20 text-amber-300 border-amber-500/20" />
          )}
        </div>

        {/* Revenue info */}
        <div className="grid grid-cols-2 gap-3 px-6 pt-4">
          <div className="rounded-xl bg-white/3 border border-white/6 p-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Brut payé</p>
            <p className="text-lg font-bold text-white">{fmt(user.grossPaid)} €</p>
          </div>
          <div className="rounded-xl bg-white/3 border border-white/6 p-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Net (après remb.)</p>
            <p className="text-lg font-bold text-white">{fmt(user.netPaid)} €</p>
          </div>
        </div>

        {/* Token usage */}
        <div className="px-6 pt-4">
          <div className="rounded-xl bg-white/3 border border-white/6 p-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Tokens</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">{fmtK(user.tokensUsed)} utilisés / {fmtK(user.tokensLimit)}</span>
              <button
                onClick={resetTokens}
                disabled={saving}
                className="text-[11px] text-white/40 hover:text-white/70 underline transition-colors"
              >
                Remettre à 0
              </button>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${user.tokensLimit > 0 ? Math.min(100, (user.tokensUsed / user.tokensLimit) * 100) : 0}%`,
                  background: '#6366f1',
                }}
              />
            </div>
          </div>
        </div>

        {/* Edit section */}
        <div className="px-6 pt-4 space-y-4 flex-1">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Modifier le compte</p>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Plan</label>
            <select
              value={plan}
              onChange={e => handlePlanChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500/50"
            >
              <option value="free">Gratuit (0 tokens)</option>
              <option value="starter">Starter (800k tokens)</option>
              <option value="pro">Pro (2.4M tokens)</option>
              <option value="agency">Agency (16M tokens)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">
              Limite tokens totale — actuelle: {fmtK(tokensLimit)}
            </label>
            <input
              type="number"
              value={tokensLimit}
              onChange={e => setTokensLimit(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 block mb-1.5">Créditer des tokens supplémentaires</label>
            <input
              type="number"
              min={0}
              value={tokensAdd}
              onChange={e => setTokensAdd(Number(e.target.value))}
              placeholder="ex: 100000"
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500/50"
            />
            {tokensAdd > 0 && (
              <p className="text-xs text-violet-300 mt-1">
                Nouvelle limite: {fmtK(tokensLimit + tokensAdd)} tokens
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {msg && <p className="text-sm text-green-400">{msg}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
        </div>

        {/* Stripe links */}
        {(stripeUrl || stripeSubUrl) && (
          <div className="px-6 py-5 border-t border-white/8 mt-4 space-y-2">
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Stripe</p>
            {stripeUrl && (
              <a href={stripeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir le client Stripe
              </a>
            )}
            {stripeSubUrl && (
              <a href={stripeSubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir l&apos;abonnement Stripe
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminUsersPanel({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'paying' | 'refunded' | 'free'>('all')
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const filtered = users.filter(u => {
    const matchSearch = !search || u.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ? true :
      filter === 'paying' ? (u.plan !== 'free' && !u.hasRefund) :
      filter === 'refunded' ? u.hasRefund :
      u.plan === 'free'
    return matchSearch && matchFilter
  })

  const paying  = users.filter(u => u.plan !== 'free' && !u.hasRefund).length
  const refunded = users.filter(u => u.hasRefund).length

  return (
    <div key={refreshKey}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Rechercher par email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-violet-500/50 placeholder:text-white/20"
        />
        <div className="flex gap-2">
          {(['all', 'paying', 'refunded', 'free'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg border transition-colors ${
                filter === f
                  ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                  : 'bg-white/3 border-white/8 text-white/40 hover:text-white/60'
              }`}
            >
              {f === 'all' ? `Tous (${users.length})` :
               f === 'paying' ? `Payants (${paying})` :
               f === 'refunded' ? `Remboursés (${refunded})` :
               `Gratuit (${users.length - paying - refunded})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[11px] font-medium text-white/30 px-6 py-3">Email</th>
                <th className="text-left text-[11px] font-medium text-white/30 px-4 py-3">Plan</th>
                <th className="text-left text-[11px] font-medium text-white/30 px-4 py-3">Statut</th>
                <th className="text-left text-[11px] font-medium text-white/30 px-4 py-3">Tokens</th>
                <th className="text-right text-[11px] font-medium text-white/30 px-4 py-3">Payé</th>
                <th className="text-right text-[11px] font-medium text-white/30 px-6 py-3">Inscrit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map(u => (
                <tr
                  key={u.id}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setSelected(u)}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center text-xs text-white/50 font-semibold shrink-0">
                        {u.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-white/70 truncate max-w-[180px]">{u.email}</span>
                      {u.discountCode && (
                        <span className="text-[10px] text-amber-400/70">promo</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge label={u.plan || 'free'} color={PLAN_COLORS[u.plan] ?? PLAN_COLORS.free} />
                  </td>
                  <td className="px-4 py-3.5">
                    {u.subscriptionStatus ? (
                      <Badge label={u.subscriptionStatus} color={STATUS_COLORS[u.subscriptionStatus] ?? STATUS_COLORS.free} />
                    ) : <span className="text-xs text-white/20">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <TokenBar used={u.tokensUsed} limit={u.tokensLimit} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {u.grossPaid > 0 ? (
                      <span className={`text-sm font-medium ${u.hasRefund ? 'text-orange-300' : 'text-white/70'}`}>
                        {fmt(u.grossPaid)} €{u.hasRefund ? ' ↩' : ''}
                      </span>
                    ) : <span className="text-xs text-white/20">—</span>}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-xs text-white/30">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-white/20 text-sm">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {selected && (
        <UserDrawer
          user={selected}
          onClose={() => setSelected(null)}
          onSaved={() => { setRefreshKey(k => k + 1); setSelected(null) }}
        />
      )}
    </div>
  )
}
