'use client'

import { useState, useEffect } from 'react'

interface Campaign {
  id: string
  name: string
  recipients_count: number
  sent_at: string
}

export default function EmailCampaignSection() {
  const [promoCode, setPromoCode] = useState('PROMO50')
  const [expiryDate, setExpiryDate] = useState('')
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ sent: number; testMode: boolean } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Default expiry: 7 days from now
    const d = new Date()
    d.setDate(d.getDate() + 7)
    setExpiryDate(d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))

    fetch('/api/admin/send-promo-email')
      .then(r => r.json())
      .then(d => {
        setTotalUsers(d.totalUsers ?? null)
        setCampaigns(d.campaigns ?? [])
      })
      .catch(() => {})
  }, [])

  async function send(testMode: boolean) {
    if (!testMode) {
      const ok = confirm(`Êtes-vous sûr d'envoyer à ${totalUsers ?? '?'} personnes ?`)
      if (!ok) return
    }

    setState('sending')
    setErrorMsg('')
    setResult(null)

    try {
      const res = await fetch('/api/admin/send-promo-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promoCode, expiryDate, testMode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      setResult({ sent: data.sent, testMode: data.testMode })
      setState('done')
      if (!testMode) {
        // Refresh campaign history
        fetch('/api/admin/send-promo-email')
          .then(r => r.json())
          .then(d => setCampaigns(d.campaigns ?? []))
          .catch(() => {})
      }
      setTimeout(() => setState('idle'), 8000)
    } catch (e) {
      setErrorMsg(String(e))
      setState('error')
      setTimeout(() => setState('idle'), 6000)
    }
  }

  const isSending = state === 'sending'

  return (
    <div className="glass rounded-2xl border border-white/5 p-6 space-y-5">
      <h2 className="text-sm font-bold text-white flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
        Campagne email
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/40 block mb-1.5">Code promo</label>
          <input
            type="text"
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500/50 font-mono tracking-wider"
            placeholder="PROMO50"
          />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1.5">Valable jusqu'au</label>
          <input
            type="text"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500/50"
            placeholder="30 juin 2026"
          />
        </div>
      </div>

      {totalUsers !== null && (
        <p className="text-xs text-white/30">
          {totalUsers} inscrits dans la base · l'envoi réel ciblera tous leurs emails
        </p>
      )}

      {/* Result toast */}
      {state === 'done' && result && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-300">
          ✓ {result.sent} email{result.sent > 1 ? 's' : ''} envoyé{result.sent > 1 ? 's' : ''}
          {result.testMode ? ' (mode test — envoyé à balsanmathis08@gmail.com)' : ''}
        </div>
      )}
      {state === 'error' && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          ✗ {errorMsg}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => send(true)}
          disabled={isSending || !promoCode || !expiryDate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/8 disabled:opacity-40 transition-all"
        >
          {isSending ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : '👁'}
          Test (envoi à moi-même)
        </button>

        <button
          onClick={() => send(false)}
          disabled={isSending || !promoCode || !expiryDate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border bg-violet-600 hover:bg-violet-500 border-violet-500/30 text-white disabled:opacity-40 transition-all"
        >
          {isSending ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : '📧'}
          Envoyer à tous
          {totalUsers !== null ? ` (${totalUsers} destinataires)` : ''}
        </button>
      </div>

      {/* Campaign history */}
      {campaigns.length > 0 && (
        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Historique des campagnes</p>
          <div className="space-y-2">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-white/3 border border-white/5 px-4 py-2.5">
                <div>
                  <p className="text-sm text-white/70">{c.name}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(c.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-sm font-medium text-white/50">{c.recipients_count} envois</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
