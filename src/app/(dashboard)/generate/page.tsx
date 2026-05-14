'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'balsanmathis08@gmail.com'

function GenerateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '')
  const [siteName, setSiteName] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'generating' | 'saving'>('idle')
  const [generatedChars, setGeneratedChars] = useState(0)
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

  const tokensRemaining = tokens ? Math.max(0, tokens.limit - tokens.used) : null
  const tokenPct = tokens && tokens.limit > 0 ? (tokensRemaining! / tokens.limit) * 100 : 100
  const noTokens = !isAdmin && tokensRemaining === 0

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
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la génération')
        if (data.needsUpgrade) router.push('/pricing')
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

  const tokenColor = tokenPct > 50 ? '#4ade80' : tokenPct > 20 ? '#f97316' : '#ef4444'
  const tokenBg = tokenPct > 50 ? 'rgba(74,222,128,0.1)' : tokenPct > 20 ? 'rgba(249,115,22,0.1)' : 'rgba(239,68,68,0.1)'
  const tokenBorder = tokenPct > 50 ? 'rgba(74,222,128,0.2)' : tokenPct > 20 ? 'rgba(249,115,22,0.2)' : 'rgba(239,68,68,0.2)'

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

      {/* Upgrade banner when out of tokens */}
      {noTokens && (
        <div className="rounded-xl p-4 mb-4 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-sm text-red-300 mb-3">Tu n&apos;as plus de tokens disponibles.</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2 rounded-lg transition-all"
            style={{ background: 'rgba(124,58,237,0.25)', color: '#c4b5fd', border: '1px solid rgba(124,58,237,0.4)' }}
          >
            Obtenir plus de tokens →
          </Link>
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
          rows={6}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:border-violet-500/40 focus:outline-none transition-colors resize-none mb-4"
          autoFocus
        />

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
                {step === 'saving' ? 'Sauvegarde…' : generatedChars > 0 ? `${generatedChars.toLocaleString('fr-FR')} car.` : 'Génération…'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
                Générer
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-white/20 mt-4">
        {loading && generatedChars > 0
          ? `${generatedChars.toLocaleString('fr-FR')} caractères générés…`
          : 'Ctrl+Entrée pour générer · 1–3 min selon la complexité'}
      </p>
    </motion.div>
  )
}

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <DashboardSidebar activeHref="/generate" />

      {/* Main */}
      <main className="md:ml-64 min-h-screen flex items-center justify-center p-4 md:p-8 pt-16 md:pt-8">
        <Suspense fallback={null}>
          <GenerateForm />
        </Suspense>
      </main>
    </div>
  )
}
