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

  const tokenColor  = tokenPct > 50 ? '#059669' : tokenPct > 20 ? '#d97706' : '#dc2626'
  const tokenBg     = tokenPct > 50 ? '#ecfdf5' : tokenPct > 20 ? '#fffbeb' : '#fef2f2'
  const tokenBorder = tokenPct > 50 ? '#a7f3d0' : tokenPct > 20 ? '#fde68a' : '#fecaca'

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
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] mb-4 md:mb-5">
          <svg className="w-7 h-7 md:w-8 md:h-8 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-3">
          Génère ton site<br />
          <span className="text-[#2563eb]">en quelques secondes</span>
        </h1>
        <p className="text-[#64748b] text-sm md:text-base">
          Décris ton site en quelques mots — l&apos;IA s&apos;occupe du reste.
        </p>
      </div>

      {/* Token indicator */}
      {!isAdmin && tokens && (
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4 text-sm"
          style={{ background: tokenBg, border: `1px solid ${tokenBorder}` }}
        >
          <span className="text-[#64748b]">Tokens disponibles</span>
          <span className="font-semibold tabular-nums" style={{ color: tokenColor }}>
            {tokensRemaining!.toLocaleString('fr-FR')} / {tokens.limit.toLocaleString('fr-FR')}
          </span>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#e2e8f0] shadow-sm">
        {/* Site name */}
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="Nom du site (optionnel)"
          className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:outline-none transition-colors mb-3"
        />

        {/* Prompt */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex : Un site restaurant gastronomique à Paris, thème sombre élégant, avec menu, réservations et galerie photo…"
          rows={5}
          className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:outline-none transition-colors resize-none mb-4"
          autoFocus
        />

        {/* Quality selector */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-2">Qualité</p>
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
                    background:  isSelected ? '#eff6ff' : '#f8fafc',
                    borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                    boxShadow:   isSelected ? '0 0 0 1px rgba(37,99,235,0.2)' : 'none',
                  }}
                >
                  {q.badge && (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap text-white"
                      style={{ background: '#2563eb' }}
                    >
                      {q.badge}
                    </span>
                  )}
                  <span className="text-base leading-none">{q.icon}</span>
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#2563eb]' : 'text-[#64748b]'}`}>
                    {q.label}
                  </span>
                  <span className="text-[10px] text-[#94a3b8] leading-tight">{q.desc}</span>
                  <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`}>
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
            style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
          >
            <span>⏱</span>
            <span>La génération Ultra peut prendre 30–60 secondes</span>
          </div>
        )}

        {/* Credit preview */}
        {!isAdmin && tokens && !noTokens && (
          <div
            className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 rounded-xl mb-4 text-xs text-[#64748b]"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
          >
            <span>Ce site consommera</span>
            <span className="font-semibold text-[#2563eb]">
              {selectedQ.credits} crédit{selectedQ.credits > 1 ? 's' : ''}
            </span>
            <span>—</span>
            <span>Il vous restera</span>
            <span className="font-semibold" style={{ color: (creditsAfter ?? 0) >= 0 ? '#059669' : '#dc2626' }}>
              {Math.max(0, creditsAfter ?? 0)} crédit{Math.max(0, creditsAfter ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Upgrade banner when not enough tokens */}
        {noTokens && (
          <div
            className="rounded-xl p-4 mb-4 text-center"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <p className="text-sm text-red-600 mb-1">
              Pas assez de crédits pour ce niveau de qualité.
            </p>
            <p className="text-xs text-red-400 mb-3">
              Il vous faut {selectedQ.credits} crédits ({tokensNeeded.toLocaleString('fr-FR')} tokens),
              vous en avez {tokensRemaining!.toLocaleString('fr-FR')}.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg transition-all bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] hover:bg-[#dbeafe]"
            >
              Obtenir plus de tokens →
            </Link>
          </div>
        )}

        {/* Progress bar */}
        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#64748b]">
                {step === 'saving'
                  ? 'Sauvegarde…'
                  : quality === 'ultra'
                  ? '💎 Génération Ultra en cours…'
                  : 'Génération en cours…'}
              </span>
              <span className="font-semibold tabular-nums text-[#2563eb]">
                {progress}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#e2e8f0]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: '#2563eb',
                }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link
            href="/prompt-builder"
            className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#2563eb] transition-colors"
          >
            <span>🪄</span>
            Construire mon prompt étape par étape
          </Link>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim() || noTokens}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm text-sm"
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

      <p className="text-center text-xs text-[#94a3b8] mt-4">
        {loading
          ? `${generatedChars.toLocaleString('fr-FR')} caractères générés…`
          : 'Ctrl+Entrée pour générer · 10–60 sec selon qualité'}
      </p>
    </motion.div>
  )
}

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeHref="/generate" />

      <main className="md:ml-64 min-h-screen flex items-center justify-center p-4 md:p-8 pt-16 md:pt-8">
        <Suspense fallback={null}>
          <GenerateForm />
        </Suspense>
      </main>
    </div>
  )
}
