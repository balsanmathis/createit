'use client'

import { useRef, useState, useCallback, useEffect, Fragment } from 'react'
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuilder } from '@/lib/builder/context'
import { useMobile } from '@/lib/builder/use-mobile'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

interface BuilderCanvasProps {
  onMobileOpenBlocks?: () => void
}

// ─── Block type label helper ───────────────────────────────────────────────────
function blockLabel(block: Block): string {
  const def = BLOCK_DEFS.find(d => d.type === block.type)
  return def ? `${def.icon}  ${def.label}` : block.type
}

// ─── Between-blocks add button ─────────────────────────────────────────────────
function AddBetween({ index, onAdd }: { index: number; onAdd: (i: number) => void }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      style={{ position: 'relative', height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: hover ? '#7c3aed' : 'transparent', transition: 'background 0.15s' }} />
      {hover && (
        <button
          onClick={e => { e.stopPropagation(); onAdd(index) }}
          style={{
            position: 'absolute',
            width: 28, height: 28, borderRadius: '50%',
            background: '#7c3aed', color: '#fff', border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(124,58,237,0.4)',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}
          title="Insérer un bloc ici"
        >+</button>
      )}
    </div>
  )
}

// ─── Inline image popup ────────────────────────────────────────────────────────
interface InlineImgPopupProps {
  siteId: string
  currentSrc: string
  onConfirm: (url: string) => void
  onClose: () => void
}

function InlineImgPopup({ siteId, currentSrc, onConfirm, onClose }: InlineImgPopupProps) {
  const [tab, setTab] = useState<'upload' | 'url' | 'unsplash'>('url')
  const [url, setUrl] = useState(currentSrc)
  const [preview, setPreview] = useState(currentSrc)
  const [uploading, setUploading] = useState(false)
  const [uq, setUq] = useState('')
  const [results, setResults] = useState<{ preview: string; full: string }[]>([])
  const [uLoading, setULoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('siteId', siteId)
    try {
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur upload')
      setUrl(data.url); setPreview(data.url)
    } finally { setUploading(false) }
  }

  const searchUnsplash = async () => {
    if (!uq.trim()) return
    setULoading(true); setResults([])
    try {
      const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
      if (key) {
        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(uq)}&per_page=9&client_id=${key}`)
        const data = await res.json()
        setResults((data.results as Array<{ urls: { small: string; regular: string } }>).map(p => ({
          preview: p.urls.small,
          full: `${p.urls.regular}&w=1200&q=80`,
        })))
      }
    } finally { setULoading(false) }
  }

  const inp: React.CSSProperties = {
    background: '#f8f8fc', border: '1px solid #e5e7eb', color: '#111',
    borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666', lineHeight: 1 }}>×</button>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#111' }}>Remplacer l'image</h3>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 16 }}>
          {(['upload', 'url', 'unsplash'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 7, transition: 'all 0.15s',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#7c3aed' : '#888',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
              {t === 'upload' ? '📁 Upload' : t === 'url' ? '🔗 URL' : '🌄 Unsplash'}
            </button>
          ))}
        </div>

        {tab === 'upload' && (
          <div style={{ marginBottom: 16 }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} style={{ display: 'none' }} />
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) handleFile(f) }}
              onDragOver={e => e.preventDefault()}
              style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', color: '#888', fontSize: 13 }}
            >
              {uploading ? <span style={{ color: '#7c3aed', fontWeight: 600 }}>Upload en cours…</span> : <>📷 Glisser-déposer ou cliquer<br /><span style={{ fontSize: 11, color: '#aaa' }}>JPG, PNG, WebP · max 5MB</span></>}
            </div>
          </div>
        )}

        {tab === 'url' && (
          <input type="text" value={url} onChange={e => { setUrl(e.target.value); setPreview(e.target.value) }}
            placeholder="https://exemple.com/image.jpg" style={{ ...inp, marginBottom: 16 }} autoFocus
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#7c3aed' }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb' }} />
        )}

        {tab === 'unsplash' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input type="text" value={uq} onChange={e => setUq(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUnsplash()}
                placeholder="restaurant, nature…"
                style={{ ...inp, flex: 1, width: 'auto', padding: '8px 12px' }} autoFocus
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#7c3aed' }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb' }} />
              <button onClick={searchUnsplash} disabled={uLoading || !uq.trim()}
                style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: uLoading ? 0.5 : 1 }}>
                {uLoading ? '…' : 'Chercher'}
              </button>
            </div>
            {results.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, maxHeight: 200, overflowY: 'auto', borderRadius: 10 }}>
                {results.map((r, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={r.preview} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', display: 'block' }}
                    onClick={() => { setUrl(r.full); setPreview(r.full); setTab('url') }} />
                ))}
              </div>
            )}
          </div>
        )}

        {preview && tab !== 'unsplash' && (
          <div style={{ marginBottom: 16, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu" style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'contain', display: 'block' }} onError={() => setPreview('')} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#555' }}>Annuler</button>
          <button onClick={() => { if (url) onConfirm(url) }} disabled={!url || uploading}
            style={{ flex: 1, padding: '10px 0', background: '#7c3aed', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff', opacity: (!url || uploading) ? 0.5 : 1 }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SortableBlock ─────────────────────────────────────────────────────────────
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onResize,
  onImgClick,
  updateContentFn,
  isMobile,
}: {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onResize: (minHeight: string) => void
  onImgClick: (blockId: string, src: string) => void
  updateContentFn: (id: string, content: Record<string, string>) => void
  isMobile: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const blockElRef = useRef<HTMLDivElement>(null)
  const editingRef = useRef<{ el: HTMLElement; orig: string } | null>(null)
  const [resizeHeight, setResizeHeight] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const def = BLOCK_DEFS.find(d => d.type === block.type)
  const html = def
    ? def.render(block.content, block.style)
    : `<div style="padding:20px;color:#999">Bloc inconnu: ${block.type}</div>`

  // ── Inline editing ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSelected || !blockElRef.current) return
    const container = blockElRef.current

    const TEXT_TAGS = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'LI', 'BUTTON', 'STRONG', 'EM', 'B', 'I', 'SMALL', 'LABEL', 'CITE'])
    const BLOCK_TAGS = new Set(['DIV', 'SECTION', 'ARTICLE', 'NAV', 'UL', 'OL', 'TABLE', 'THEAD', 'TBODY', 'FORM', 'FIGURE'])

    function hasBlockChild(el: HTMLElement): boolean {
      for (let i = 0; i < el.children.length; i++) {
        if (BLOCK_TAGS.has(el.children[i].tagName)) return true
      }
      return false
    }

    function commitEdit(el: HTMLElement) {
      if (editingRef.current?.el !== el) return
      const newHtml = el.innerHTML
      const origHtml = editingRef.current.orig
      el.contentEditable = 'false'
      el.style.outline = ''
      el.style.outlineOffset = ''
      editingRef.current = null
      if (newHtml === origHtml) return

      // Find content field whose value matches the original text/html
      for (const [field, val] of Object.entries(block.content)) {
        if (field.startsWith('_')) continue
        if (val === origHtml || val.trim() === origHtml.trim()) {
          updateContentFn(block.id, { [field]: newHtml })
          return
        }
      }
    }

    function onDblClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target) return
      // Walk up from target to find a text leaf element
      let node: HTMLElement | null = target
      while (node && node !== container) {
        if (TEXT_TAGS.has(node.tagName) && !hasBlockChild(node)) {
          e.preventDefault()
          e.stopPropagation()
          if (editingRef.current && editingRef.current.el !== node) commitEdit(editingRef.current.el)
          editingRef.current = { el: node, orig: node.innerHTML }
          node.contentEditable = 'true'
          node.style.outline = '2px dashed #7c3aed'
          node.style.outlineOffset = '2px'
          node.focus()
          try {
            const r = document.createRange()
            const s = window.getSelection()
            r.selectNodeContents(node)
            s?.removeAllRanges()
            s?.addRange(r)
          } catch { /* ignore */ }
          return
        }
        node = node.parentElement
      }
    }

    function onBlurCapture(e: FocusEvent) {
      const target = e.target as HTMLElement
      if (editingRef.current?.el === target) commitEdit(target)
    }

    function onClickCapture(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target) return
      // Prevent link navigation inside blocks
      const a = target.closest('a')
      if (a) e.preventDefault()
      // Image click → image picker
      if (target.tagName === 'IMG') {
        e.preventDefault()
        e.stopPropagation()
        onImgClick(block.id, target.getAttribute('src') || '')
      }
    }

    container.addEventListener('dblclick', onDblClick)
    container.addEventListener('blur', onBlurCapture, true)
    container.addEventListener('click', onClickCapture, true)

    return () => {
      container.removeEventListener('dblclick', onDblClick)
      container.removeEventListener('blur', onBlurCapture, true)
      container.removeEventListener('click', onClickCapture, true)
      if (editingRef.current) {
        editingRef.current.el.contentEditable = 'false'
        editingRef.current.el.style.outline = ''
        editingRef.current = null
      }
    }
  }, [isSelected, block.id, block.content, updateContentFn, onImgClick])

  function startResize(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    const startY = e.clientY
    const startH = blockElRef.current?.getBoundingClientRect().height ?? 200
    function onMove(ev: MouseEvent) { setResizeHeight(Math.max(40, startH + (ev.clientY - startY))) }
    function onUp(ev: MouseEvent) {
      const h = Math.max(40, startH + (ev.clientY - startY))
      setResizeHeight(null); onResize(`${h}px`)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirmDelete) { onRemove(); setConfirmDelete(false) }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500) }
  }

  return (
    <div
      ref={setNodeRef}
      id={block.style.anchor || undefined}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: 'relative',
        outline: isSelected ? '2px solid #7c3aed' : '2px solid transparent',
        outlineOffset: 0,
        background: '#fff',
        cursor: 'default',
      }}
      onClick={e => { e.stopPropagation(); onSelect() }}
    >
      {/* ── Top action bar ──────────────────────────────────────────────────── */}
      <div
        className="block-actionbar"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 40, zIndex: 30,
          display: 'flex', alignItems: 'center',
          background: isSelected ? '#7c3aed' : 'rgba(0,0,0,0.55)',
          backdropFilter: isSelected ? 'none' : 'blur(4px)',
          opacity: isSelected || isMobile ? 1 : 0,
          transition: 'opacity 0.15s',
          pointerEvents: isSelected || isMobile ? 'all' : 'none',
        }}
      >
        {!isMobile && (
          <button {...listeners} {...attributes} onClick={e => e.stopPropagation()} title="Déplacer" style={barBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
              <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
              <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
            </svg>
          </button>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', padding: '0 8px', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', opacity: 0.9 }}>
          {blockLabel(block)}
        </span>
        <div style={{ display: 'flex', gap: 2, paddingRight: 6 }}>
          <button onClick={e => { e.stopPropagation(); onMoveUp() }} title="Monter" style={barBtn}>↑</button>
          <button onClick={e => { e.stopPropagation(); onMoveDown() }} title="Descendre" style={barBtn}>↓</button>
          <button onClick={e => { e.stopPropagation(); onDuplicate() }} title="Dupliquer" style={barBtn}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="4" y="4" width="8" height="8" rx="1.5"/>
              <path d="M2 10V2h8"/>
            </svg>
          </button>
          <button
            onClick={handleDelete}
            title={confirmDelete ? 'Confirmer la suppression' : 'Supprimer'}
            style={{ ...barBtn, background: confirmDelete ? '#ef4444' : undefined, color: confirmDelete ? '#fff' : undefined }}
          >
            {confirmDelete ? '✓' : '🗑'}
          </button>
        </div>
      </div>

      {/* ── Block HTML content ──────────────────────────────────────────────── */}
      <div
        ref={blockElRef}
        style={{
          pointerEvents: isSelected ? 'auto' : 'none',
          userSelect: isSelected ? 'text' : 'none',
          minHeight: resizeHeight ?? undefined,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Image overlay */}
      {block.style.overlayColor && (
        <div style={{
          position: 'absolute', inset: 0,
          background: block.style.overlayColor,
          opacity: (block.style.overlayOpacity ?? 50) / 100,
          pointerEvents: 'none', zIndex: 10,
        }} />
      )}

      {/* Editing hint */}
      {isSelected && !isMobile && (
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(124,58,237,0.85)', color: '#fff',
          fontSize: 11, fontWeight: 600, padding: '3px 12px', borderRadius: 20,
          pointerEvents: 'none', whiteSpace: 'nowrap', zIndex: 25,
        }}>
          ✏️ Double-clic pour modifier le texte · Clic image pour changer
        </div>
      )}

      {/* Resize handle */}
      {isSelected && !isMobile && (
        <div
          onMouseDown={startResize}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 10, cursor: 'ns-resize', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(124,58,237,0.08)',
          }}
        >
          <div style={{ width: 40, height: 3, background: '#7c3aed', borderRadius: 2, opacity: 0.5 }} />
          {resizeHeight !== null && (
            <span style={{ position: 'absolute', right: 8, fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '1px 6px', borderRadius: 4 }}>
              {resizeHeight}px
            </span>
          )}
        </div>
      )}
    </div>
  )
}

const barBtn: React.CSSProperties = {
  width: 32, height: 32, background: 'rgba(255,255,255,0.15)',
  border: 'none', borderRadius: 6, cursor: 'pointer',
  fontSize: 14, color: '#fff',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexShrink: 0,
}

const HOVER_STYLE = `
.block-wrap:hover .block-actionbar { opacity: 1 !important; pointer-events: all !important; }
.gallery-item { cursor: pointer !important; }
.gallery-item:hover { box-shadow: inset 0 0 0 3px #7c3aed; }
`

// ─── Empty drop zone ───────────────────────────────────────────────────────────
function EmptyDropZone({ isMobile, onOpenBlocks }: { isMobile: boolean; onOpenBlocks?: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-empty' })
  return (
    <div
      ref={setNodeRef}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500, padding: 40 }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        border: `2px dashed ${isOver ? '#7c3aed' : '#c4b5fd'}`,
        borderRadius: 20, padding: '60px 40px',
        background: isOver ? '#f3e8ff' : '#faf5ff',
        textAlign: 'center', transition: 'all 0.2s',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✨</div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#4c1d95', margin: '0 0 10px' }}>
          {isOver ? 'Déposez ici !' : 'Commencez à construire'}
        </h3>
        <p style={{ fontSize: 14, color: '#7c3aed', margin: '0 0 28px', lineHeight: 1.6 }}>
          {isMobile ? 'Appuyez sur le bouton ci-dessous pour ajouter votre premier bloc.' : 'Glissez un bloc depuis le panneau gauche, ou cliquez sur un bloc pour l\'ajouter.'}
        </p>
        {isMobile && (
          <button
            onClick={onOpenBlocks}
            style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.35)' }}
          >
            ＋ Ajouter un bloc
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Canvas ────────────────────────────────────────────────────────────────────
export default function BuilderCanvas({ onMobileOpenBlocks }: BuilderCanvasProps) {
  const { state, dispatch, removeBlock, moveBlock, selectBlock, addBlock, updateStyle, updateContent, duplicateBlock } = useBuilder()
  const isMobile = useMobile()
  const containerRef = useRef<HTMLDivElement>(null)

  // Image edit popup state
  const [imgEditPopup, setImgEditPopup] = useState<{
    blockId: string
    fieldKey: string | null
    currentSrc: string
  } | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: isMobile === true ? 999999 : 8 },
  }))

  const maxWidth = state.viewport === 'tablet' ? 768 : state.viewport === 'mobile' ? 375 : undefined

  const handleResize = useCallback((id: string, minHeight: string) => {
    updateStyle(id, { minHeight })
  }, [updateStyle])

  const handleImgClick = useCallback((blockId: string, src: string) => {
    const block = state.blocks.find(b => b.id === blockId)
    if (!block) return
    const fieldKey = Object.entries(block.content).find(([, v]) => v === src)?.[0] ?? null
    setImgEditPopup({ blockId, fieldKey, currentSrc: src })
  }, [state.blocks])

  const handleImgEditConfirm = useCallback((url: string) => {
    if (!imgEditPopup) return
    const { blockId, fieldKey, currentSrc } = imgEditPopup
    const block = state.blocks.find(b => b.id === blockId)
    if (!block) { setImgEditPopup(null); return }

    if (fieldKey && block.content[fieldKey] === currentSrc) {
      updateContent(blockId, { [fieldKey]: url })
    } else {
      // Try string replacement in any field containing the old src
      const updates: Record<string, string> = {}
      for (const [key, val] of Object.entries(block.content)) {
        if (val.includes(currentSrc)) {
          updates[key] = val.split(currentSrc).join(url)
        }
      }
      if (Object.keys(updates).length > 0) updateContent(blockId, updates)
    }
    setImgEditPopup(null)
  }, [imgEditPopup, state.blocks, updateContent])

  function handleDragEnd(event: DragEndEvent) {
    if (isMobile === true) return
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    if (activeId.startsWith('palette-')) {
      const blockType = active.data.current?.blockType as string
      if (blockType) addBlock(blockType)
      return
    }
    if (active.id !== over.id) {
      const oldIdx = state.blocks.findIndex(b => b.id === active.id)
      const newIdx = state.blocks.findIndex(b => b.id === over.id)
      if (oldIdx >= 0 && newIdx >= 0) {
        dispatch({ type: 'REORDER_BLOCKS', payload: arrayMove(state.blocks, oldIdx, newIdx) })
      }
    }
  }

  function handleAddBetween(insertIndex: number) {
    addBlock('paragraph', insertIndex)
  }

  function scrollToBottom() {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <style>{HOVER_STYLE}</style>

      <main
        ref={containerRef}
        onClick={() => selectBlock(null)}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          background: '#f1f5f9',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: isMobile === true ? '8px 0 120px' : '24px 20px 80px',
          scrollBehavior: 'smooth',
        }}
      >
        <div style={{
          width: '100%', maxWidth,
          background: '#fff',
          minHeight: 600,
          boxShadow: maxWidth ? '0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.1)' : '0 0 0 1px rgba(0,0,0,0.06)',
          borderRadius: maxWidth ? 12 : 0,
          transition: 'max-width 0.3s ease',
        }}>
          {state.blocks.length === 0 ? (
            <EmptyDropZone isMobile={isMobile === true} onOpenBlocks={onMobileOpenBlocks} />
          ) : (
            <SortableContext items={state.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div>
                {isMobile !== true && <AddBetween index={0} onAdd={handleAddBetween} />}
                {state.blocks.map((block, i) => (
                  <Fragment key={block.id}>
                    <div className="block-wrap">
                      <SortableBlock
                        block={block}
                        isSelected={state.selectedId === block.id}
                        onSelect={() => selectBlock(block.id)}
                        onRemove={() => removeBlock(block.id)}
                        onMoveUp={() => moveBlock(block.id, 'up')}
                        onMoveDown={() => moveBlock(block.id, 'down')}
                        onDuplicate={() => duplicateBlock(block.id)}
                        onResize={(minHeight) => handleResize(block.id, minHeight)}
                        onImgClick={handleImgClick}
                        updateContentFn={updateContent}
                        isMobile={isMobile === true}
                      />
                    </div>
                    {isMobile !== true && <AddBetween index={i + 1} onAdd={handleAddBetween} />}
                  </Fragment>
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {state.blocks.length > 0 && isMobile !== true && (
          <div style={{ position: 'sticky', bottom: 16, width: '100%', maxWidth, display: 'flex', justifyContent: 'flex-end', pointerEvents: 'none', marginTop: 16 }}>
            <button
              onClick={e => { e.stopPropagation(); scrollToBottom() }}
              style={{
                pointerEvents: 'all', width: 40, height: 40, borderRadius: '50%',
                background: '#7c3aed', color: '#fff', border: 'none',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                cursor: 'pointer', fontSize: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >↓</button>
          </div>
        )}
      </main>

      {/* Mobile FAB */}
      {isMobile === true && (
        <button
          onClick={e => { e.stopPropagation(); onMobileOpenBlocks?.() }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: '#7c3aed', color: '#fff', border: 'none',
            borderRadius: 28, padding: '14px 28px',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            zIndex: 90, boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
            display: 'flex', alignItems: 'center', gap: 8, minHeight: 52,
          }}
        >
          ＋ Blocs
        </button>
      )}

      {/* Inline image replace popup */}
      {imgEditPopup && (
        <InlineImgPopup
          siteId={state.siteId || ''}
          currentSrc={imgEditPopup.currentSrc}
          onConfirm={handleImgEditConfirm}
          onClose={() => setImgEditPopup(null)}
        />
      )}
    </DndContext>
  )
}
