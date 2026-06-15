'use client'

import { useState } from 'react'

interface CleanResult {
  ok: boolean
  total: number
  cleaned: number
  skipped: number
  errors: number
}

export default function CleanSitesButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<CleanResult | null>(null)
  const [errMsg, setErrMsg] = useState('')

  async function run() {
    if (!confirm('Nettoyer TOUS les sites de TOUS les clients ?\nLe prompt visible en bas des pages sera supprimé.')) return

    setState('loading')
    setResult(null)
    setErrMsg('')

    try {
      const res = await fetch('/api/admin/clean-all-sites', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')
      setResult(data as CleanResult)
      setState('done')
      setTimeout(() => setState('idle'), 10_000)
    } catch (e) {
      setErrMsg(String(e))
      setState('error')
      setTimeout(() => setState('idle'), 8_000)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={run}
        disabled={state === 'loading'}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all
          ${state === 'done'
            ? 'bg-green-500/20 border-green-500/30 text-green-300'
            : state === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-300'
            : 'glass border-red-500/20 text-red-300 hover:bg-red-500/10 disabled:opacity-50'
          }`}
      >
        {state === 'loading' ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Nettoyage en cours…
          </>
        ) : state === 'done' && result ? (
          <>✓ {result.cleaned} nettoyés · {result.skipped} propres · {result.errors} erreurs</>
        ) : state === 'error' ? (
          <>✗ {errMsg}</>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Nettoyer tous les sites
          </>
        )}
      </button>
    </div>
  )
}
