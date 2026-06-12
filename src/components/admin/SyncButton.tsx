'use client'

import { useState } from 'react'

export default function SyncButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function sync() {
    setState('loading')
    setMsg('')
    try {
      const res = await fetch('/api/admin/sync-stripe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur')
      const errSummary = data.errors?.length ? ` (${data.errors.length} erreurs)` : ''
      setMsg(`${data.updated} utilisateurs synchronisés${errSummary}`)
      setState('done')
      setTimeout(() => setState('idle'), 5000)
    } catch (e) {
      setMsg(String(e))
      setState('error')
      setTimeout(() => setState('idle'), 6000)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={sync}
        disabled={state === 'loading'}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all
          ${state === 'done'
            ? 'bg-green-500/20 border-green-500/30 text-green-300'
            : state === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-300'
            : 'glass border-amber-500/20 text-amber-300 hover:bg-amber-500/10 disabled:opacity-50'
          }`}
      >
        {state === 'loading' ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Synchronisation…
          </>
        ) : state === 'done' ? (
          <>✓ {msg}</>
        ) : state === 'error' ? (
          <>✗ {msg}</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync Stripe
          </>
        )}
      </button>
    </div>
  )
}
