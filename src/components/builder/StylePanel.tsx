'use client'

import { useState, useRef } from 'react'
import { useBuilder } from '@/lib/builder/context'
import { useMobile } from '@/lib/builder/use-mobile'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import ImageUploader from './ImageUploader'
import type { BlockStyle, BlockAnimation, AnimationType, HoverEffect } from '@/lib/builder/types'

const IMAGE_KEYS = new Set(['image', 'src', 'photo', 'avatar', 'img1', 'img2', 'img3', 'img4', 'img5', 'img6', 'img7', 'img8'])
const BOOL_KEYS = new Set(['autoplay', 'muted', 'loop', 'controls'])
const URL_KEYS = new Set(['href', 'href1', 'href2', 'url', 'ctaHref', 'link1Href', 'link2Href', 'link3Href'])

function isUrlKey(k: string) { return URL_KEYS.has(k) || k.endsWith('Href') || k.endsWith('href') }
function isTargetKey(k: string) { return k.endsWith('Target') && isUrlKey(k.slice(0, -6)) }

const LABEL: Record<string, string> = {
  title: 'Titre', subtitle: 'Sous-titre', text: 'Texte', cta: 'Bouton',
  href: 'Lien', href1: 'Lien 1', href2: 'Lien 2', ctaHref: 'Lien bouton',
  img1: 'Image 1', img2: 'Image 2', img3: 'Image 3', img4: 'Image 4', img5: 'Image 5', img6: 'Image 6', img7: 'Image 7', img8: 'Image 8',
  logo: 'Logo', link1: 'Lien 1', link2: 'Lien 2', link3: 'Lien 3',
  link1Href: 'URL 1', link2Href: 'URL 2', link3Href: 'URL 3',
  copyright: 'Copyright', image: 'Image', src: 'Image', alt: 'Texte alt',
  author: 'Auteur', name: 'Nom', role: 'Rôle', photo: 'Photo', avatar: 'Avatar',
  url: 'URL', height: 'Hauteur (px)', bg: 'Fond', color: 'Couleur',
  left: 'Colonne gauche', right: 'Colonne droite',
  col1: 'Colonne 1', col2: 'Colonne 2', col3: 'Colonne 3',
  price: 'Prix', icon: 'Icône', email: 'Email', phone: 'Téléphone', address: 'Adresse',
  submitLabel: 'Label bouton', html: 'HTML', autoplay: 'Autoplay', muted: 'Muet',
  loop: 'Boucle', controls: 'Contrôles', ratio: 'Format',
}

function labelFor(key: string) {
  return LABEL[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).replace(/(\d+)/, ' $1').trim()
}

function isLong(key: string, val: string) {
  return val.length > 60 || ['text','subtitle','html','left','right','address'].includes(key) || key.startsWith('col')
}

function normalizeUrl(v: string) {
  const t = v.trim()
  if (!t || t.startsWith('#') || t.startsWith('/') || t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t
  return `https://${t}`
}

type Tab = 'content' | 'style' | 'animation'
const IMAGE_TYPES = new Set(['image-simple', 'gallery-2col', 'gallery-3col', 'gallery-4col'])
const TEXT_TYPES = new Set(['heading-h1', 'heading-h2', 'paragraph', 'quote', 'badge'])

const ANIM_OPTS: { value: AnimationType; label: string; group: string }[] = [
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
  { value: 'bounce', label: 'Rebond', group: 'Attention' },
  { value: 'shake', label: 'Secousse', group: 'Attention' },
  { value: 'pulse', label: 'Pulsation', group: 'Attention' },
  { value: 'float', label: 'Flottement', group: 'Continu' },
  { value: 'spin', label: 'Rotation', group: 'Continu' },
  { value: 'shimmer', label: 'Shimmer', group: 'Continu' },
]

const HOVER_OPTS: { value: HoverEffect; label: string }[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'lift', label: '⬆ Lever' },
  { value: 'grow', label: '↔ Grandir' },
  { value: 'shrink', label: '↕ Réduire' },
  { value: 'glow', label: '✨ Halo' },
  { value: 'tilt', label: '↗ Inclinaison' },
  { value: 'underline', label: '— Souligner' },
]

// ─── StylePanel ────────────────────────────────────────────────────────────────
export default function StylePanel({ mobileOpen = false, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void }) {
  const { state, updateContent, updateStyle, updateAnimation } = useBuilder()
  const isMobile = useMobile()
  const [tab, setTab] = useState<Tab>('content')

  const selectedBlock = state.blocks.find(b => b.id === state.selectedId)
  const def = selectedBlock ? BLOCK_DEFS.find(d => d.type === selectedBlock.type) : null

  const emptyState = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 32, gap: 12 }}>
      <div style={{ width: 56, height: 56, background: '#f3e8ff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎨</div>
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
        Cliquez sur un bloc<br />pour modifier son style
      </p>
    </div>
  )

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'content', icon: '✏️', label: 'Contenu' },
    { key: 'style', icon: '🎨', label: 'Style' },
    { key: 'animation', icon: '✨', label: 'Anim.' },
  ]

  const panelContent = selectedBlock ? (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Block type header */}
      <div style={{ padding: '14px 16px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
              {def?.icon || '📦'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{def?.label || selectedBlock.type}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Bloc sélectionné</div>
            </div>
          </div>
          {isMobile === true && (
            <button onClick={onMobileClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#94a3b8', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '7px 4px',
                background: tab === t.key ? '#7c3aed' : '#fff',
                border: `1px solid ${tab === t.key ? '#7c3aed' : '#e2e8f0'}`,
                borderRadius: 8, cursor: 'pointer',
                fontSize: 11, fontWeight: 600,
                color: tab === t.key ? '#fff' : '#64748b',
                transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}
            >
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {tab === 'content' && (
          <ContentTab
            content={selectedBlock.content}
            onChange={(k, v) => updateContent(selectedBlock.id, { [k]: v })}
          />
        )}
        {tab === 'style' && (
          <StyleTab
            style={selectedBlock.style}
            blockType={selectedBlock.type}
            onChange={patch => updateStyle(selectedBlock.id, patch)}
          />
        )}
        {tab === 'animation' && (
          <AnimationTab animation={selectedBlock.animation} onChange={patch => updateAnimation(selectedBlock.id, patch)} />
        )}
      </div>
    </div>
  ) : emptyState

  if (isMobile === true) {
    return (
      <>
        {mobileOpen && (
          <div onClick={onMobileClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99, touchAction: 'none' }} />
        )}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: '78vh',
          background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
          zIndex: 100,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(105%)',
          transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
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

  return (
    <aside style={{ width: 300, flexShrink: 0, background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {panelContent}
    </aside>
  )
}

// ─── Content Tab ──────────────────────────────────────────────────────────────
function ContentTab({ content, onChange }: { content: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const entries = Object.entries(content).filter(([k]) => !isTargetKey(k))
  if (!entries.length) return <div style={{ padding: 20 }}><p style={{ color: '#94a3b8', fontSize: 13 }}>Aucun contenu configurable.</p></div>

  return (
    <div style={{ padding: '4px 0 24px' }}>
      {entries.map(([key, value]) => (
        <div key={key} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <label style={lbSt}>{labelFor(key)}</label>

          {IMAGE_KEYS.has(key) ? (
            <ImageUploader value={value} onChange={v => onChange(key, v)} />

          ) : BOOL_KEYS.has(key) ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={value === 'true'}
                onChange={e => onChange(key, e.target.checked ? 'true' : 'false')}
                style={{ accentColor: '#7c3aed', width: 16, height: 16 }}
              />
              <span style={{ fontSize: 13, color: '#374151' }}>{value === 'true' ? 'Activé' : 'Désactivé'}</span>
            </label>

          ) : key === 'ratio' ? (
            <select value={value} onChange={e => onChange(key, e.target.value)} style={slSt}>
              <option value="16/9">16:9 (YouTube)</option>
              <option value="4/3">4:3</option>
              <option value="1/1">1:1 Carré</option>
              <option value="9/16">9:16 Vertical</option>
            </select>

          ) : key === 'html' ? (
            <textarea value={value} onChange={e => onChange(key, e.target.value)} rows={8} style={{ ...taSt, fontFamily: 'monospace', fontSize: 11 }} />

          ) : isUrlKey(key) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 16, color: '#7c3aed' }}>🔗</span>
                <input
                  type="text" value={value}
                  onChange={e => onChange(key, e.target.value)}
                  onBlur={e => { const n = normalizeUrl(e.target.value); if (n !== e.target.value) onChange(key, n) }}
                  placeholder="https://… ou #ancre"
                  style={{ ...inSt, flex: 1 }}
                />
              </div>
              {value && value !== '#' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#7c3aed', flex: 1, wordBreak: 'break-all' }}>→ {value}</span>
                  <button onClick={() => window.open(value, '_blank', 'noopener')} style={{ fontSize: 11, padding: '3px 8px', border: '1px solid #7c3aed', borderRadius: 4, cursor: 'pointer', background: '#faf5ff', color: '#7c3aed', fontWeight: 600, flexShrink: 0 }}>Tester →</button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, color: '#64748b' }}>
                  <input type="checkbox" checked={content[key + 'Target'] === '_blank'} onChange={e => onChange(key + 'Target', e.target.checked ? '_blank' : '')} style={{ accentColor: '#7c3aed' }} />
                  Nouvel onglet
                </label>
                {['#', 'https://', 'mailto:', 'tel:'].map(pfx => (
                  <button key={pfx} onClick={() => { if (!value || value === '#') onChange(key, pfx) }} style={{ fontSize: 11, padding: '2px 7px', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', background: value.startsWith(pfx) ? '#eff6ff' : '#fff', color: value.startsWith(pfx) ? '#2563eb' : '#64748b' }}>{pfx}</button>
                ))}
              </div>
            </div>

          ) : isLong(key, value) ? (
            <textarea value={value} onChange={e => onChange(key, e.target.value)} rows={3} style={taSt} />

          ) : (
            <input type="text" value={value} onChange={e => onChange(key, e.target.value)} style={inSt} />
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
    <div style={{ padding: '0 0 24px' }}>

      {/* ── Background ── */}
      <Group title="Arrière-plan">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <ColorSwatch value={s.background || ''} onChange={v => onChange({ background: v })} />
          <input type="text" placeholder="#ffffff ou transparent" value={s.background || ''} onChange={e => onChange({ background: e.target.value })} style={{ ...inSt, flex: 1, opacity: s.gradientEnabled ? 0.4 : 1 }} disabled={!!s.gradientEnabled} />
        </div>

        {/* Gradient toggle */}
        <Toggle
          label="Dégradé"
          checked={!!s.gradientEnabled}
          onChange={v => onChange({ gradientEnabled: v })}
        />
        {s.gradientEnabled && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 8, borderLeft: '2px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <ColorSwatch value={s.gradientColor1 || '#7c3aed'} onChange={v => onChange({ gradientColor1: v })} />
              <ColorSwatch value={s.gradientColor2 || '#4f46e5'} onChange={v => onChange({ gradientColor2: v })} />
              <div style={{ flex: 1, height: 28, borderRadius: 6, background: `linear-gradient(${s.gradientAngle ?? 135}deg, ${s.gradientColor1 || '#7c3aed'}, ${s.gradientColor2 || '#4f46e5'})` }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={capSt}>Angle</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#18181b' }}>{s.gradientAngle ?? 135}°</span>
              </div>
              <input type="range" min={0} max={360} value={s.gradientAngle ?? 135} onChange={e => onChange({ gradientAngle: +e.target.value })} style={{ width: '100%', accentColor: '#7c3aed' }} />
            </div>
          </div>
        )}
      </Group>

      {/* ── Text ── */}
      <Group title="Texte">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <ColorSwatch value={s.color || ''} onChange={v => onChange({ color: v })} />
          <input type="text" placeholder="#000000" value={s.color || ''} onChange={e => onChange({ color: e.target.value })} style={{ ...inSt, flex: 1 }} />
        </div>

        {/* Font size quick buttons + slider */}
        <div style={{ marginBottom: 10 }}>
          <span style={capSt}>Taille police</span>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6, marginTop: 4 }}>
            {[12, 14, 16, 20, 24, 32, 48].map(sz => (
              <button key={sz} onClick={() => onChange({ fontSize: sz })} style={{
                flex: 1, height: 30, border: `1px solid ${s.fontSize === sz ? '#7c3aed' : '#e2e8f0'}`,
                background: s.fontSize === sz ? '#7c3aed' : '#fff',
                color: s.fontSize === sz ? '#fff' : '#374151',
                borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 600,
              }}>{sz}</button>
            ))}
          </div>
          <input type="range" min={10} max={80} value={s.fontSize ?? 16} onChange={e => onChange({ fontSize: +e.target.value })} style={{ width: '100%', accentColor: '#7c3aed' }} />
        </div>

        {/* Font weight */}
        <div style={{ marginBottom: 10 }}>
          <span style={capSt}>Graisse</span>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {[{ w: 400, l: 'Normal' }, { w: 600, l: 'Semi-gras' }, { w: 700, l: 'Gras' }, { w: 900, l: 'Très gras' }].map(({ w, l }) => (
              <button key={w} onClick={() => onChange({ fontWeight: w })} style={{
                flex: 1, height: 30, border: `1px solid ${s.fontWeight === w ? '#7c3aed' : '#e2e8f0'}`,
                background: s.fontWeight === w ? '#7c3aed' : '#fff',
                color: s.fontWeight === w ? '#fff' : '#374151',
                borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: w as number,
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div style={{ marginBottom: 10 }}>
          <span style={capSt}>Alignement</span>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {[{ v: 'left', i: '⬅' }, { v: 'center', i: '↔' }, { v: 'right', i: '➡' }].map(({ v, i }) => (
              <button key={v} onClick={() => onChange({ textAlign: v as 'left' | 'center' | 'right' })} style={{
                flex: 1, height: 34, border: `1px solid ${s.textAlign === v ? '#7c3aed' : '#e2e8f0'}`,
                background: s.textAlign === v ? '#7c3aed' : '#fff',
                color: s.textAlign === v ? '#fff' : '#374151',
                borderRadius: 6, cursor: 'pointer', fontSize: 16,
              }}>{i}</button>
            ))}
          </div>
        </div>

        {/* Font family */}
        <div>
          <span style={capSt}>Police</span>
          <select value={s.fontFamily || ''} onChange={e => onChange({ fontFamily: e.target.value })} style={{ ...slSt, marginTop: 4 }}>
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

        {isTextBlock && (
          <Toggle
            label="Texte sur fond coloré"
            checked={!!s.textHighlight}
            onChange={v => onChange({ textHighlight: v, background: v ? (s.background || '#fef3c7') : s.background })}
          />
        )}
      </Group>

      {/* ── Image overlay ── */}
      {isImageBlock && (
        <Group title="Superposition image">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <ColorSwatch value={s.overlayColor || ''} onChange={v => onChange({ overlayColor: v || undefined })} />
            <input type="text" placeholder="Couleur overlay" value={s.overlayColor || ''} onChange={e => onChange({ overlayColor: e.target.value || undefined })} style={{ ...inSt, flex: 1 }} />
          </div>
          {s.overlayColor && (
            <Slider label={`Opacité : ${s.overlayOpacity ?? 50}%`} value={s.overlayOpacity ?? 50} min={0} max={80} onChange={v => onChange({ overlayOpacity: v })} />
          )}
        </Group>
      )}

      {/* ── Spacing ── */}
      <Group title="Espacement">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { l: 'Padding haut', k: 'paddingTop' as keyof BlockStyle },
            { l: 'Padding bas', k: 'paddingBottom' as keyof BlockStyle },
            { l: 'Padding gauche', k: 'paddingLeft' as keyof BlockStyle },
            { l: 'Padding droite', k: 'paddingRight' as keyof BlockStyle },
          ].map(({ l, k }) => (
            <div key={k}>
              <span style={capSt}>{l}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <input type="number" min={0} max={200} value={(s[k] as number) ?? 0} onChange={e => onChange({ [k]: +e.target.value } as BlockStyle)} style={{ ...inSt, width: 52, textAlign: 'center' }} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>px</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          {[
            { l: 'Marge haut', k: 'marginTop' as keyof BlockStyle },
            { l: 'Marge bas', k: 'marginBottom' as keyof BlockStyle },
          ].map(({ l, k }) => (
            <div key={k}>
              <span style={capSt}>{l}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <input type="number" min={0} max={200} value={(s[k] as number) ?? 0} onChange={e => onChange({ [k]: +e.target.value } as BlockStyle)} style={{ ...inSt, width: 52, textAlign: 'center' }} />
                <span style={{ fontSize: 11, color: '#94a3b8' }}>px</span>
              </div>
            </div>
          ))}
        </div>
      </Group>

      {/* ── Dimensions ── */}
      <Group title="Dimensions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <span style={capSt}>Largeur</span>
            <input type="text" placeholder="100%, 800px…" value={s.width || ''} onChange={e => onChange({ width: e.target.value })} style={{ ...inSt, marginTop: 3 }} />
          </div>
          <div>
            <span style={capSt}>Hauteur min</span>
            <input type="text" placeholder="400px, auto…" value={s.minHeight || ''} onChange={e => onChange({ minHeight: e.target.value })} style={{ ...inSt, marginTop: 3 }} />
          </div>
        </div>
      </Group>

      {/* ── Appearance ── */}
      <Group title="Apparence">
        <Slider label={`Arrondi : ${s.borderRadius ?? 0}px`} value={s.borderRadius ?? 0} min={0} max={50} onChange={v => onChange({ borderRadius: v })} />
        <Slider label={`Opacité : ${s.opacity ?? 100}%`} value={s.opacity ?? 100} min={0} max={100} onChange={v => onChange({ opacity: v })} />
        <div>
          <span style={capSt}>Ombre</span>
          <select value={s.boxShadow || ''} onChange={e => onChange({ boxShadow: e.target.value })} style={{ ...slSt, marginTop: 4 }}>
            <option value="">Aucune</option>
            <option value="0 1px 2px rgba(0,0,0,0.05)">Légère</option>
            <option value="0 4px 6px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.06)">Moyenne</option>
            <option value="0 10px 15px rgba(0,0,0,0.1),0 4px 6px rgba(0,0,0,0.05)">Grande</option>
            <option value="0 25px 50px rgba(0,0,0,0.15)">XL</option>
          </select>
        </div>
      </Group>

      {/* ── Anchor ── */}
      <Group title="Lien ancre">
        <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, display: 'block', marginBottom: 6 }}>Permet à un bouton de pointer vers ce bloc avec <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>#identifiant</code></span>
        <input
          type="text"
          value={s.anchor || ''}
          onChange={e => onChange({ anchor: e.target.value.replace(/[^a-z0-9_-]/gi, '-').toLowerCase() || undefined })}
          placeholder="ex: contact, services…"
          style={inSt}
        />
        {s.anchor && <p style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>Lien : #{s.anchor}</p>}
      </Group>
    </div>
  )
}

// ─── Animation Tab ─────────────────────────────────────────────────────────────
function AnimationTab({ animation, onChange }: { animation: BlockAnimation; onChange: (p: Partial<BlockAnimation>) => void }) {
  return (
    <div style={{ padding: '0 0 24px' }}>
      <Group title="Animation d'entrée">
        <select value={animation.type} onChange={e => onChange({ type: e.target.value as AnimationType })} style={slSt}>
          <option value="none">Aucune</option>
          <optgroup label="Entrée">{ANIM_OPTS.filter(o => o.group === 'Entrée').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
          <optgroup label="Attention">{ANIM_OPTS.filter(o => o.group === 'Attention').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
          <optgroup label="Continu">{ANIM_OPTS.filter(o => o.group === 'Continu').map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
        </select>
        {animation.type !== 'none' && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Slider label={`Durée : ${animation.duration.toFixed(1)}s`} value={Math.round(animation.duration * 10)} min={2} max={20} onChange={v => onChange({ duration: v / 10 })} />
            <Slider label={`Délai : ${animation.delay.toFixed(1)}s`} value={Math.round(animation.delay * 10)} min={0} max={10} onChange={v => onChange({ delay: v / 10 })} />
            <div style={{ display: 'flex', gap: 4 }}>
              {(['load', 'scroll'] as const).map(t => (
                <button key={t} onClick={() => onChange({ trigger: t })} style={{
                  flex: 1, height: 34, border: `1px solid ${animation.trigger === t ? '#7c3aed' : '#e2e8f0'}`,
                  background: animation.trigger === t ? '#7c3aed' : '#fff',
                  color: animation.trigger === t ? '#fff' : '#64748b',
                  borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                }}>{t === 'load' ? '⚡ Au chargement' : '📜 Au scroll'}</button>
              ))}
            </div>
          </div>
        )}
      </Group>

      <Group title="Effet au survol">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {HOVER_OPTS.map(opt => (
            <button key={opt.value} onClick={() => onChange({ hover: opt.value })} style={{
              height: 34, border: `1px solid ${animation.hover === opt.value ? '#7c3aed' : '#e2e8f0'}`,
              background: animation.hover === opt.value ? '#7c3aed' : '#fff',
              color: animation.hover === opt.value ? '#fff' : '#374151',
              borderRadius: 8, cursor: 'pointer', fontSize: 12,
              fontWeight: animation.hover === opt.value ? 700 : 400,
            }}>{opt.label}</button>
          ))}
        </div>
      </Group>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: '1px solid #f1f5f9', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )
}

function ColorSwatch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, background: value || '#fff', border: '2px solid #e2e8f0', cursor: 'pointer' }} />
      <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
    </div>
  )
}

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={capSt}>{label}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ width: '100%', accentColor: '#7c3aed' }} />
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 0' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11, flexShrink: 0,
          background: checked ? '#7c3aed' : '#d1d5db',
          position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
        }}
      >
        <div style={{
          position: 'absolute', top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
    </label>
  )
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const inSt: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, background: '#fff', color: '#18181b', outline: 'none', boxSizing: 'border-box' }
const taSt: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, background: '#fff', color: '#18181b', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }
const slSt: React.CSSProperties = { width: '100%', height: 34, padding: '0 8px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, background: '#fff', color: '#18181b', outline: 'none', cursor: 'pointer' }
const lbSt: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 5 }
const capSt: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }
