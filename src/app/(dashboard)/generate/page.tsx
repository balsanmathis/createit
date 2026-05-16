'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'balsanmathis08@gmail.com'
const TOKEN_COST_BASE = 8_000

type QualityKey = 'rapide' | 'standard' | 'premium' | 'ultra'

const QUALITY_OPTIONS: Array<{
  key: QualityKey
  icon: string
  label: string
  desc: string
  credits: number
  expectedChars: number
  badge?: string
}> = [
  { key: 'rapide',   icon: '⚡', label: 'Rapide',   desc: 'Site simple, 3 sections',             credits: 1, expectedChars: 14_000 },
  { key: 'standard', icon: '⭐', label: 'Standard',  desc: 'Site complet et professionnel',       credits: 2, expectedChars: 28_000 },
  { key: 'premium',  icon: '🔥', label: 'Premium',   desc: 'Qualité agence, animations avancées', credits: 4, expectedChars: 55_000 },
  { key: 'ultra',    icon: '💎', label: 'Ultra',     desc: 'Site exceptionnel, qualité maximale', credits: 8, expectedChars: 110_000, badge: 'Meilleure qualité' },
]

function GenerateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prompt, setPrompt]   = useState(searchParams.get('prompt') || '')
  const [siteName, setSiteName] = useState('')
  const [quality, setQuality] = useState<QualityKey>('standard')
  const [loading, setLoading] = useState(false)
  const [step, setStep]       = useState<'idle' | 'generating' | 'saving'>('idle')
  const [generatedChars, setGeneratedChars] = useState(0)
  const [tokens, setTokens]   = useState<{ used: number; limit: number } | null>(null)
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

  const selectedQ       = QUALITY_OPTIONS.find(q => q.key === quality)!
  const tokensRemaining = tokens ? Math.max(0, tokens.limit - tokens.used) : null
  const tokenPct        = tokens && tokens.limit > 0 ? (tokensRemaining! / tokens.limit) * 100 : 100
  const tokensNeeded    = selectedQ.credits * TOKEN_COST_BASE
  const creditsAfter    = tokensRemaining !== null ? Math.floor((tokensRemaining - tokensNeeded) / TOKEN_COST_BASE) : null
  const noTokens        = !isAdmin && tokens !== null && tokensRemaining !== null && tokensRemaining < tokensNeeded

  const progress = step === 'saving' ? 100
    : generatedChars > 0 ? Math.min(Math.round((generatedChars / selectedQ.expectedChars) * 100), 99)
    : 0

  const tokenColor  = tokenPct > 50 ? '#4ade80' : tokenPct > 20 ? '#f97316' : '#ef4444'
  const tokenBg     = tokenPct > 50 ? 'rgba(74,222,128,0.1)' : tokenPct > 20 ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)'
  const tokenBorder = tokenPct > 50 ? 'rgba(74,222,128,0.2)' : tokenPct > 20 ? 'rgba(249,115,22,0.2)' : 'rgba(239,68,68,0.2)'

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Décris le site que tu veux créer')
      return
    }
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
        if (data.needsUpgrade) router.push('/pricing')
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
              router.push(`/sites/${data.siteId}`)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="text-center mb-8 md:mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 mb-4 md:mb-5">
          <svg className="w-7 h-7 md:w-8 md:h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
          Génère ton site<br />
          <span className="gradient-text">en quelques secondes</span>
        </h1>
        <p className="text-white/40 text-sm md:text-base">
          Décris ton site en quelques mots — l&apos;IA s&apos;occupe du reste.
        </p>
      </div>

      {/* Token indicator */}
      {!isAdmin && tokens && (
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4 text-sm"
          style={{ background: tokenBg, border: `1px solid ${tokenBorder}` }}
        >
          <span className="text-white/50">Tokens disponibles</span>
          <span className="font-semibold tabular-nums" style={{ color: tokenColor }}>
            {tokensRemaining!.toLocaleString('fr-FR')} / {tokens.limit.toLocaleString('fr-FR')}
          </span>
        </div>
      )}

      <div className="glass rounded-2xl p-4 md:p-6 border border-white/5">
        {/* Site name */}
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="Nom du site (optionnel)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:border-violet-500/40 focus:outline-none transition-colors mb-3"
        />

        {/* Prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex : Un site restaurant gastronomique à Paris, thème sombre élégant, avec menu, réservations et galerie photo…"
          rows={5}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:border-violet-500/40 focus:outline-none transition-colors resize-none mb-4"
          autoFocus
        />

        {/* Quality selector */}
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-wider text-white/30 mb-2">Qualité</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUALITY_OPTIONS.map((q) => {
              const isSelected = quality === q.key
              return (
                <button
                  key={q.key}
                  onClick={() => setQuality(q.key)}
                  disabled={loading}
                  className="relative flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all disabled:opacity-50"
                  style={{
                    background:   isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor:  isSelected ? 'rgba(124,58,237,0.5)'  : 'rgba(255,255,255,0.07)',
                    boxShadow:    isSelected ? '0 0 0 1px rgba(124,58,237,0.3)' : 'none',
                  }}
                >
                  {q.badge && (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ background: 'linear-gradient(90deg,#7c3aed,#6366f1)', color: 'white' }}
                    >
                      {q.badge}
                    </span>
                  )}
                  <span className="text-base leading-none">{q.icon}</span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-violet-300' : 'text-white/70'}`}>
                    {q.label}
                  </span>
                  <span className="text-[10px] text-white/35 leading-tight">{q.desc}</span>
                  <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-violet-400' : 'text-white/30'}`}>
                    {q.credits} crédit{q.credits > 1 ? 's' : ''}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Ultra warning */}
        {quality === 'ultra' && !loading && (
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs"
            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', color: 'rgba(253,230,138,0.8)' }}
          >
            <span>⏱</span>
            <span>La génération Ultra peut prendre 30–60 secondes</span>
          </div>
        )}

        {/* Credit preview */}
        {!isAdmin && tokens && !noTokens && (
          <div
            className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 rounded-xl mb-4 text-xs text-white/40"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <span>Ce site consommera</span>
            <span className="font-semibold text-violet-400">
              {selectedQ.credits} crédit{selectedQ.credits > 1 ? 's' : ''}
            </span>
            <span>—</span>
            <span>Il vous restera</span>
            <span className="font-semibold" style={{ color: (creditsAfter ?? 0) >= 0 ? '#a78bfa' : '#ef4444' }}>
              {Math.max(0, creditsAfter ?? 0)} crédit{Math.max(0, creditsAfter ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Upgrade banner when not enough tokens */}
        {noTokens && (
          <div
            className="rounded-xl p-4 mb-4 text-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <p className="text-sm text-red-300 mb-1">
              Pas assez de crédits pour ce niveau de qualité.
            </p>
            <p className="text-xs text-red-300/60 mb-3">
              Il vous faut {selectedQ.credits} crédits ({tokensNeeded.toLocaleString('fr-FR')} tokens),
              vous en avez {tokensRemaining!.toLocaleString('fr-FR')}.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)' }}
            >
              Obtenir plus de tokens →
            </Link>
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/40">
                {step === 'saving'
                  ? 'Sauvegarde…'
                  : quality === 'ultra'
                  ? '💎 Génération Ultra en cours…'
                  : 'Génération en cours…'}
              </span>
              <span className="font-semibold tabular-nums" style={{ color: '#a78bfa' }}>
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: quality === 'ultra'
                    ? 'linear-gradient(90deg,#7c3aed,#ec4899,#f59e0b)'
                    : quality === 'premium'
                    ? 'linear-gradient(90deg,#7c3aed,#ec4899)'
                    : 'linear-gradient(90deg,#7c3aed,#6366f1)',
                  boxShadow: progress > 0 ? '0 0 8px rgba(124,58,237,0.6)' : 'none',
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link
            href="/prompt-builder"
            className="flex items-center gap-2 text-sm text-white/40 hover:text-violet-400 transition-colors"
          >
            <span>🪄</span>
            Construire mon prompt étape par étape
          </Link>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || noTokens}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-violet-500/30 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {step === 'saving' ? 'Sauvegarde…' : progress > 0 ? `${progress}%` : 'Génération…'}
              </>
            ) : (
              <>
                <span>{selectedQ.icon}</span>
                Générer · {selectedQ.label}
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-white/20 mt-4">
        {loading
          ? `${generatedChars.toLocaleString('fr-FR')} caractères générés…`
          : 'Ctrl+Entrée pour générer · 10–60 sec selon qualité'}
      </p>
    </motion.div>
  )
}

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <DashboardSidebar activeHref="/generate" />

      <main className="md:ml-64 min-h-screen flex items-center justify-center p-4 md:p-8 pt-16 md:pt-8">
        <Suspense fallback={null}>
          <GenerateForm />
        </Suspense>
      </main>
    </div>
  )
}
