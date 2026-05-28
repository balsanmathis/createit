'use client'

import { useState, useEffect, useRef } from 'react'
import { useBuilder } from '@/lib/builder/context'
import { useMobile } from '@/lib/builder/use-mobile'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import ImageUploader from './ImageUploader'
import type { BlockStyle, BlockAnimation, AnimationType, HoverEffect } from '@/lib/builder/types'

const IMAGE_KEYS = new Set(['image', 'src', 'photo', 'avatar'])
const BOOL_KEYS = new Set(['autoplay', 'muted', 'loop', 'controls'])
const URL_KEYS = new Set(['href', 'href1', 'href2', 'url', 'ctaHref', 'link1Href', 'link2Href', 'link3Href'])

function isUrlKey(key: string) {
  return URL_KEYS.has(key) || key.endsWith('Href') || key.endsWith('href')
}
function isTargetKey(key: string) {
  return key.endsWith('Target') && isUrlKey(key.slice(0, -6))
}

const CONTENT_LABEL_MAP: Record<string, string> = {
  title: 'Titre', subtitle: 'Sous-titre', text: 'Texte', cta: 'Bouton CTA',
  href: 'Lien URL', href1: 'Bouton 1 — Lien', href2: 'Bouton 2 — Lien',
  ctaHref: 'Bouton CTA — Lien',
  logo: 'Logo', link1: 'Lien 1', link2: 'Lien 2', link3: 'Lien 3',
  link1Href: 'Lien 1 — URL', link2Href: 'Lien 2 — URL', link3Href: 'Lien 3 — URL',
  copyright: 'Copyright', image: 'Image', src: 'Image', alt: 'Texte alternatif',
  author: 'Auteur', name: 'Nom', role: 'Rôle', photo: 'Photo', avatar: 'Avatar',
  url: 'URL', height: 'Hauteur (px)', bg: 'Couleur fond', color: 'Couleur texte',
  left: 'Colonne gauche', right: 'Colonne droite',
  col1: 'Colonne 1', col2: 'Colonne 2', col3: 'Colonne 3',
  price: 'Prix', icon: 'Icône', email: 'Email', phone: 'Téléphone', address: 'Adresse',
  submitLabel: 'Label bouton', html: 'HTML', autoplay: 'Autoplay', muted: 'Muet',
  loop: 'Boucle', controls: 'Contrôles', ratio: 'Format vidéo',
}

function labelForKey(key: string): string {
  if (CONTENT_LABEL_MAP[key]) return CONTENT_LABEL_MAP[key]
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/(\d+)/, ' $1').trim()
}

function isLongText(key: string, value: string): boolean {
  return (
    value.length > 60 || key === 'text' || key === 'subtitle' || key === 'html' ||
    key.startsWith('col') || key === 'left' || key === 'right' || key === 'address'
  )
}

const ANIMATION_OPTIONS: { value: AnimationType; label: string; group: string }[] = [
  { value: 'none', label: 'Aucune', group: '' },
  { value: 'fadeIn', label: 'Fondu', group: 'Entrée' },
  { value: 'fadeInDown', label: 'Fondu ↓', group: 'Entrée' },
  { value: 'fadeInLeft', label: 'Fondu ←', group: 'Entrée' },
  { value: 'fadeInRight', label: 'Fondu →', group: 'Entrée' },
  { value: 'slideUp', label: 'Glissement ↑', group: 'Entrée' },
  { value: 'slideLeft', label: 'Glissement ←', group: 'Entrée' },
  { value: 'slideRight', label: 'Glissement →', group: 'Entrée' },
  { value: 'zoomIn', label: 'Zoom entrant', group: 'Entrée' },
  { value: 'zoomOut', label: 'Zoom sortant', group: 'Entrée' },
  { value: 'flipX', label: 'Flip horizontal', group: 'Entrée' },
  { value: 'flipY', label: 'Flip vertical', group: 'Entrée' },
  { value: 'bounce', label: 'Rebond', group: 'Attention' },
  { value: 'swing', label: 'Balancement', group: 'Attention' },
  { value: 'shake', label: 'Secousse', group: 'Attention' },
  { value: 'pulse', label: 'Pulsation', group: 'Attention' },
  { value: 'heartbeat', label: 'Battement', group: 'Attention' },
  { value: 'rubberBand', label: 'Élastique', group: 'Attention' },
  { value: 'tada', label: 'Tada !', group: 'Attention' },
  { value: 'float', label: 'Flottement', group: 'Continu' },
  { value: 'spin', label: 'Rotation', group: 'Continu' },
  { value: 'ping', label: 'Ping', group: 'Continu' },
  { value: 'shimmer', label: 'Shimmer', group: 'Continu' },
]

const HOVER_OPTIONS: { value: HoverEffect; label: string }[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'lift', label: '⬆ Lever' },
  { value: 'grow', label: '↔ Agrandir' },
  { value: 'shrink', label: '↕ Réduire' },
  { value: 'glow', label: '✨ Halo' },
  { value: 'tilt', label: '↗ Inclinaison' },
  { value: 'underline', label: '— Souligner' },
]

type Tab = 'content' | 'style' | 'animation'

const TEXT_TYPES = new Set(['heading-h1', 'heading-h2', 'paragraph', 'quote', 'badge'])
const IMAGE_TYPES = new Set(['image-simple', 'gallery-2col', 'gallery-3col'])

// ─── StylePanel ───────────────────────────────────────────────────────────────
export default function StylePanel({ mobileOpen = false, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const { state, updateContent, updateStyle, updateAnimation } = useBuilder()
  const isMobile = useMobile()
  const [tab, setTab] = useState<Tab>('content')

  // Auto-open on mobile when block is selected
  const prevSelectedRef = useRef<string | null>(null)
  useEffect(() => {
    prevSelectedRef.current = state.selectedId
  })

  const selectedBlock = state.blocks.find(b => b.id === state.selectedId)
  const def = selectedBlock ? BLOCK_DEFS.find(d => d.type === selectedBlock.type) : null

  const emptyState = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎨</div>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Sélectionnez un bloc<br />pour éditer ses propriétés</p>
      </div>
    </div>
  )

  const panelContent = selectedBlock ? (
    <>
      {/* Block name + tabs */}
      <div style={{ flexShrink: 0, borderBottom: '1px solid #e2e8f0', padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#18181b' }}>
            {def?.icon} {def?.label || selectedBlock.type}
          </div>
          {isMobile === true && (
            <button onClick={onMobileClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          )}
        </div>
        <div style={{ display: 'flex' }}>
          {(['content', 'style', 'animation'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '6px 0', background: 'none', border: 'none',
              borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
              color: tab === t ? '#2563eb' : '#94a3b8',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', marginBottom: -1,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {t === 'content' ? 'Contenu' : t === 'style' ? 'Style' : 'Animation'}
            </button>
          ))}
        </div>
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'content' && (
          <ContentTab
            content={selectedBlock.content}
            onChange={(key, val) => updateContent(selectedBlock.id, { [key]: val })}
          />
        )}
        {tab === 'style' && (
          <StyleTab
            style={selectedBlock.style}
            blockType={selectedBlock.type}
            onChange={(patch) => updateStyle(selectedBlock.id, patch)}
          />
        )}
        {tab === 'animation' && (
          <AnimationTab animation={selectedBlock.animation} onChange={(patch) => updateAnimation(selectedBlock.id, patch)} />
        )}
      </div>
    </>
  ) : emptyState

  // ── Mobile bottom sheet ────────────────────────────────────────────────────
  if (isMobile === true) {
    return (
      <>
        {mobileOpen && (
          <div
            onClick={onMobileClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99, touchAction: 'none' }}
          />
        )}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: '78vh',
          background: '#fff',
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          zIndex: 100,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(105%)',
          transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
            <div style={{ width: 40, height: 4, background: '#d1d5db', borderRadius: 2 }} />
          </div>
          {panelContent}
        </div>
      </>
    )
  }

  // ── Desktop ────────────────────────────────────────────────────────────────
  return (
    <aside style={{ width: 300, flexShrink: 0, background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {panelContent}
    </aside>
  )
}

// ─── Content Tab ──────────────────────────────────────────────────────────────
function ContentTab({ content, onChange }: {
  content: Record<string, string>
  onChange: (key: string, val: string) => void
}) {
  const entries = Object.entries(content).filter(([key]) => !isTargetKey(key))
  if (entries.length === 0) {
    return <div style={{ padding: 16 }}><p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>Aucun contenu configurable.</p></div>
  }

  function normalizeUrl(val: string): string {
    const v = val.trim()
    if (!v || v.startsWith('#') || v.startsWith('/') || v.startsWith('http') || v.startsWith('mailto:') || v.startsWith('tel:')) return v
    return `https://${v}`
  }

  return (
    <div>
      {entries.map(([key, value]) => (
        <div key={key} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <label style={labelSt}>{labelForKey(key)}</label>

          {IMAGE_KEYS.has(key) ? (
            <ImageUploader value={value} onChange={v => onChange(key, v)} />
          ) : BOOL_KEYS.has(key) ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={value === 'true'}
                onChange={e => onChange(key, e.target.checked ? 'true' : 'false')}
                style={{ accentColor: '#2563eb', width: 14, height: 14 }}
              />
              <span style={{ fontSize: 12, color: '#374151' }}>{value === 'true' ? 'Activé' : 'Désactivé'}</span>
            </label>
          ) : key === 'ratio' ? (
            <select value={value} onChange={e => onChange(key, e.target.value)} style={selectSt}>
              <option value="16/9">16:9 (YouTube)</option>
              <option value="4/3">4:3 (Standard)</option>
              <option value="1/1">1:1 (Carré)</option>
              <option value="9/16">9:16 (Vertical)</option>
            </select>
          ) : key === 'html' ? (
            <textarea
              value={value}
              onChange={e => onChange(key, e.target.value)}
              rows={8}
              style={{ ...textareaSt, fontFamily: 'monospace', fontSize: 11 }}
            />
          ) : isUrlKey(key) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 14, paddingLeft: 8, color: '#7c3aed', flexShrink: 0 }}>🔗</span>
                <input
                  type="text"
                  value={value}
                  onChange={e => onChange(key, e.target.value)}
                  onBlur={e => {
                    const normalized = normalizeUrl(e.target.value)
                    if (normalized !== e.target.value) onChange(key, normalized)
                  }}
                  placeholder="https://… ou #section-id"
                  style={{ ...inputSt, flex: 1 }}
                />
              </div>
              {/* URL preview + test link */}
              {value && value !== '#' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontSize: 10, color: '#7c3aed', margin: 0, flex: 1, wordBreak: 'break-all', lineHeight: 1.4 }}>
                    → {value}
                  </p>
                  <button
                    onClick={() => window.open(value, '_blank', 'noopener')}
                    style={{ fontSize: 10, padding: '3px 8px', border: '1px solid #7c3aed', borderRadius: 4, cursor: 'pointer', background: '#faf5ff', color: '#7c3aed', fontWeight: 600, flexShrink: 0 }}
                  >
                    Tester →
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontSize: 11, color: '#64748b' }}>
                  <input
                    type="checkbox"
                    checked={content[key + 'Target'] === '_blank'}
                    onChange={e => onChange(key + 'Target', e.target.checked ? '_blank' : '')}
                    style={{ accentColor: '#7c3aed', width: 12, height: 12 }}
                  />
                  Nouvel onglet
                </label>
                {['#', 'https://', 'mailto:', 'tel:'].map(pfx => (
                  <button
                    key={pfx}
                    onClick={() => { if (!value || value === '#') onChange(key, pfx) }}
                    style={{ fontSize: 10, padding: '2px 6px', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', background: value.startsWith(pfx) ? '#eff6ff' : '#fff', color: value.startsWith(pfx) ? '#2563eb' : '#64748b' }}
                  >{pfx}</button>
                ))}
              </div>
            </div>
          ) : isLongText(key, value) ? (
            <textarea value={value} onChange={e => onChange(key, e.target.value)} rows={3} style={textareaSt} />
          ) : (
            <input type="text" value={value} onChange={e => onChange(key, e.target.value)} style={inputSt} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Style Tab ────────────────────────────────────────────────────────────────
function StyleTab({ style: s, blockType, onChange }: { style: BlockStyle; blockType: string; onChange: (p: BlockStyle) => void }) {
  const isImageBlock = IMAGE_TYPES.has(blockType)
  const isTextBlock = TEXT_TYPES.has(blockType)

  return (
    <div>
      <Section title="Couleurs de fond">
        {!s.gradientEnabled && (
          <ColorRow label="Couleur de fond" value={s.background || ''} onChange={v => onChange({ background: v })} />
        )}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={!!s.gradientEnabled}
              onChange={e => onChange({ gradientEnabled: e.target.checked })}
              style={{ accentColor: '#7c3aed', width: 14, height: 14 }}
            />
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>Dégradé</span>
          </label>
          {s.gradientEnabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 22 }}>
              <ColorRow label="Couleur 1" value={s.gradientColor1 || '#7c3aed'} onChange={v => onChange({ gradientColor1: v })} />
              <ColorRow label="Couleur 2" value={s.gradientColor2 || '#4f46e5'} onChange={v => onChange({ gradientColor2: v })} />
              <SliderRow label={`Angle : ${s.gradientAngle ?? 135}°`} value={s.gradientAngle ?? 135} min={0} max={360} onChange={v => onChange({ gradientAngle: v })} />
            </div>
          )}
        </div>
      </Section>

      <Section title="Couleur du texte">
        <ColorRow label="Texte" value={s.color || ''} onChange={v => onChange({ color: v })} />
        {isTextBlock && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!s.textHighlight}
              onChange={e => onChange({ textHighlight: e.target.checked, background: e.target.checked ? (s.background || '#fef3c7') : s.background })}
              style={{ accentColor: '#7c3aed', width: 14, height: 14 }}
            />
            <span style={{ fontSize: 12, color: '#374151' }}>Texte sur fond coloré (highlight)</span>
          </label>
        )}
      </Section>

      {isImageBlock && (
        <Section title="Superposition image">
          <ColorRow label="Couleur overlay" value={s.overlayColor || ''} onChange={v => onChange({ overlayColor: v || undefined })} />
          {s.overlayColor && (
            <SliderRow label={`Opacité overlay : ${s.overlayOpacity ?? 50}%`} value={s.overlayOpacity ?? 50} min={0} max={80} onChange={v => onChange({ overlayOpacity: v })} />
          )}
        </Section>
      )}

      <Section title="Dimensions">
        <div>
          <label style={labelSt}>Largeur</label>
          <input type="text" placeholder="100%, 800px…" value={s.width || ''} onChange={e => onChange({ width: e.target.value })} style={inputSt} />
        </div>
        <div>
          <label style={labelSt}>Hauteur min</label>
          <input type="text" placeholder="400px, auto…" value={s.minHeight || ''} onChange={e => onChange({ minHeight: e.target.value })} style={inputSt} />
        </div>
      </Section>

      <Section title="Espacement">
        <SliderRow label="Padding haut" value={s.paddingTop ?? 0} min={0} max={120} onChange={v => onChange({ paddingTop: v })} />
        <SliderRow label="Padding droite" value={s.paddingRight ?? 0} min={0} max={120} onChange={v => onChange({ paddingRight: v })} />
        <SliderRow label="Padding bas" value={s.paddingBottom ?? 0} min={0} max={120} onChange={v => onChange({ paddingBottom: v })} />
        <SliderRow label="Padding gauche" value={s.paddingLeft ?? 0} min={0} max={120} onChange={v => onChange({ paddingLeft: v })} />
        <SliderRow label="Marge haut" value={s.marginTop ?? 0} min={0} max={100} onChange={v => onChange({ marginTop: v })} />
        <SliderRow label="Marge bas" value={s.marginBottom ?? 0} min={0} max={100} onChange={v => onChange({ marginBottom: v })} />
      </Section>

      <Section title="Typographie">
        <SliderRow label="Taille police" value={s.fontSize ?? 16} min={10} max={80} onChange={v => onChange({ fontSize: v })} />
        <SliderRow label="Graisse" value={s.fontWeight ?? 400} min={100} max={900} step={100} onChange={v => onChange({ fontWeight: v })} />
        <div>
          <label style={labelSt}>Alignement</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['left', 'center', 'right'] as const).map(a => (
              <button key={a} onClick={() => onChange({ textAlign: a })} style={{
                flex: 1, height: 32,
                border: `1px solid ${s.textAlign === a ? '#2563eb' : '#e2e8f0'}`,
                background: s.textAlign === a ? '#eff6ff' : '#fff',
                borderRadius: 5, cursor: 'pointer', fontSize: 14,
                color: s.textAlign === a ? '#2563eb' : '#64748b',
              }}>
                {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelSt}>Police</label>
          <select value={s.fontFamily || ''} onChange={e => onChange({ fontFamily: e.target.value })} style={selectSt}>
            <option value="">Par défaut</option>
            <option value="Georgia,serif">Georgia</option>
            <option value="'Times New Roman',serif">Times New Roman</option>
            <option value="Arial,sans-serif">Arial</option>
            <option value="'Helvetica Neue',sans-serif">Helvetica Neue</option>
            <option value="'Courier New',monospace">Courier New</option>
            <option value="'Playfair Display',serif">Playfair Display</option>
            <option value="'Montserrat',sans-serif">Montserrat</option>
          </select>
        </div>
      </Section>

      <Section title="Apparence">
        <SliderRow label="Border radius" value={s.borderRadius ?? 0} min={0} max={50} onChange={v => onChange({ borderRadius: v })} />
        <SliderRow label="Opacité" value={s.opacity ?? 100} min={0} max={100} onChange={v => onChange({ opacity: v })} />
        <div>
          <label style={labelSt}>Ombre</label>
          <select value={s.boxShadow || ''} onChange={e => onChange({ boxShadow: e.target.value })} style={selectSt}>
            <option value="">Aucune</option>
            <option value="0 1px 2px rgba(0,0,0,0.05)">Légère</option>
            <option value="0 4px 6px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.06)">Moyenne</option>
            <option value="0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)">Grande</option>
            <option value="0 25px 50px rgba(0,0,0,0.15)">XL</option>
          </select>
        </div>
      </Section>

      <Section title="Lien interne (ancre)">
        <div>
          <label style={labelSt}>ID de section</label>
          <input
            type="text"
            value={s.anchor || ''}
            onChange={e => onChange({ anchor: e.target.value.replace(/[^a-z0-9_-]/gi, '-').toLowerCase() || undefined })}
            placeholder="ex: services, contact…"
            style={inputSt}
          />
          {s.anchor && (
            <p style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>
              Lien : <code style={{ background: '#eff6ff', padding: '1px 4px', borderRadius: 3 }}>#{s.anchor}</code>
            </p>
          )}
          <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
            Permet à un bouton de pointer vers cette section avec <code>#identifiant</code>.
          </p>
        </div>
      </Section>
    </div>
  )
}

// ─── Animation Tab ────────────────────────────────────────────────────────────
function AnimationTab({ animation, onChange }: {
  animation: BlockAnimation
  onChange: (p: Partial<BlockAnimation>) => void
}) {
  return (
    <div>
      <Section title="Animation d'entrée">
        <div>
          <label style={labelSt}>Type</label>
          <select value={animation.type} onChange={e => onChange({ type: e.target.value as AnimationType })} style={selectSt}>
            <option value="none">Aucune</option>
            <optgroup label="Entrée">
              {ANIMATION_OPTIONS.filter(o => o.group === 'Entrée').map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
            <optgroup label="Attention">
              {ANIMATION_OPTIONS.filter(o => o.group === 'Attention').map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
            <optgroup label="Continu">
              {ANIMATION_OPTIONS.filter(o => o.group === 'Continu').map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        {animation.type !== 'none' && (
          <>
            <SliderRow label={`Durée : ${animation.duration.toFixed(1)}s`} value={Math.round(animation.duration * 10)} min={2} max={20} onChange={v => onChange({ duration: v / 10 })} />
            <SliderRow label={`Délai : ${animation.delay.toFixed(1)}s`} value={Math.round(animation.delay * 10)} min={0} max={10} onChange={v => onChange({ delay: v / 10 })} />
            <div>
              <label style={labelSt}>Déclencheur</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['load', 'scroll'] as const).map(t => (
                  <button key={t} onClick={() => onChange({ trigger: t })} style={{
                    flex: 1, height: 32,
                    border: `1px solid ${animation.trigger === t ? '#2563eb' : '#e2e8f0'}`,
                    background: animation.trigger === t ? '#eff6ff' : '#fff',
                    borderRadius: 5, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                    color: animation.trigger === t ? '#2563eb' : '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {t === 'load' ? 'Chargement' : 'Scroll'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </Section>

      <Section title="Effet au survol">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {HOVER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => onChange({ hover: opt.value })} style={{
              height: 32, border: `1px solid ${animation.hover === opt.value ? '#2563eb' : '#e2e8f0'}`,
              background: animation.hover === opt.value ? '#eff6ff' : '#fff',
              borderRadius: 5, cursor: 'pointer', fontSize: 11,
              color: animation.hover === opt.value ? '#2563eb' : '#64748b',
              fontWeight: animation.hover === opt.value ? 600 : 400,
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '1px solid #f1f5f9', padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: '#374151' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: value || '#fff', border: '1px solid #e2e8f0' }} />
          <input
            type="color"
            value={value || '#ffffff'}
            onChange={e => onChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#ffffff"
          style={{ ...inputSt, width: 80 }}
        />
      </div>
    </div>
  )
}

function SliderRow({ label, value, min, max, step = 1, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#18181b' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputSt: React.CSSProperties = {
  width: '100%', height: 32, padding: '0 10px',
  border: '1px solid #e2e8f0', borderRadius: 5,
  fontSize: 13, background: '#fff', color: '#18181b',
  outline: 'none', boxSizing: 'border-box',
}

const textareaSt: React.CSSProperties = {
  width: '100%', padding: '8px 10px',
  border: '1px solid #e2e8f0', borderRadius: 5,
  fontSize: 13, background: '#fff', color: '#18181b',
  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
  lineHeight: 1.5,
}

const selectSt: React.CSSProperties = {
  width: '100%', height: 32, padding: '0 8px',
  border: '1px solid #e2e8f0', borderRadius: 5,
  fontSize: 13, background: '#fff', color: '#18181b',
  outline: 'none', cursor: 'pointer',
}

const labelSt: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#94a3b8', textTransform: 'uppercase',
  letterSpacing: '0.08em', marginBottom: 4,
}
