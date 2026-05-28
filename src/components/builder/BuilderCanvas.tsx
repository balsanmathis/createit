'use client'

import { useRef, useState, useCallback } from 'react'
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

const HOVER_CSS = `
.bh-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.15); transition: all 0.25s; }
.bh-grow:hover { transform: scale(1.05); transition: transform 0.25s; }
.bh-shrink:hover { transform: scale(0.95); transition: transform 0.25s; }
.bh-glow:hover { box-shadow: 0 0 0 3px rgba(124,58,237,0.4), 0 8px 24px rgba(124,58,237,0.2); transition: box-shadow 0.25s; }
.bh-tilt:hover { transform: perspective(600px) rotateX(3deg) rotateY(3deg); transition: transform 0.25s; }
.bh-underline { position: relative; }
.bh-underline::after { content:''; position:absolute; bottom:0; left:0; width:0; height:2px; background:currentColor; transition: width 0.3s; }
.bh-underline:hover::after { width: 100%; }
`

interface BuilderCanvasProps {
  onMobileOpenBlocks?: () => void
}

// ─── SortableBlock ─────────────────────────────────────────────────────────────
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
  onResize,
  isMobile,
}: {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onResize: (minHeight: string) => void
  isMobile: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const blockElRef = useRef<HTMLDivElement>(null)
  const [resizeHeight, setResizeHeight] = useState<number | null>(null)
  const def = BLOCK_DEFS.find(d => d.type === block.type)
  const html = def
    ? def.render(block.content, block.style)
    : `<div style="padding:20px;color:#999">Bloc inconnu: ${block.type}</div>`

  const hoverClass = block.animation.hover && block.animation.hover !== 'none'
    ? `bh-${block.animation.hover}`
    : ''

  // On mobile, toolbar is always visible; on desktop only on hover/select
  const toolbarOpacity = isMobile === true || isSelected ? 1 : 0

  const wrapperStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    outline: isSelected ? '2px solid #7c3aed' : '2px solid transparent',
    outlineOffset: 0,
    cursor: 'default',
    background: '#fff',
  }

  function startResize(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startY = e.clientY
    const startH = blockElRef.current?.getBoundingClientRect().height ?? 200
    function onMove(ev: MouseEvent) { setResizeHeight(Math.max(40, startH + (ev.clientY - startY))) }
    function onUp(ev: MouseEvent) {
      const h = Math.max(40, startH + (ev.clientY - startY))
      setResizeHeight(null)
      onResize(`${h}px`)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div
      ref={setNodeRef}
      id={block.style.anchor || undefined}
      style={wrapperStyle}
      onClick={e => { e.stopPropagation(); onSelect() }}
      onMouseEnter={e => {
        if (isMobile !== true) {
          const toolbar = e.currentTarget.querySelector<HTMLElement>('.block-toolbar')
          if (toolbar) toolbar.style.opacity = '1'
        }
      }}
      onMouseLeave={e => {
        if (isMobile !== true && !isSelected) {
          const toolbar = e.currentTarget.querySelector<HTMLElement>('.block-toolbar')
          if (toolbar) toolbar.style.opacity = '0'
        }
      }}
    >
      {/* Toolbar */}
      <div
        className="block-toolbar"
        style={{
          position: 'absolute', top: isMobile ? 4 : 6, right: isMobile ? 4 : 6,
          display: 'flex', gap: isMobile ? 6 : 4, zIndex: 20,
          opacity: toolbarOpacity,
          transition: 'opacity 0.15s',
        }}
      >
        {/* Drag handle — desktop only */}
        {isMobile !== true && (
          <button title="Déplacer" {...listeners} {...attributes} style={{ ...toolbarBtn(isMobile), cursor: 'grab' }} onClick={e => e.stopPropagation()}>⠿</button>
        )}
        <button title="Monter" style={toolbarBtn(isMobile)} onClick={e => { e.stopPropagation(); onMoveUp() }}>↑</button>
        <button title="Descendre" style={toolbarBtn(isMobile)} onClick={e => { e.stopPropagation(); onMoveDown() }}>↓</button>
        <button title="Supprimer" style={{ ...toolbarBtn(isMobile), background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }} onClick={e => { e.stopPropagation(); onRemove() }}>🗑</button>
      </div>

      {/* Block label badge */}
      {isSelected && (
        <div style={{ position: 'absolute', top: isMobile ? 4 : 6, left: isMobile ? 4 : 6, background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, zIndex: 20, pointerEvents: 'none' }}>
          {def?.label || block.type}
        </div>
      )}

      {/* HTML Preview */}
      <div
        ref={blockElRef}
        className={hoverClass}
        style={{ pointerEvents: 'none', userSelect: 'none', minHeight: resizeHeight ? resizeHeight : undefined }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Image / color overlay — visible in canvas */}
      {block.style.overlayColor && (
        <div style={{
          position: 'absolute', inset: 0,
          background: block.style.overlayColor,
          opacity: (block.style.overlayOpacity ?? 50) / 100,
          pointerEvents: 'none',
          zIndex: 10,
        }} />
      )}

      {/* Resize handle — desktop only when selected */}
      {isSelected && isMobile !== true && (
        <div
          onMouseDown={startResize}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 8, cursor: 'ns-resize', zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(124,58,237,0.1)',
          }}
        >
          <div style={{ width: 32, height: 3, background: '#7c3aed', borderRadius: 2, opacity: 0.6 }} />
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

const toolbarBtn = (isMobile: boolean): React.CSSProperties => ({
  width: isMobile ? 40 : 28,
  height: isMobile ? 40 : 28,
  background: '#fff',
  border: '1px solid #e4e4e7',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: isMobile ? 16 : 13,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#18181b',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
})

// ─── Empty drop zone ───────────────────────────────────────────────────────────
function EmptyDropZone({ isMobile, onOpenBlocks }: { isMobile: boolean; onOpenBlocks?: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-empty' })
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: 400, border: `2px dashed ${isOver ? '#7c3aed' : '#d1d5db'}`, borderRadius: 12,
        margin: 40, background: isOver ? '#f3e8ff' : 'transparent', transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
      <p style={{ fontSize: 15, color: isOver ? '#7c3aed' : '#6b7280', fontWeight: 600, margin: 0 }}>
        {isOver ? 'Déposez ici !' : isMobile ? 'Appuyez sur "＋ Blocs" pour commencer' : 'Glissez votre premier bloc ici'}
      </p>
      {isMobile && (
        <button onClick={onOpenBlocks} style={{ marginTop: 16, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          ＋ Ajouter un bloc
        </button>
      )}
      {!isMobile && (
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '8px 0 0' }}>
          ou cliquez sur un bloc dans le panneau gauche
        </p>
      )}
    </div>
  )
}

// ─── Add Section Button ────────────────────────────────────────────────────────
function AddSectionButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '18px 0', background: 'transparent',
        border: '2px dashed #c4b5fd', borderRadius: 10, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        color: '#7c3aed', transition: 'all 0.2s', marginTop: 8,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#7c3aed' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#c4b5fd' }}
    >
      <div style={{ width: 32, height: 32, background: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, lineHeight: 1 }}>+</div>
      <span style={{ fontSize: 13, fontWeight: 600 }}>Ajouter une section</span>
      <span style={{ fontSize: 11, color: '#9ca3af' }}>ou glissez un bloc depuis le panneau gauche</span>
    </button>
  )
}

// ─── Canvas ────────────────────────────────────────────────────────────────────
export default function BuilderCanvas({ onMobileOpenBlocks }: BuilderCanvasProps) {
  const { state, dispatch, removeBlock, moveBlock, selectBlock, addBlock, updateStyle } = useBuilder()
  const isMobile = useMobile()
  const containerRef = useRef<HTMLDivElement>(null)

  // On mobile, disable drag (use very high activation threshold)
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

  function scrollToBottom() {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <style>{HOVER_CSS}</style>

      <main
        ref={containerRef}
        onClick={() => selectBlock(null)}
        style={{
          flex: 1, overflowY: 'auto', background: '#f1f5f9',
          backgroundImage: [
            'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(0,0,0,0.04) 19px,rgba(0,0,0,0.04) 20px)',
            'repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(0,0,0,0.04) 19px,rgba(0,0,0,0.04) 20px)',
          ].join(','),
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: isMobile === true ? '8px 0 120px' : '20px 0 80px',
          scrollBehavior: 'smooth',
        }}
      >
        <div style={{
          width: '100%', maxWidth, background: '#fff', minHeight: 600,
          boxShadow: maxWidth ? '0 0 0 1px rgba(0,0,0,0.1),0 8px 32px rgba(0,0,0,0.12)' : 'none',
          borderRadius: maxWidth ? 12 : 0,
          margin: maxWidth ? '0 auto' : 0, transition: 'max-width 0.3s ease',
        }}>
          {state.blocks.length === 0 ? (
            <EmptyDropZone isMobile={isMobile === true} onOpenBlocks={onMobileOpenBlocks} />
          ) : (
            <SortableContext items={state.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div>
                {state.blocks.map(block => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={state.selectedId === block.id}
                    onSelect={() => selectBlock(block.id)}
                    onRemove={() => removeBlock(block.id)}
                    onMoveUp={() => moveBlock(block.id, 'up')}
                    onMoveDown={() => moveBlock(block.id, 'down')}
                    onResize={(minHeight) => handleResize(block.id, minHeight)}
                    isMobile={isMobile === true}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        {state.blocks.length > 0 && isMobile !== true && (
          <div style={{ width: '100%', maxWidth, margin: maxWidth ? '12px auto 0' : '12px 0 0', padding: '0 16px' }}>
            <AddSectionButton onClick={() => { addBlock('hero'); scrollToBottom(); }} />
          </div>
        )}

        {/* Desktop scroll-down hint */}
        {state.blocks.length > 0 && isMobile !== true && (
          <div style={{ position: 'sticky', bottom: 16, width: '100%', display: 'flex', justifyContent: 'flex-end', paddingRight: 16, pointerEvents: 'none', marginTop: 16 }}>
            <button
              onClick={e => { e.stopPropagation(); scrollToBottom(); }}
              style={{
                pointerEvents: 'all', width: 38, height: 38, borderRadius: '50%',
                background: '#7c3aed', color: '#fff', border: 'none',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.transform = 'translateY(2px)'; b.style.boxShadow = '0 2px 8px rgba(124,58,237,0.3)' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.transform = ''; b.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)' }}
            >
              ↓
            </button>
          </div>
        )}
      </main>

      {/* Mobile FAB — "＋ Blocs" */}
      {isMobile === true && (
        <button
          onClick={e => { e.stopPropagation(); onMobileOpenBlocks?.() }}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: '#7c3aed', color: '#fff', border: 'none',
            borderRadius: 28, padding: '14px 28px',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            zIndex: 90, boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
            display: 'flex', alignItems: 'center', gap: 8,
            minHeight: 52,
          }}
        >
          ＋ Blocs
        </button>
      )}
    </DndContext>
  )
}
