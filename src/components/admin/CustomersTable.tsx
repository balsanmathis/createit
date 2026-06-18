'use client'

import { useState } from 'react'

export interface CustomerRow {
  id: string
  email: string
  plan: string
  tokensUsed: number
  tokensLimit: number
  status: string
  createdAt: string
  periodEnd: string | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  actualMonthly?: number
  discountPercent?: number
}

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', agency: 'Agency', free: 'Free' }
const PLAN_PRICES: Record<string, number> = { starter: 20, pro: 45, agency: 250 }

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  active:    { label: 'Actif',              bg: '#dcfce7', color: '#166534' },
  canceled:  { label: 'Annulé',             bg: '#fee2e2', color: '#991b1b' },
  past_due:  { label: 'Résiliation prévue', bg: '#fef3c7', color: '#92400e' },
  trialing:  { label: 'Essai',              bg: '#e0f2fe', color: '#075985' },
}

const PLAN_BADGE: Record<string, { bg: string; color: string }> = {
  starter: { bg: '#dbeafe', color: '#1e40af' },
  pro:     { bg: '#dcfce7', color: '#166534' },
  agency:  { bg: '#fef3c7', color: '#92400e' },
  free:    { bg: '#f1f5f9', color: '#475569' },
}

type FilterType = 'all' | 'active' | 'past_due' | 'canceled'

function fmt(n: number) {
  return n.toLocaleString('fr-FR')
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TokenBar({ used, limit }: { used: number; limit: number }) {
  if (!limit) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
  const remaining = Math.max(0, limit - used)
  const pct = limit > 0 ? (remaining / limit) * 100 : 0
  const color = pct > 50 ? '#22c55e' : pct > 20 ? '#f97316' : '#ef4444'
  return (
    <div>
      <span style={{ fontSize: 12, color: '#0f172a' }}>
        {fmt(Math.round(remaining / 1000))}k / {fmt(Math.round(limit / 1000))}k
      </span>
      <div style={{ marginTop: 4, height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', width: 80 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

interface EditForm {
  plan: string
  status: string
  tokensLimit: number
}

export default function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<CustomerRow | null>(null)
  const [form, setForm] = useState<EditForm>({ plan: '', status: '', tokensLimit: 0 })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const filtered = customers.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function openEdit(c: CustomerRow) {
    setEditing(c)
    setForm({ plan: c.plan, status: c.status, tokensLimit: c.tokensLimit })
    setSaveMsg('')
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      setSaveMsg('Sauvegardé ✓')
      setTimeout(() => { setEditing(null); window.location.reload() }, 800)
    } catch {
      setSaveMsg('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const filterBtns: { key: FilterType; label: string }[] = [
    { key: 'all',      label: 'Tous' },
    { key: 'active',   label: 'Actifs' },
    { key: 'past_due', label: 'En résiliation' },
    { key: 'canceled', label: 'Annulés' },
  ]

  return (
    <div>
      {/* Filters + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {filterBtns.map(b => (
            <button
              key={b.key}
              onClick={() => setFilter(b.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                borderColor: filter === b.key ? '#2563eb' : '#e2e8f0',
                background: filter === b.key ? '#eff6ff' : '#fff',
                color: filter === b.key ? '#1d4ed8' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher par email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '7px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 13,
            color: '#0f172a',
            outline: 'none',
            width: 240,
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Email', 'Plan', 'Tokens restants', 'Statut', 'Inscrit le', 'Renouvellement', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  Aucun client trouvé
                </td>
              </tr>
            ) : filtered.map(c => {
              const statusCfg = STATUS_MAP[c.status] ?? { label: c.status, bg: '#f1f5f9', color: '#475569' }
              const planCfg = PLAN_BADGE[c.plan] ?? { bg: '#f1f5f9', color: '#475569' }
              return (
                <tr
                  key={c.id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#1d4ed8', flexShrink: 0 }}>
                        {c.email[0]?.toUpperCase()}
                      </div>
                      <span style={{ color: '#0f172a', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.email}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: planCfg.bg, color: planCfg.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {PLAN_LABELS[c.plan] ?? c.plan}
                    </span>
                    {c.actualMonthly !== undefined ? (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        {c.actualMonthly.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€/mois
                        {(c.discountPercent ?? 0) > 0 && (
                          <span style={{ color: '#16a34a', marginLeft: 4 }}>(-{c.discountPercent}%)</span>
                        )}
                      </div>
                    ) : PLAN_PRICES[c.plan] ? (
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{PLAN_PRICES[c.plan]}€/mois</div>
                    ) : null}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <TokenBar used={c.tokensUsed} limit={c.tokensLimit} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: statusCfg.bg, color: statusCfg.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatDate(c.createdAt)}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    {c.status === 'past_due'
                      ? <span style={{ color: '#d97706', fontWeight: 500 }}>Se termine le {formatDate(c.periodEnd)}</span>
                      : <span style={{ color: '#64748b' }}>{formatDate(c.periodEnd)}</span>
                    }
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {c.stripeCustomerId && (
                        <a
                          href={`https://dashboard.stripe.com/customers/${c.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, color: '#475569', textDecoration: 'none', whiteSpace: 'nowrap' }}
                        >
                          👁 Stripe
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(c)}
                        style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12, color: '#475569', background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        ✏️ Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editing && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}
        >
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Modifier l&apos;utilisateur</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{editing.email}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                Plan
                <select
                  value={form.plan}
                  onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                  style={{ display: 'block', marginTop: 6, width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', background: '#fff' }}
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter — 20€/mois</option>
                  <option value="pro">Pro — 45€/mois</option>
                  <option value="agency">Agency — 250€/mois</option>
                </select>
              </label>

              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                Statut abonnement
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ display: 'block', marginTop: 6, width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', background: '#fff' }}
                >
                  <option value="active">Actif</option>
                  <option value="past_due">En résiliation</option>
                  <option value="canceled">Annulé</option>
                  <option value="trialing">Essai</option>
                </select>
              </label>

              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                Limite tokens
                <input
                  type="number"
                  value={form.tokensLimit}
                  onChange={e => setForm(f => ({ ...f, tokensLimit: Number(e.target.value) }))}
                  style={{ display: 'block', marginTop: 6, width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', boxSizing: 'border-box' }}
                />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  Actuel : {fmt(Math.round(editing.tokensLimit / 1000))}k tokens
                </span>
              </label>
            </div>

            {saveMsg && (
              <p style={{ marginTop: 12, fontSize: 13, color: saveMsg.includes('Erreur') ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                {saveMsg}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setEditing(null)}
                style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#64748b', background: '#fff', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', background: saving ? '#93c5fd' : '#2563eb', cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
