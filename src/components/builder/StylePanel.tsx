'use client'

import { useState } from 'react'
import { useBuilder } from '@/lib/builder/context'
import type { BlockStyle, BlockAnimation, AnimationType } from '@/lib/builder/types'

const CONTENT_LABEL_MAP: Record<string, string> = {
  title: 'Titre',
  subtitle: 'Sous-titre',
  text: 'Texte',
  cta: 'Bouton CTA',
  href: 'Lien URL',
  logo: 'Logo',
  link1: 'Lien 1',
  link2: 'Lien 2',
  link3: 'Lien 3',
  copyright: 'Copyright',
  image: 'URL image',
  src: 'URL image',
  alt: 'Texte alternatif',
  author: 'Auteur',
  name: 'Nom',
  role: 'Rôle',
  photo: 'URL photo',
  avatar: 'URL avatar',
  url: 'URL vidéo',
  height: 'Hauteur (px)',
  bg: 'Couleur de fond',
  color: 'Couleur du texte',
  left: 'Colonne gauche',
  right: 'Colonne droite',
  col1: 'Colonne 1',
  col2: 'Colonne 2',
  col3: 'Colonne 3',
  price: 'Prix',
  icon: 'Icône',
  email: 'Email',
  phone: 'Téléphone',
  address: 'Adresse',
  submitLabel: 'Label bouton',
}

function labelForKey(key: string): string {
  if (CONTENT_LABEL_MAP[key]) return CONTENT_LABEL_MAP[key]
  // Auto-generate readable label
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/(\d+)/, ' $1')
    .trim()
}

function isLongText(key: string, value: string): boolean {
  return value.length > 60 || key === 'text' || key === 'subtitle' || key.startsWith('col') || key.startsWith('a')
}

type Tab = 'content' | 'style' | 'animation'

export default function StylePanel() {
  const { state, updateContent, updateStyle, updateAnimation } = useBuilder()
  const [tab, setTab] = useState<Tab>('content')

  const selectedBlock = state.blocks.find(b => b.id === state.selectedId)

  if (!selectedBlock) {
    return (
      <aside style={{
        width: 300,
        flexShrink: 0,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        height: '100%',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--fg-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎨</div>
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            Sélectionnez un bloc pour<br />éditer ses propriétés
          </p>
        </div>
      </aside>
    )
  }

  const { id, content, style, animation } = selectedBlock

  return (
    <aside style={{
      width: 300,
      flexShrink: 0,
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {(['content', 'style', 'animation'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t ? 'var(--accent)' : 'var(--fg-muted)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: -1,
              textTransform: 'capitalize',
            }}
          >
            {t === 'content' ? '✏️ Contenu' : t === 'style' ? '🎨 Style' : '✨ Animation'}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'content' && (
          <ContentTab
            content={content}
            onChange={(key, val) => updateContent(id, { [key]: val })}
          />
        )}
        {tab === 'style' && (
          <StyleTab
            style={style}
            onChange={(patch) => updateStyle(id, patch)}
          />
        )}
        {tab === 'animation' && (
          <AnimationTab
            animation={animation}
            onChange={(patch) => updateAnimation(id, patch)}
          />
        )}
      </div>
    </aside>
  )
}

// ─── Content Tab ──────────────────────────────────────────────────────────────
function ContentTab({ content, onChange }: {
  content: Record<string, string>
  onChange: (key: string, val: string) => void
}) {
  const entries = Object.entries(content)
  if (entries.length === 0) {
    return <p style={{ color: 'var(--fg-muted)', fontSize: 13 }}>Aucun contenu configurable.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {entries.map(([key, value]) => (
        <div key={key}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {labelForKey(key)}
          </label>
          {isLongText(key, value) ? (
            <textarea
              value={value}
              onChange={e => onChange(key, e.target.value)}
              rows={4}
              style={inputStyle}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={e => onChange(key, e.target.value)}
              style={inputStyle}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Style Tab ────────────────────────────────────────────────────────────────
function StyleTab({ style: s, onChange }: {
  style: BlockStyle
  onChange: (patch: BlockStyle) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Colors */}
      <Section title="Couleurs">
        <ColorField label="Fond" value={s.background || ''} onChange={v => onChange({ background: v })} />
        <ColorField label="Texte" value={s.color || ''} onChange={v => onChange({ color: v })} />
      </Section>

      {/* Padding */}
      <Section title="Espacement intérieur (padding)">
        <SliderField label="Haut" value={s.paddingTop ?? 0} min={0} max={120} onChange={v => onChange({ paddingTop: v })} />
        <SliderField label="Droite" value={s.paddingRight ?? 0} min={0} max={120} onChange={v => onChange({ paddingRight: v })} />
        <SliderField label="Bas" value={s.paddingBottom ?? 0} min={0} max={120} onChange={v => onChange({ paddingBottom: v })} />
        <SliderField label="Gauche" value={s.paddingLeft ?? 0} min={0} max={120} onChange={v => onChange({ paddingLeft: v })} />
      </Section>

      {/* Margin */}
      <Section title="Marge extérieure (margin)">
        <SliderField label="Haut" value={s.marginTop ?? 0} min={0} max={100} onChange={v => onChange({ marginTop: v })} />
        <SliderField label="Bas" value={s.marginBottom ?? 0} min={0} max={100} onChange={v => onChange({ marginBottom: v })} />
      </Section>

      {/* Typography */}
      <Section title="Typographie">
        <SliderField label="Taille police" value={s.fontSize ?? 16} min={10} max={80} onChange={v => onChange({ fontSize: v })} />
        <SliderField label="Graisse" value={s.fontWeight ?? 400} min={100} max={900} step={100} onChange={v => onChange({ fontWeight: v })} />
        <div>
          <label style={labelStyle}>Alignement</label>
          <select value={s.textAlign || 'left'} onChange={e => onChange({ textAlign: e.target.value as BlockStyle['textAlign'] })} style={selectStyle}>
            <option value="left">Gauche</option>
            <option value="center">Centre</option>
            <option value="right">Droite</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Police</label>
          <select value={s.fontFamily || ''} onChange={e => onChange({ fontFamily: e.target.value })} style={selectStyle}>
            <option value="">Par défaut</option>
            <option value="Georgia,serif">Georgia (serif)</option>
            <option value="'Times New Roman',serif">Times New Roman</option>
            <option value="Arial,sans-serif">Arial</option>
            <option value="'Helvetica Neue',sans-serif">Helvetica Neue</option>
            <option value="'Courier New',monospace">Courier New</option>
          </select>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Apparence">
        <SliderField label="Border radius" value={s.borderRadius ?? 0} min={0} max={50} onChange={v => onChange({ borderRadius: v })} />
        <SliderField label="Opacité (%)" value={s.opacity ?? 100} min={0} max={100} onChange={v => onChange({ opacity: v })} />
        <div>
          <label style={labelStyle}>Ombre</label>
          <select value={s.boxShadow || ''} onChange={e => onChange({ boxShadow: e.target.value })} style={selectStyle}>
            <option value="">Aucune</option>
            <option value="0 1px 2px rgba(0,0,0,0.05)">Légère (sm)</option>
            <option value="0 4px 6px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.06)">Moyenne (md)</option>
            <option value="0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)">Grande (lg)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Largeur</label>
          <input type="text" placeholder="Ex: 100%, 800px" value={s.width || ''} onChange={e => onChange({ width: e.target.value })} style={inputStyle} />
        </div>
      </Section>
    </div>
  )
}

// ─── Animation Tab ────────────────────────────────────────────────────────────
const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'Aucune' },
  { value: 'fadeIn', label: 'Fondu entrant' },
  { value: 'slideUp', label: 'Glissement bas → haut' },
  { value: 'slideLeft', label: 'Glissement droite → gauche' },
  { value: 'slideRight', label: 'Glissement gauche → droite' },
  { value: 'zoomIn', label: 'Zoom entrant' },
  { value: 'bounce', label: 'Rebond' },
]

function AnimationTab({ animation, onChange }: {
  animation: BlockAnimation
  onChange: (patch: Partial<BlockAnimation>) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelStyle}>Type d'animation</label>
        <select
          value={animation.type}
          onChange={e => onChange({ type: e.target.value as AnimationType })}
          style={selectStyle}
        >
          {ANIMATION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {animation.type !== 'none' && (
        <>
          <SliderField
            label={`Durée: ${animation.duration.toFixed(1)}s`}
            value={animation.duration * 10}
            min={2}
            max={20}
            onChange={v => onChange({ duration: v / 10 })}
          />
          <SliderField
            label={`Délai: ${animation.delay.toFixed(1)}s`}
            value={animation.delay * 10}
            min={0}
            max={10}
            onChange={v => onChange({ delay: v / 10 })}
          />
          <div>
            <label style={labelStyle}>Déclencheur</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {(['load', 'scroll'] as const).map(t => (
                <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--fg)' }}>
                  <input
                    type="radio"
                    name="trigger"
                    value={t}
                    checked={animation.trigger === t}
                    onChange={() => onChange({ trigger: t })}
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  {t === 'load' ? 'Au chargement' : 'Au scroll'}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <label style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)}
          style={{ width: 32, height: 28, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="#ffffff"
          style={{ ...inputStyle, width: 90, marginBottom: 0 }} />
      </div>
    </div>
  )
}

function SliderField({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500 }}>{label}</label>
        <span style={{ fontSize: 12, color: 'var(--fg)', fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)' }}
      />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 13,
  background: 'var(--bg)',
  color: 'var(--fg)',
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--fg-muted)',
  marginBottom: 6,
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 13,
  background: 'var(--bg)',
  color: 'var(--fg)',
  outline: 'none',
  cursor: 'pointer',
}
