'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const TOKEN_COST  = 16_000
const EXPECTED_CHARS = 28_000

function NouveauForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prompt, setPrompt]     = useState(searchParams.get('prompt') || '')
  const [siteName, setSiteName] = useState('')
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState<'idle' | 'generating' | 'saving'>('idle')
  const [generatedChars, setGeneratedChars] = useState(0)
  const [tokens, setTokens]     = useState<{ used: number; limit: number } | null>(null)
  const [isAdmin, setIsAdmin]   = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setIsAdmin(user.email === ADMIN_EMAIL)
      supabase
        .from('users')
        .select('tokens_used, tokens_limit')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setTokens({ used: data.tokens_used, limit: data.tokens_limit })
        })
    })
  }, [])

  const tokensRemaining = tokens ? Math.max(0, tokens.limit - tokens.used) : null
  const tokenPct        = tokens && tokens.limit > 0 ? ((tokensRemaining ?? 0) / tokens.limit) * 100 : 100
  const noTokens        = !isAdmin && tokens !== null && tokensRemaining !== null && tokensRemaining < TOKEN_COST

  const progress = step === 'saving' ? 100
    : generatedChars > 0 ? Math.min(Math.round((generatedChars / EXPECTED_CHARS) * 100), 99)
    : 0

  const tokenColor = tokenPct > 50 ? 'var(--accent)' : tokenPct > 20 ? '#d97706' : '#dc2626'

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Décris le site que tu veux créer'); return }
    setLoading(true)
    setStep('generating')
    setGeneratedChars(0)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          name: siteName.trim() || `Site IA — ${new Date().toLocaleDateString('fr-FR')}`,
          quality: 'standard',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la génération')
        if (data.needsUpgrade) router.push('/tarifs')
        return
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.type === 'progress') {
              setGeneratedChars(data.chars)
            } else if (data.type === 'done') {
              setStep('saving')
              toast.success('Site généré !')
              router.push(`/dashboard/sites/${data.siteId}`)
              return
            } else if (data.type === 'error') {
              toast.error(data.message || 'Erreur lors de la génération')
              return
            }
          } catch { /* ignore malformed SSE line */ }
        }
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate()
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    padding: '14px 20px',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--fg)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    resize: 'none' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
          style={{ background: 'var(--accent-light)' }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>
          Nouveau site
        </h1>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Décris ton site en quelques mots — l&apos;IA s&apos;occupe du reste.
        </p>
      </div>

      {/* Token indicator */}
      {!isAdmin && tokens && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4 text-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--fg-muted)' }}>Tokens disponibles</span>
          <span className="font-semibold tabular-nums" style={{ color: tokenColor }}>
            {tokensRemaining!.toLocaleString('fr-FR')} / {tokens.limit.toLocaleString('fr-FR')}
          </span>
        </div>
      )}

      <div className="rounded-2xl p-4 md:p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {/* Site name */}
        <input
          type="text"
          value={siteName}
          onChange={e => setSiteName(e.target.value)}
          placeholder="Nom du site (optionnel)"
          style={inputBase}
          className="mb-3"
          onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
        />

        {/* Prompt */}
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex : Un site restaurant gastronomique à Paris, thème sombre élégant, avec menu, réservations et galerie photo…"
          rows={6}
          style={{ ...inputBase, marginBottom: 16 }}
          autoFocus
          onFocus={e => {
            e.target.style.borderColor = 'var(--accent)'
            e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15), 0 2px 8px rgba(0,0,0,0.06)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
          }}
        />

        {/* Upgrade banner */}
        {noTokens && (
          <div className="rounded-xl p-4 mb-4 text-center"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <p className="text-sm mb-1" style={{ color: '#dc2626' }}>
              Tokens insuffisants pour générer un site.
            </p>
            <p className="text-xs mb-3" style={{ color: '#ef4444' }}>
              Il vous reste {tokensRemaining!.toLocaleString('fr-FR')} tokens, la génération en requiert {TOKEN_COST.toLocaleString('fr-FR')}.
            </p>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg transition-all"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              Obtenir plus de tokens →
            </Link>
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span style={{ color: 'var(--fg-muted)' }}>
                {step === 'saving' ? 'Sauvegarde…' : 'Génération en cours…'}
              </span>
              <span className="font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>{progress}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'var(--accent)' }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link
            href="/prompt-builder"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
          >
            <span>🪄</span>
            Construire mon prompt étape par étape
          </Link>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || noTokens}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{ background: 'var(--accent)' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {step === 'saving' ? 'Sauvegarde…' : progress > 0 ? `${progress}%` : 'Génération…'}
              </>
            ) : (
              'Générer mon site'
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-xs mt-4" style={{ color: 'var(--fg-subtle)' }}>
        {loading
          ? `${generatedChars.toLocaleString('fr-FR')} caractères générés…`
          : 'Ctrl+Entrée pour lancer la génération'}
      </p>
    </div>
  )
}

export default function NouveauPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardSidebar />
      <main className="md:ml-64 min-h-screen flex items-center justify-center p-4 md:p-8 pt-16 md:pt-8">
        <Suspense fallback={null}>
          <NouveauForm />
        </Suspense>
      </main>
    </div>
  )
}
