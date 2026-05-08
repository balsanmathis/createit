'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TYPEWRITER_PROMPTS = [
  'Crée un site pour mon restaurant italien...',
  'Crée un portfolio créatif pour designer...',
  'Crée une landing page SaaS moderne...',
  'Crée un site pour mon agence web...',
]

const TEMPLATES = [
  { label: 'Restaurant', icon: '🍕', color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/20' },
  { label: 'Portfolio', icon: '🎨', color: 'from-violet-500/20 to-pink-500/20', border: 'border-violet-500/20' },
  { label: 'Agence', icon: '💼', color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
  { label: 'E-commerce', icon: '🛍️', color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/20' },
  { label: 'Blog', icon: '📝', color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/20' },
  { label: 'SaaS', icon: '🚀', color: 'from-indigo-500/20 to-violet-500/20', border: 'border-indigo-500/20' },
  { label: 'Association', icon: '🤝', color: 'from-teal-500/20 to-green-500/20', border: 'border-teal-500/20' },
  { label: 'Landing page', icon: '⚡', color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/20' },
]

const STATS = [
  { value: 2847, label: 'sites créés', suffix: '' },
  { value: 98, label: 'satisfaits', suffix: '%' },
  { value: 30, label: 'secondes en moyenne', suffix: 's' },
]

const TESTIMONIALS = [
  {
    name: 'Sophie Martin',
    role: 'Restauratrice',
    avatar: 'SM',
    text: 'Mon site de restaurant était prêt en moins d\'une minute. Exactement ce dont j\'avais besoin, sans prise de tête.',
    stars: 5,
  },
  {
    name: 'Lucas Bernard',
    role: 'Freelance designer',
    avatar: 'LB',
    text: 'J\'ai généré mon portfolio complet en décrivant mon style. Le résultat était bluffant, prêt à montrer à mes clients.',
    stars: 5,
  },
  {
    name: 'Marie Dubois',
    role: 'Fondatrice SaaS',
    avatar: 'MD',
    text: 'Notre landing page convertit mieux que celle faite par notre agence. Et ça nous a coûté 45€ au lieu de 3000€.',
    stars: 5,
  },
]

const STEPS = [
  { num: '01', icon: '✍️', title: 'Décrivez', desc: 'Décrivez votre site en langage naturel. Type, style, sections, couleurs — dites tout.' },
  { num: '02', icon: '⚡', title: 'L\'IA génère', desc: 'Claude AI génère un site complet, beau et professionnel en moins de 30 secondes.' },
  { num: '03', icon: '📦', title: 'Téléchargez', desc: 'Exportez en ZIP, publiez directement ou continuez à éditer visuellement.' },
]

const PRICING = [
  {
    name: 'Starter',
    price: 20,
    sites: 10,
    features: ['10 sites/mois', 'Export HTML/ZIP', 'Éditeur visuel', 'Support email'],
    cta: 'Commencer',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 45,
    sites: 30,
    features: ['30 sites/mois', 'Export HTML/ZIP', 'Éditeur visuel avancé', 'Templates premium', 'Support prioritaire'],
    cta: 'Choisir Pro',
    highlight: true,
  },
  {
    name: 'Agency',
    price: 250,
    sites: 200,
    features: ['200 sites/mois', 'Export HTML/ZIP', 'Marque blanche', 'API access', 'Support dédié', 'Facturation client'],
    cta: 'Contacter',
    highlight: false,
  },
]

export default function HomePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [typewriterText, setTypewriterText] = useState('')
  const [typewriterIdx, setTypewriterIdx] = useState(0)
  const [navOpaque, setNavOpaque] = useState(false)
  const [cursor, setCursor] = useState({ x: -200, y: -200 })
  const [counts, setCounts] = useState(STATS.map(() => 0))
  const statsRef = useRef<HTMLDivElement>(null)
  const statsAnimated = useRef(false)

  // Cursor glow
  useEffect(() => {
    const move = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  // Navbar opacity on scroll
  useEffect(() => {
    const onScroll = () => setNavOpaque(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Typewriter
  useEffect(() => {
    const full = TYPEWRITER_PROMPTS[typewriterIdx]
    let i = 0
    setTypewriterText('')
    const type = setInterval(() => {
      i++
      setTypewriterText(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(type)
        setTimeout(() => setTypewriterIdx((prev) => (prev + 1) % TYPEWRITER_PROMPTS.length), 2000)
      }
    }, 40)
    return () => clearInterval(type)
  }, [typewriterIdx])

  // Count-up on scroll
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !statsAnimated.current) {
        statsAnimated.current = true
        STATS.forEach((stat, i) => {
          const duration = 1800
          const steps = 60
          const inc = stat.value / steps
          let cur = 0
          const timer = setInterval(() => {
            cur = Math.min(cur + inc, stat.value)
            setCounts((prev) => { const n = [...prev]; n[i] = Math.floor(cur); return n })
            if (cur >= stat.value) clearInterval(timer)
          }, duration / steps)
        })
      }
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const handleGenerate = () => {
    if (!prompt.trim()) return
    router.push(`/generate?prompt=${encodeURIComponent(prompt.trim())}`)
  }

  const handleTag = (tag: string) => {
    setPrompt(`Crée un site pour ${tag.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white overflow-x-hidden">
      {/* Cursor glow */}
      <div
        className="pointer-events-none fixed z-50 transition-transform duration-100"
        style={{
          left: cursor.x - 200,
          top: cursor.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Floating orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full bg-pink-600/8 blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navOpaque ? 'bg-[#080810]/90 backdrop-blur-md border-b border-white/5 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">✦</span>
            </div>
            <span className="text-lg font-bold">Create<span className="text-violet-400">It</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#templates" className="hover:text-white transition-colors">Templates</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#how" className="hover:text-white transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Se connecter
            </Link>
            <Link href="/auth/signup" className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-5 py-2 rounded-full transition-all shadow-lg hover:shadow-violet-500/25">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center z-10">
        {/* Animated badge */}
        <a href="#pricing" className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-sm text-violet-300 hover:bg-violet-500/15 transition-all group">
          <span>✨</span>
          <span>Génération IA en 30 secondes</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </a>

        {/* Claude badge */}
        <div className="inline-flex items-center gap-1.5 mb-6 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
          <span className="text-violet-400">✦</span>
          Propulsé par Claude AI
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-6">
          <span className="text-white">Créez des sites web</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
            en quelques mots
          </span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mb-10 leading-relaxed">
          Décrivez votre site, notre IA le crée en 30 secondes.<br />
          Beau, professionnel, prêt à vendre.
        </p>

        {/* Prompt bar */}
        <div className="w-full max-w-2xl mb-4">
          <div className="relative flex items-center bg-white/5 border border-white/10 hover:border-violet-500/40 focus-within:border-violet-500/60 rounded-2xl p-2 transition-all shadow-xl shadow-black/20">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder={typewriterText || TYPEWRITER_PROMPTS[0]}
              className="flex-1 bg-transparent text-white placeholder-white/30 px-4 py-3 text-base outline-none"
            />
            <button
              onClick={handleGenerate}
              className="shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-violet-500/30 text-sm"
            >
              Générer →
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['🍕 Restaurant', '💼 Portfolio', '🛍️ E-commerce', '🚀 SaaS', '📝 Blog'].map((tag) => (
            <button
              key={tag}
              onClick={() => handleTag(tag.split(' ').slice(1).join(' '))}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/50 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        <p className="text-sm text-white/30">Sans carte bancaire • Export ZIP inclus</p>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {STATS.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl font-black text-white mb-1">
                {counts[i].toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Tous types de sites</h2>
            <p className="text-white/40">Restaurants, portfolios, SaaS, e-commerce — l&apos;IA s&apos;adapte à tout</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                onClick={() => { setPrompt(`Crée un site ${t.label.toLowerCase()} moderne et professionnel`); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={`group relative p-6 rounded-2xl bg-gradient-to-br ${t.color} border ${t.border} hover:scale-105 transition-all duration-200 text-left`}
              >
                <div className="text-3xl mb-3">{t.icon}</div>
                <div className="font-semibold text-white text-sm">{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative z-10 py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Comment ça marche</h2>
            <p className="text-white/40">Trois étapes, moins d&apos;une minute</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-violet-500/30 to-transparent -translate-y-1/2 z-0" style={{ width: 'calc(100% - 4rem)' }} />
                )}
                <div className="relative z-10 glass rounded-2xl p-6 border border-white/5 hover:border-violet-500/20 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="text-xs font-mono text-violet-400">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Tarifs simples</h2>
            <p className="text-white/40">Sans engagement, sans surprise</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-violet-500/10 to-indigo-500/5 border-violet-500/40 shadow-xl shadow-violet-500/10 scale-105'
                    : 'glass border-white/10 hover:border-white/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-semibold text-white">
                    Populaire
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}€</span>
                    <span className="text-white/40 mb-1">/mois</span>
                  </div>
                  <p className="text-sm text-violet-400 mt-1">{plan.sites} sites/mois</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <span className="text-violet-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center font-semibold py-3 rounded-xl transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg hover:shadow-violet-500/25'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">Ils ont créé avec CreateIt</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass rounded-2xl p-6 border border-white/5 hover:border-violet-500/20 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-4">Prêt à créer ?</h2>
          <p className="text-white/40 mb-8">Rejoignez des milliers de créateurs. Commencez gratuitement.</p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 text-lg"
          >
            Commencer gratuitement →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs">✦</span>
            </div>
            <span className="font-bold text-white">Create<span className="text-violet-400">It</span></span>
          </div>
          <p className="text-sm text-white/30">© 2025 CreateIt. Propulsé par Claude AI.</p>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="#" className="hover:text-white transition-colors">CGU</Link>
            <Link href="#" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/auth/login" className="hover:text-white transition-colors">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
