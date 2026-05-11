'use client'

import { useState, useEffect, useCallback } from 'react'

interface PromoCode {
  id: string
  code: string
  active: boolean
  timesRedeemed: number
  maxRedemptions: number | null
  expiresAt: number | null
  couponName: string
  percentOff: number | null
  amountOff: number | null
  duration: string
}

export default function PromoCodesManager() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newCode, setNewCode] = useState('')
  const [percentOff, setPercentOff] = useState('20')
  const [duration, setDuration] = useState('once')
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/promo-codes')
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const data = await res.json()
      setCodes(data.promoCodes ?? [])
    } catch {
      setError('Impossible de charger les codes promo')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCodes() }, [fetchCodes])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    setCreating(true)
    try {
      const res = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          percentOff: Number(percentOff),
          duration,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error ?? 'Erreur lors de la création')
        return
      }
      setCreateSuccess(`Code "${data.promoCode.code}" créé avec succès !`)
      setNewCode('')
      setPercentOff('20')
      setDuration('once')
      setMaxRedemptions('')
      fetchCodes()
    } catch {
      setCreateError('Erreur réseau')
    } finally {
      setCreating(false)
    }
  }

  function fmtDate(ts: number | null) {
    if (!ts) return '—'
    return new Date(ts * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function fmtDiscount(code: PromoCode) {
    if (code.percentOff) return `-${code.percentOff}%`
    if (code.amountOff) return `-${(code.amountOff / 100).toFixed(2)} €`
    return '—'
  }

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all bg-white/5 border border-white/10 text-white placeholder-white/25 focus:border-violet-500/50"

  return (
    <div className="space-y-6">

      {/* Create form */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
          <h2 className="text-sm font-bold text-white">Créer un code promo</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Code</label>
              <input
                className={inputClass}
                value={newCode}
                onChange={e => setNewCode(e.target.value.toUpperCase())}
                placeholder="EX: SUMMER30"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Réduction (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                className={inputClass}
                value={percentOff}
                onChange={e => setPercentOff(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Durée</label>
              <select
                className={inputClass}
                value={duration}
                onChange={e => setDuration(e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="once">Une fois</option>
                <option value="repeating">Répétée</option>
                <option value="forever">À vie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Max utilisations</label>
              <input
                type="number"
                min="1"
                className={inputClass}
                value={maxRedemptions}
                onChange={e => setMaxRedemptions(e.target.value)}
                placeholder="Illimité"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#5b21b6" }}
                onMouseEnter={e => { if (!creating) e.currentTarget.style.background = "#6d28d9" }}
                onMouseLeave={e => (e.currentTarget.style.background = "#5b21b6")}
              >
                {creating ? 'Création...' : 'Créer le code'}
              </button>
              {createError && <p className="text-sm text-red-400">{createError}</p>}
              {createSuccess && <p className="text-sm text-emerald-400">{createSuccess}</p>}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
            <h2 className="text-sm font-bold text-white">Codes actifs ({codes.length})</h2>
          </div>
          <button
            onClick={fetchCodes}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-white/25 text-sm">Chargement...</div>
        ) : error ? (
          <div className="px-6 py-5 text-red-400 text-sm">{error}</div>
        ) : codes.length === 0 ? (
          <div className="px-6 py-8 text-center text-white/25 text-sm">Aucun code promo</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-xs text-white/30 font-medium">Code</th>
                  <th className="px-4 py-3 text-left text-xs text-white/30 font-medium">Réduction</th>
                  <th className="px-4 py-3 text-left text-xs text-white/30 font-medium">Durée</th>
                  <th className="px-4 py-3 text-left text-xs text-white/30 font-medium">Utilisations</th>
                  <th className="px-4 py-3 text-left text-xs text-white/30 font-medium">Expiration</th>
                  <th className="px-4 py-3 text-left text-xs text-white/30 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {codes.map(code => (
                  <tr key={code.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className="font-mono font-semibold text-white/80">{code.code}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-violet-300 font-semibold">{fmtDiscount(code)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-white/50 capitalize">{code.duration}</td>
                    <td className="px-4 py-3.5 text-white/50">
                      {code.timesRedeemed}
                      {code.maxRedemptions ? ` / ${code.maxRedemptions}` : ''}
                    </td>
                    <td className="px-4 py-3.5 text-white/40 text-xs">{fmtDate(code.expiresAt)}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full border"
                        style={
                          code.active
                            ? { background: 'rgba(16,185,129,0.1)', color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.2)' }
                            : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.1)' }
                        }
                      >
                        {code.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
