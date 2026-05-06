'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { Suspense } from 'react'

const NAV_ITEMS = [
  { href: '/dashboard',      icon: '⊞', label: 'Dashboard' },
  { href: '/generate',       icon: '✦', label: 'Générer',        active: true },
  { href: '/prompt-builder', icon: '🪄', label: 'Créer un prompt' },
  { href: '/settings',       icon: '◎', label: 'Paramètres' },
]

function GenerateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '')
  const [siteName, setSiteName] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'idle' | 'generating' | 'saving'>('idle')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Décris le site que tu veux créer')
      return
    }
    setLoading(true)
    setStep('generating')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          name: siteName.trim() || `Site IA — ${new Date().toLocaleDateString('fr-FR')}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la génération')
        return
      }
      setStep('saving')
      toast.success('Site généré !')
      router.push(`/sites/${data.siteId}`)
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
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20 mb-5">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">
          Génère ton site<br />
          <span className="gradient-text">en quelques secondes</span>
        </h1>
        <p className="text-white/40 text-base">
          Décris ton site en quelques mots — l'IA s'occupe du reste.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 border border-white/5">
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

        <div className="flex items-center justify-between gap-4">
          <Link
            href="/prompt-builder"
            className="flex items-center gap-2 text-sm text-white/40 hover:text-violet-400 transition-colors"
          >
            <span>🪄</span>
            Construire mon prompt étape par étape
          </Link>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-violet-500/30 text-sm whitespace-nowrap"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {step === 'generating' ? 'Génération…' : 'Sauvegarde…'}
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
        Ctrl+Entrée pour générer · 1–3 min selon la complexité
      </p>
    </motion.div>
  )
}

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-[#080810] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/5 flex flex-col p-6 z-40">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold">Create<span className="gradient-text">It</span></span>
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                item.active
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="ml-64 min-h-screen flex items-center justify-center p-8">
        <Suspense fallback={null}>
          <GenerateForm />
        </Suspense>
      </main>
    </div>
  )
}
