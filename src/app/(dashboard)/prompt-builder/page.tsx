'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

// ─── Static data ──────────────────────────────────────────────────────────────

const SITE_TYPES = [
  { label: 'Restaurant',  icon: '🍽️' },
  { label: 'Portfolio',   icon: '🎨' },
  { label: 'Agence',      icon: '🏢' },
  { label: 'E-commerce',  icon: '🛍️' },
  { label: 'Blog',        icon: '✍️' },
  { label: 'SaaS',        icon: '⚡' },
  { label: 'Association', icon: '🤝' },
  { label: 'Autre',       icon: '✦'  },
]

const THEMES = [
  { label: 'Sombre',  desc: 'Fond noir / dark' },
  { label: 'Clair',   desc: 'Fond blanc / light' },
  { label: 'Coloré',  desc: 'Vibrant & audacieux' },
]

const AMBIANCES = ['Moderne', 'Élégant', 'Fun', 'Minimaliste', 'Luxe', 'Tech']

const SECTIONS_OPTIONS = [
  { label: 'Hero avec animation', default: true },
  { label: 'À propos',            default: false },
  { label: 'Services / Produits', default: true },
  { label: 'Portfolio / Galerie', default: false },
  { label: 'Équipe',              default: false },
  { label: 'Témoignages',        default: false },
  { label: 'Formulaire contact',  default: true },
  { label: 'FAQ',                 default: false },
  { label: 'Pricing',             default: false },
  { label: 'Blog',                default: false },
]

const ANIM_LEVELS = [
  { label: 'Simple',     desc: 'Transitions douces sur hover et apparition',                                                                   icon: '🌿' },
  { label: 'Avancé',     desc: 'Scroll animations, cards 3D, navigation sticky',                                                               icon: '⚡' },
  { label: 'Wow effect', desc: 'Particules CSS, flip 3D, typewriter, parallaxe',                                                               icon: '🎆' },
]

const COLOR_PRESETS = [
  { color: '#7c6ffa', name: 'Violet' },
  { color: '#06b6d4', name: 'Cyan' },
  { color: '#10b981', name: 'Vert' },
  { color: '#f59e0b', name: 'Ambre' },
  { color: '#ef4444', name: 'Rouge' },
  { color: '#ec4899', name: 'Rose' },
  { color: '#f97316', name: 'Orange' },
  { color: '#8b5cf6', name: 'Indigo' },
]

// ─── Prompt compiler ──────────────────────────────────────────────────────────

function buildPrompt(
  siteType: string, projectName: string, city: string, description: string,
  theme: string, primaryColor: string, ambiance: string, sections: string[], animLevel: string,
): string {
  if (!siteType && !projectName && !description) return ''
  const who = projectName ? `"${projectName}"` : 'mon projet'
  const where = city ? ` basé à ${city}` : ''
  const desc = description ? ` ${description.trim()}.` : ''
  const secs = sections.length ? `Sections obligatoires : ${sections.join(', ')}.` : ''
  const animDetail =
    animLevel === 'Simple'
      ? 'transitions CSS douces sur hover et apparition.'
      : animLevel === 'Avancé'
      ? 'fadeUp au scroll via IntersectionObserver, cards 3D hover (perspective + rotateY), navigation sticky animée.'
      : 'particules CSS @keyframes dans le hero, cartes avec flip 3D, texte avec effet typewriter, parallaxe multi-couches, révélations cinématiques au scroll.'
  return (
    `Crée un site web ${siteType || 'professionnel'} pour ${who}${where}.${desc} ` +
    `Style ${theme} avec couleur principale ${primaryColor}, ambiance ${ambiance}. ` +
    `${secs} ` +
    `Animations niveau "${animLevel}" : ${animDetail} ` +
    `RÈGLES TECHNIQUES OBLIGATOIRES : zéro dépendance externe, tout CSS/JS inline dans un seul fichier HTML, ` +
    `fonctionne en double-clic sur index.html sans serveur. ` +
    `background-color et color toujours explicites sur html et body. System fonts uniquement.`
  ).replace(/\s{2,}/g, ' ').trim()
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: n * 0.05 }}
      className="glass rounded-2xl p-5 md:p-6 border border-white/5"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
          {n}
        </span>
        <h2 className="text-sm font-bold text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
        active
          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
          : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
      }`}
    >
      {children}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PromptBuilderPage() {
  const router = useRouter()

  const [siteType,     setSiteType]     = useState('')
  const [projectName,  setProjectName]  = useState('')
  const [city,         setCity]         = useState('')
  const [description,  setDescription]  = useState('')
  const [theme,        setTheme]        = useState('Sombre')
  const [primaryColor, setPrimaryColor] = useState('#7c6ffa')
  const [ambiance,     setAmbiance]     = useState('Moderne')
  const [sections,     setSections]     = useState<string[]>(
    SECTIONS_OPTIONS.filter((s) => s.default).map((s) => s.label)
  )
  const [animLevel,    setAnimLevel]    = useState('Avancé')
  const [copied,       setCopied]       = useState(false)
  const [showResult,   setShowResult]   = useState(false)

  const prompt = useMemo(
    () => buildPrompt(siteType, projectName, city, description, theme, primaryColor, ambiance, sections, animLevel),
    [siteType, projectName, city, description, theme, primaryColor, ambiance, sections, animLevel],
  )

  const toggleSection = (s: string) =>
    setSections((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const handleBuild = () => {
    if (!prompt) { toast.error('Remplis au moins le type de site ou une description'); return }
    setShowResult(true)
    setTimeout(() => document.getElementById('prompt-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    toast.success('Prompt copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUse = () => router.push(`/dashboard/nouveau?prompt=${encodeURIComponent(prompt)}`)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <DashboardSidebar />

      <main className="md:ml-64 p-4 md:p-8 pb-24 pt-16 md:pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
              🪄 Créer un <span className="gradient-text">prompt</span>
            </h1>
            <p className="text-white/40 text-sm">
              Configure ton site étape par étape pour obtenir un prompt optimisé.
            </p>
          </div>

          <div className="space-y-4 md:space-y-5">

            {/* Step 1 — Type */}
            <StepCard n={1} title="Type de site">
              <div className="grid grid-cols-4 gap-2">
                {SITE_TYPES.map(({ label, icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSiteType(label === siteType ? '' : label)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border text-center transition-all ${
                      siteType === label
                        ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                        : 'border-white/5 text-white/40 hover:border-white/15 hover:text-white/70'
                    }`}
                  >
                    <span className="text-xl leading-none">{icon}</span>
                    <span className="text-[10px] md:text-[11px] font-medium leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </StepCard>

            {/* Step 2 — Infos */}
            <StepCard n={2} title="Nom, ville & description">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Nom du projet"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-violet-500/40 focus:outline-none transition-colors"
                  />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ville (optionnel)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-violet-500/40 focus:outline-none transition-colors"
                  />
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décris ton activité, ton style, ce qui te rend unique…"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:border-violet-500/40 focus:outline-none transition-colors resize-none"
                />
              </div>
            </StepCard>

            {/* Step 3 — Style */}
            <StepCard n={3} title="Style visuel">
              <div className="space-y-5">
                <div>
                  <p className="text-xs text-white/40 mb-2.5 font-medium">Thème</p>
                  <div className="grid grid-cols-3 gap-2">
                    {THEMES.map(({ label, desc }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setTheme(label)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-center transition-all ${
                          theme === label
                            ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                            : 'border-white/5 text-white/40 hover:border-white/15 hover:text-white/70'
                        }`}
                      >
                        <span className="text-sm font-semibold">{label}</span>
                        <span className={`text-[10px] ${theme === label ? 'text-violet-400/70' : 'text-white/25'}`}>{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/40 mb-2.5 font-medium">Couleur principale</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {COLOR_PRESETS.map(({ color, name }) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setPrimaryColor(color)}
                        title={name}
                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                          primaryColor === color ? 'border-white scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-white/10 bg-transparent"
                        title="Couleur personnalisée"
                      />
                      <span className="text-xs font-mono text-white/40">{primaryColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/40 mb-2.5 font-medium">Ambiance</p>
                  <div className="flex flex-wrap gap-2">
                    {AMBIANCES.map((a) => (
                      <Pill key={a} active={ambiance === a} onClick={() => setAmbiance(a)}>{a}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>

            {/* Step 4 — Sections */}
            <StepCard n={4} title="Sections à inclure">
              <div className="grid grid-cols-2 gap-1.5">
                {SECTIONS_OPTIONS.map(({ label }) => {
                  const checked = sections.includes(label)
                  return (
                    <label
                      key={label}
                      onClick={() => toggleSection(label)}
                      className="flex items-center gap-2.5 cursor-pointer group py-1.5 px-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${
                        checked ? 'bg-violet-500 border-violet-500' : 'border-white/20 group-hover:border-white/40'
                      }`}>
                        {checked && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span className={`text-xs transition-colors ${checked ? 'text-white' : 'text-white/50 group-hover:text-white/70'}`}>
                        {label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </StepCard>

            {/* Step 5 — Animations */}
            <StepCard n={5} title="Niveau d'animations">
              <div className="space-y-2">
                {ANIM_LEVELS.map(({ label, desc, icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAnimLevel(label)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all ${
                      animLevel === label
                        ? 'bg-violet-500/15 border-violet-500/40'
                        : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-xl leading-none">{icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${animLevel === label ? 'text-white' : 'text-white/60'}`}>{label}</p>
                      <p className={`text-xs mt-0.5 ${animLevel === label ? 'text-violet-400/70' : 'text-white/30'}`}>{desc}</p>
                    </div>
                    {animLevel === label && (
                      <svg className="w-4 h-4 text-violet-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </StepCard>

            {/* Build button */}
            <button
              onClick={handleBuild}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-violet-500/30 text-base flex items-center justify-center gap-2.5"
            >
              <span>🪄</span>
              Générer le prompt
            </button>

            {/* Result */}
            <AnimatePresence>
              {showResult && prompt && (
                <motion.div
                  id="prompt-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-2xl p-5 md:p-6 border border-violet-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-sm font-bold text-white">Ton prompt</span>
                      <span className="text-xs text-white/30">{prompt.length} car.</span>
                    </div>
                  </div>

                  <textarea
                    value={prompt}
                    readOnly
                    rows={8}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 font-mono leading-relaxed resize-none focus:outline-none mb-4"
                  />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCopy}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        copied
                          ? 'bg-green-500/15 border-green-500/40 text-green-400'
                          : 'border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {copied ? '✓ Copié !' : 'Copier le prompt'}
                    </button>
                    <button
                      onClick={handleUse}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold transition-all"
                    >
                      ✦ Utiliser ce prompt
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  )
}
