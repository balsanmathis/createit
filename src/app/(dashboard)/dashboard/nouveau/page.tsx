'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'
const EXPECTED_CHARS = 30_000

type Quality = 'rapide' | 'standard' | 'premium' | 'ultra'
type Mode = 'ai' | 'builder' | null

const QUALITY_OPTIONS: { key: Quality; label: string; desc: string; cost: number; time: string }[] = [
  { key: 'rapide',   label: 'Rapide',   desc: 'Site de base',     cost: 8_000,  time: '~15s' },
  { key: 'standard', label: 'Standard', desc: 'Site complet',     cost: 16_000, time: '~25s' },
  { key: 'premium',  label: 'Premium',  desc: 'Site riche',       cost: 32_000, time: '~40s' },
  { key: 'ultra',    label: 'Ultra',    desc: 'Qualité agence',   cost: 64_000, time: '~55s' },
]

const GENERATION_STEPS = [
  'Analyse du prompt…',
  'Création du design…',
  'Génération du contenu…',
  'Finalisation…',
]

function getStepIndex(progress: number): number {
  if (progress < 20) return 0
  if (progress < 55) return 1
  if (progress < 88) return 2
  return 3
}

function NouveauForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>(null)
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '')
  const [siteName, setSiteName] = useState('')
  const [quality, setQuality] = useState<Quality>('standard')
  const [loading, setLoading] = useState(false)
  const [generatedChars, setGeneratedChars] = useState(0)
  const [step, setStep] = useState<'idle' | 'generating' | 'saving'>('idle')
  const [tokens, setTokens] = useState<{ used: number; limit: number } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

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

  const selectedQ = QUALITY_OPTIONS.find(q => q.key === quality)!
  const tokensRemaining = tokens ? Math.max(0, tokens.limit - tokens.used) : null
  const noTokens = !isAdmin && tokens !== null && tokensRemaining !== null && tokensRemaining < selectedQ.cost

  const progress = step === 'saving' ? 100
    : generatedChars > 0 ? Math.min(Math.round((generatedChars / EXPECTED_CHARS) * 100), 99)
    : 0

  const activeStepIdx = loading ? getStepIndex(progress) : -1

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
          quality,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la génération')
        if (data.needsUpgrade) router.push('/tarifs')
        return
      }

      const reader = res.body!.getReader()
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
              toast.success('Site généré avec succès !')
              router.push(`/dashboard/sites/${data.siteId}`)
              return
            } else if (data.type === 'error') {
              toast.error(data.message || 'Erreur lors de la génération')
              return
            }
          } catch { /* ignore malformed SSE */ }
        }
      }
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    padding: '14px 20px',
    fontSize: 15,
    fontWeight: 500,
    color: 'var(--fg)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    resize: 'none' as const,
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>
          Créer un nouveau site
        </h1>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Choisissez votre méthode de création
        </p>
      </div>

      {/* Mode selector — two big cards */}
      {mode === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Option 1 — AI */}
          <button
            onClick={() => setMode('ai')}
            className="rounded-2xl p-6 text-left transition-all"
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--accent)'
              e.currentTarget.style.background = 'var(--accent-light)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div className="text-3xl mb-3">✨</div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--fg)' }}>
              Générer avec l&apos;IA
            </h2>
            <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>
              Décrivez votre site en quelques mots, notre IA crée tout automatiquement
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              ⏱ ~30 secondes
            </span>
          </button>

          {/* Option 2 — Builder */}
          <Link
            href="/builder"
            className="rounded-2xl p-6 text-left transition-all block"
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--border)',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#0ea5e9'
              e.currentTarget.style.background = 'rgba(14,165,233,0.06)'
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(14,165,233,0.12)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--surface)'
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div className="text-3xl mb-3">🎨</div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--fg)' }}>
              Builder visuel
            </h2>
            <p className="text-sm mb-3" style={{ color: 'var(--fg-muted)' }}>
              Construisez votre site bloc par bloc avec notre éditeur visuel
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>
              ⏱ À votre rythme
            </span>
          </Link>
        </div>
      )}

      {/* AI Generation Form */}
      {mode === 'ai' && (
        <>
          {/* Back button */}
          <button
            onClick={() => setMode(null)}
            className="flex items-center gap-2 text-sm mb-6 transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)', padding: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>

          {/* Token indicator */}
          {!isAdmin && tokens && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4 text-sm"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--fg-muted)' }}>Tokens disponibles</span>
              <span className="font-semibold tabular-nums" style={{
                color: tokensRemaining! > selectedQ.cost * 2 ? 'var(--accent)' : tokensRemaining! > selectedQ.cost ? '#d97706' : '#dc2626'
              }}>
                {tokensRemaining!.toLocaleString('fr-FR')} / {tokens.limit.toLocaleString('fr-FR')}
              </span>
            </div>
          )}

          <div className="rounded-2xl p-5 md:p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

            {/* Quality selector */}
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--fg-subtle)' }}>
                Qualité de génération
              </p>
              <div className="grid grid-cols-4 gap-2">
                {QUALITY_OPTIONS.map(q => (
                  <button
                    key={q.key}
                    onClick={() => setQuality(q.key)}
                    className="rounded-xl py-2.5 px-1 text-center transition-all"
                    style={{
                      background: quality === q.key ? 'var(--accent-light)' : 'var(--bg)',
                      border: quality === q.key ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="text-xs font-bold" style={{ color: quality === q.key ? 'var(--accent)' : 'var(--fg)' }}>
                      {q.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: quality === q.key ? 'var(--accent)' : 'var(--fg-subtle)' }}>
                      {q.time}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--fg-subtle)' }}>
                {selectedQ.desc} · Coût : {selectedQ.cost.toLocaleString('fr-FR')} tokens
              </p>
            </div>

            {/* Site name */}
            <input
              type="text"
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              placeholder="Nom du site (optionnel)"
              style={{ ...inputBase, marginBottom: 12 }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
            />

            {/* Prompt */}
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerate() }}
              placeholder="Ex : Un restaurant gastronomique à Lyon, thème sombre élégant, avec menu, réservations et galerie photo…"
              rows={5}
              style={{ ...inputBase, marginBottom: 16 }}
              autoFocus
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent)'
                e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)'
                e.target.style.boxShadow = 'none'
              }}
            />

            {/* Upgrade banner */}
            {noTokens && (
              <div className="rounded-xl p-4 mb-4 text-center"
                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}>
                <p className="text-sm mb-1" style={{ color: '#dc2626' }}>Tokens insuffisants.</p>
                <p className="text-xs mb-3" style={{ color: '#ef4444' }}>
                  Il vous reste {tokensRemaining!.toLocaleString('fr-FR')} tokens, la génération nécessite {selectedQ.cost.toLocaleString('fr-FR')}.
                </p>
                <Link href="/tarifs" className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  Obtenir plus de tokens →
                </Link>
              </div>
            )}

            {/* Progress */}
            {loading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium" style={{ color: 'var(--accent)' }}>
                    {step === 'saving' ? 'Sauvegarde…' : GENERATION_STEPS[activeStepIdx] ?? 'Génération en cours…'}
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: 'var(--accent)' }}>{progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, background: 'var(--accent)' }}
                  />
                </div>
                {/* Steps */}
                <div className="flex gap-1">
                  {GENERATION_STEPS.map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-0.5 rounded-full" style={{
                        background: i <= activeStepIdx ? 'var(--accent)' : 'var(--border)',
                        transition: 'background 0.4s'
                      }} />
                      <span className="text-[9px] text-center leading-tight hidden sm:block" style={{
                        color: i === activeStepIdx ? 'var(--accent)' : i < activeStepIdx ? 'var(--fg-muted)' : 'var(--fg-subtle)',
                        fontWeight: i === activeStepIdx ? 700 : 400,
                      }}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
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
                style={{ background: '#2563eb' }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb' }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {step === 'saving' ? 'Sauvegarde…' : `${progress}%`}
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Générer mon site
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-3" style={{ color: 'var(--fg-subtle)' }}>
            {loading
              ? `${generatedChars.toLocaleString('fr-FR')} caractères générés…`
              : 'Ctrl+Entrée pour lancer · Résultat en quelques secondes'}
          </p>
        </>
      )}
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
