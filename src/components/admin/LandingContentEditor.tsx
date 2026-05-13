'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface LandingContent {
  banner: { visible: boolean; text: string; buttonText: string }
  hero: { title: string; subtitle: string; buttonText: string; typewriter: string[]; socialProof: string }
  howItWorks: { title: string; steps: Array<{ num: string; title: string; desc: string }> }
  testimonials: Array<{ text: string; name: string; role: string }>
  cta: { title: string; subtitle: string; buttonText: string }
}

const DEFAULT: LandingContent = {
  banner: {
    visible: true,
    text: "🎁 Offre de lancement — 20% de réduction à vie avec votre code de bienvenue",
    buttonText: "En profiter",
  },
  hero: {
    title: "Votre site en quelques mots.",
    subtitle: "Décrivez ce que vous voulez, on s'occupe du reste.",
    buttonText: "Créer →",
    typewriter: [
      "Un restaurant gastronomique à Paris...",
      "Un portfolio pour photographe minimaliste...",
      "Une boutique de bijoux artisanaux...",
      "Un cabinet d'architecte élégant...",
      "Une landing page SaaS qui convertit...",
      "Un blog de voyage et lifestyle...",
    ],
    socialProof: "Plus de 2 800 sites créés ce mois",
  },
  howItWorks: {
    title: "Simple comme bonjour",
    steps: [
      { num: "01", title: "Décrivez", desc: "Tapez ce que vous voulez. Un restaurant, un portfolio, une boutique..." },
      { num: "02", title: "On crée", desc: "Votre site est généré en quelques secondes, complet et professionnel." },
      { num: "03", title: "Vous exportez", desc: "Téléchargez votre site en ZIP. Prêt à mettre en ligne ou à revendre." },
    ],
  },
  testimonials: [
    { text: "Mon site était prêt en quelques secondes. Exactement le rendu que j'avais en tête, sans m'y connaître en technique.", name: "Sophie Martin", role: "Restauratrice" },
    { text: "J'ai généré mon portfolio complet juste en décrivant mon style. Le résultat était vraiment bluffant.", name: "Lucas Bernard", role: "Freelance designer" },
    { text: "Notre landing page convertit mieux que celle faite par notre agence, pour une fraction du prix.", name: "Marie Dubois", role: "Fondatrice startup" },
  ],
  cta: {
    title: "Créez votre premier site maintenant.",
    subtitle: "Gratuit, sans carte bancaire.",
    buttonText: "Commencer gratuitement",
  },
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'white',
  fontSize: 14,
  outline: 'none',
} as const

const textareaStyle = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: 72,
  lineHeight: 1.5,
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: 'rgba(255,255,255,0.4)',
  marginBottom: 6,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-1 h-5 rounded-full bg-violet-400 shrink-0" />
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{children}</h3>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandingContentEditor() {
  const [content, setContent] = useState<LandingContent>(DEFAULT)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/landing-content')
      .then((r) => r.json())
      .then((data) => {
        if (data) setContent(deepMerge(DEFAULT, data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/landing-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      if (!res.ok) throw new Error()
      toast.success('✓ Modifications sauvegardées et en ligne')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setContent(DEFAULT)
    toast('Valeurs par défaut restaurées — cliquez Sauvegarder pour appliquer')
  }

  const set = <K extends keyof LandingContent>(section: K, value: LandingContent[K]) =>
    setContent((c) => ({ ...c, [section]: value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          Modifiez le contenu texte de la landing page. Les changements sont en ligne immédiatement après sauvegarde.
        </p>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
          >
            Réinitialiser par défaut
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: saving ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.8)',
              border: '1px solid rgba(124,58,237,0.5)',
              color: saving ? 'rgba(255,255,255,0.5)' : 'white',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── 1. Bannière promo ── */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <SectionTitle>1. Bannière promo</SectionTitle>

          <Field label="Affichage">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => set('banner', { ...content.banner, visible: !content.banner.visible })}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: content.banner.visible ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <span
                  className="absolute top-0.5 rounded-full w-4 h-4 transition-all"
                  style={{
                    left: content.banner.visible ? 20 : 2,
                    background: content.banner.visible ? 'white' : 'rgba(255,255,255,0.4)',
                  }}
                />
              </div>
              <span style={{ fontSize: 13, color: content.banner.visible ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>
                {content.banner.visible ? 'Visible' : 'Cachée'}
              </span>
            </label>
          </Field>

          <Field label="Texte de la bannière">
            <textarea
              style={textareaStyle}
              value={content.banner.text}
              onChange={(e) => set('banner', { ...content.banner, text: e.target.value })}
            />
          </Field>

          <Field label="Texte du bouton">
            <input
              style={inputStyle}
              value={content.banner.buttonText}
              onChange={(e) => set('banner', { ...content.banner, buttonText: e.target.value })}
            />
          </Field>
        </div>

        {/* ── 2. Hero ── */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <SectionTitle>2. Hero</SectionTitle>

          <Field label="Titre principal">
            <input
              style={inputStyle}
              value={content.hero.title}
              onChange={(e) => set('hero', { ...content.hero, title: e.target.value })}
            />
          </Field>

          <Field label="Sous-titre">
            <input
              style={inputStyle}
              value={content.hero.subtitle}
              onChange={(e) => set('hero', { ...content.hero, subtitle: e.target.value })}
            />
          </Field>

          <Field label='Texte du bouton "Créer"'>
            <input
              style={inputStyle}
              value={content.hero.buttonText}
              onChange={(e) => set('hero', { ...content.hero, buttonText: e.target.value })}
            />
          </Field>

          <Field label="Phrases du typewriter (une par ligne)">
            <textarea
              style={{ ...textareaStyle, minHeight: 140, fontFamily: 'monospace' }}
              value={content.hero.typewriter.join('\n')}
              onChange={(e) =>
                set('hero', { ...content.hero, typewriter: e.target.value.split('\n') })
              }
            />
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>
              Une phrase par ligne — max 6 recommandé
            </p>
          </Field>

          <Field label="Social proof">
            <input
              style={inputStyle}
              value={content.hero.socialProof}
              onChange={(e) => set('hero', { ...content.hero, socialProof: e.target.value })}
            />
          </Field>
        </div>

        {/* ── 3. Comment ça marche ── */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <SectionTitle>3. Section "Comment ça marche"</SectionTitle>

          <Field label="Titre de la section">
            <input
              style={inputStyle}
              value={content.howItWorks.title}
              onChange={(e) => set('howItWorks', { ...content.howItWorks, title: e.target.value })}
            />
          </Field>

          {content.howItWorks.steps.map((step, i) => (
            <div key={i} style={{ marginBottom: 20, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>ÉTAPE {step.num}</p>
              <Field label="Titre">
                <input
                  style={inputStyle}
                  value={step.title}
                  onChange={(e) => {
                    const steps = [...content.howItWorks.steps]
                    steps[i] = { ...step, title: e.target.value }
                    set('howItWorks', { ...content.howItWorks, steps })
                  }}
                />
              </Field>
              <Field label="Description">
                <textarea
                  style={textareaStyle}
                  value={step.desc}
                  onChange={(e) => {
                    const steps = [...content.howItWorks.steps]
                    steps[i] = { ...step, desc: e.target.value }
                    set('howItWorks', { ...content.howItWorks, steps })
                  }}
                />
              </Field>
            </div>
          ))}
        </div>

        {/* ── 4. Témoignages ── */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <SectionTitle>4. Témoignages</SectionTitle>

          {content.testimonials.map((t, i) => (
            <div key={i} style={{ marginBottom: 20, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 12 }}>TÉMOIGNAGE {i + 1}</p>
              <Field label="Citation">
                <textarea
                  style={textareaStyle}
                  value={t.text}
                  onChange={(e) => {
                    const testimonials = [...content.testimonials]
                    testimonials[i] = { ...t, text: e.target.value }
                    set('testimonials', testimonials)
                  }}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nom">
                  <input
                    style={inputStyle}
                    value={t.name}
                    onChange={(e) => {
                      const testimonials = [...content.testimonials]
                      testimonials[i] = { ...t, name: e.target.value }
                      set('testimonials', testimonials)
                    }}
                  />
                </Field>
                <Field label="Rôle">
                  <input
                    style={inputStyle}
                    value={t.role}
                    onChange={(e) => {
                      const testimonials = [...content.testimonials]
                      testimonials[i] = { ...t, role: e.target.value }
                      set('testimonials', testimonials)
                    }}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>

        {/* ── 5. CTA final ── */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <SectionTitle>5. Section CTA finale</SectionTitle>

          <Field label="Titre">
            <input
              style={inputStyle}
              value={content.cta.title}
              onChange={(e) => set('cta', { ...content.cta, title: e.target.value })}
            />
          </Field>

          <Field label="Sous-titre">
            <input
              style={inputStyle}
              value={content.cta.subtitle}
              onChange={(e) => set('cta', { ...content.cta, subtitle: e.target.value })}
            />
          </Field>

          <Field label="Texte du bouton">
            <input
              style={inputStyle}
              value={content.cta.buttonText}
              onChange={(e) => set('cta', { ...content.cta, buttonText: e.target.value })}
            />
          </Field>
        </div>

      </div>

      {/* Bottom save button */}
      <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-white/5">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
        >
          Réinitialiser par défaut
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: saving ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.8)',
            border: '1px solid rgba(124,58,237,0.5)',
            color: saving ? 'rgba(255,255,255,0.5)' : 'white',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(defaults: any, overrides: any): any {
  if (typeof defaults !== 'object' || defaults === null) return overrides ?? defaults
  const result = { ...defaults }
  for (const key in overrides) {
    if (overrides[key] !== undefined && overrides[key] !== null) {
      if (Array.isArray(overrides[key])) {
        result[key] = overrides[key]
      } else if (typeof overrides[key] === 'object') {
        result[key] = deepMerge(defaults[key], overrides[key])
      } else {
        result[key] = overrides[key]
      }
    }
  }
  return result
}
