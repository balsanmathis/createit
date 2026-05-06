'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const ThreeScene = dynamic(() => import('./ThreeScene'), { ssr: false })

const DEMO_PROMPTS_FR = [
  'Un site portfolio pour un développeur fullstack avec thème sombre',
  'Landing page pour une startup fintech moderne',
  'Site vitrine pour un restaurant gastronomique parisien',
  'Portfolio photographe avec galerie plein écran',
  'Site e-commerce pour une boutique de mode minimaliste',
]

const DEMO_PROMPTS_EN = [
  'A portfolio site for a fullstack developer with dark theme',
  'Landing page for a modern fintech startup',
  'Showcase site for a Parisian gourmet restaurant',
  'Photographer portfolio with fullscreen gallery',
  'E-commerce site for a minimalist fashion boutique',
]

interface HeroSectionProps {
  locale?: 'fr' | 'en'
}

export default function HeroSection({ locale = 'fr' }: HeroSectionProps) {
  const [promptIndex, setPromptIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [userPrompt, setUserPrompt] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prompts = locale === 'fr' ? DEMO_PROMPTS_FR : DEMO_PROMPTS_EN

  // Typewriter effect
  useEffect(() => {
    const current = prompts[promptIndex]
    let i = 0
    setDisplayText('')
    setIsTyping(true)

    const type = () => {
      if (i <= current.length) {
        setDisplayText(current.slice(0, i))
        i++
        timeoutRef.current = setTimeout(type, 40)
      } else {
        setIsTyping(false)
        timeoutRef.current = setTimeout(() => {
          setPromptIndex((prev) => (prev + 1) % prompts.length)
        }, 2500)
      }
    }
    type()

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptIndex])

  const STATS = locale === 'fr'
    ? [
        { value: '12 847', label: 'Sites générés' },
        { value: '3 200+', label: 'Utilisateurs actifs' },
        { value: '~8s', label: 'En moyenne' },
      ]
    : [
        { value: '12,847', label: 'Sites generated' },
        { value: '3,200+', label: 'Active users' },
        { value: '~8s', label: 'On average' },
      ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Three.js canvas */}
      <div className="absolute inset-0 opacity-70">
        <ThreeScene />
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-violet-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080810] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 border border-violet-500/20"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm text-violet-300 font-medium">
            {locale === 'fr' ? 'Propulsé par Claude AI' : 'Powered by Claude AI'}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.9] mb-6"
        >
          {locale === 'fr' ? (
            <>
              Créez des sites web<br />
              <span className="gradient-text glow-text">en secondes</span>
            </>
          ) : (
            <>
              Build websites<br />
              <span className="gradient-text glow-text">in seconds</span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {locale === 'fr'
            ? 'Décrivez votre site en langage naturel. L\'IA le génère instantanément. Design professionnel, responsive, prêt à l\'emploi.'
            : 'Describe your website in plain language. AI generates it instantly. Professional design, responsive, ready to use.'}
        </motion.p>

        {/* Demo prompt input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative glass-strong rounded-2xl p-1">
            <div className="flex items-center gap-3 px-4 py-3 min-h-[56px]">
              <svg className="w-5 h-5 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <div className="flex-1 text-left">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={displayText}
                    className="text-white/70 text-sm"
                  >
                    {displayText}
                    {isTyping && (
                      <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-[blink_1s_step-end_infinite]" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </div>
              <input
                type="text"
                className="sr-only"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                aria-label={locale === 'fr' ? 'Votre prompt' : 'Your prompt'}
              />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 pointer-events-none" />
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/auth/signup"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {locale === 'fr' ? 'Créer mon premier site' : 'Create my first site'}
            <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-medium px-6 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {locale === 'fr' ? 'Voir une démo' : 'Watch demo'}
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-violet-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
