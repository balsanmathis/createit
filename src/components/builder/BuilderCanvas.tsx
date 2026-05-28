'use client'

import { useRef, useState, useCallback, Fragment } from 'react'
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
  isMobile: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const blockElRef = useRef<HTMLDivElement>(null)
  const [resizeHeight, setResizeHeight] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const def = BLOCK_DEFS.find(d => d.type === block.type)
  const html = def
    ? def.render(block.content, block.style)
    : `<div style="padding:20px;color:#999">Bloc inconnu: ${block.type}</div>`

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
      {/* ── Top action bar (visible on hover desktop, always on mobile selected) */}
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
        {/* Drag handle */}
        {!isMobile && (
          <button
            {...listeners} {...attributes}
            onClick={e => e.stopPropagation()}
            title="Déplacer"
            style={barBtn}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="4" cy="3" r="1.2"/><circle cx="10" cy="3" r="1.2"/>
              <circle cx="4" cy="7" r="1.2"/><circle cx="10" cy="7" r="1.2"/>
              <circle cx="4" cy="11" r="1.2"/><circle cx="10" cy="11" r="1.2"/>
            </svg>
          </button>
        )}

        {/* Block label */}
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', padding: '0 8px', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', opacity: 0.9 }}>
          {blockLabel(block)}
        </span>

        {/* Actions */}
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

      {/* HTML Preview */}
      <div
        ref={blockElRef}
        style={{ pointerEvents: 'none', userSelect: 'none', minHeight: resizeHeight ?? undefined }}
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

      {/* Resize handle — desktop only */}
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

// Show action bar on hover for non-selected blocks (CSS can't read React state)
const HOVER_STYLE = `
.block-wrap:hover .block-actionbar { opacity: 1 !important; pointer-events: all !important; }
`

// ─── Empty drop zone ───────────────────────────────────────────────────────────
function EmptyDropZone({ isMobile, onOpenBlocks }: { isMobile: boolean; onOpenBlocks?: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-empty' })
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 500, padding: 40,
      }}
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
  const { state, dispatch, removeBlock, moveBlock, selectBlock, addBlock, updateStyle, duplicateBlock } = useBuilder()
  const isMobile = useMobile()
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: isMobile === true ? 999999 : 8 },
  }))

  const maxWidth = state.viewport === 'tablet' ? 768 : state.viewport === 'mobile' ? 375 : undefined

  const handleResize = useCallback((id: string, minHeight: string) => {
    updateStyle(id, { minHeight })
  }, [updateStyle])

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
          minHeight: 0,          /* fix: allow flex item to be shorter than content → enables overflow-y scroll */
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
                {/* Add button before first block */}
                {isMobile !== true && (
                  <AddBetween index={0} onAdd={handleAddBetween} />
                )}
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
                        isMobile={isMobile === true}
                      />
                    </div>
                    {isMobile !== true && (
                      <AddBetween index={i + 1} onAdd={handleAddBetween} />
                    )}
                  </Fragment>
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {/* Desktop scroll hint */}
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
    </DndContext>
  )
}
