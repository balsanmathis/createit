'use client'

import { useRef } from 'react'
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
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

// ─── SortableBlock ────────────────────────────────────────────────────────────
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const def = BLOCK_DEFS.find(d => d.type === block.type)
  const html = def
    ? def.render(block.content, block.style)
    : `<div style="padding:20px;color:#999">Bloc inconnu: ${block.type}</div>`

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

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      onClick={e => {
        e.stopPropagation()
        onSelect()
      }}
      onMouseEnter={e => {
        const toolbar = e.currentTarget.querySelector<HTMLElement>('.block-toolbar')
        if (toolbar) toolbar.style.opacity = '1'
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          const toolbar = e.currentTarget.querySelector<HTMLElement>('.block-toolbar')
          if (toolbar) toolbar.style.opacity = '0'
        }
      }}
    >
      {/* Toolbar */}
      <div
        className="block-toolbar"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          display: 'flex',
          gap: 4,
          zIndex: 20,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      >
        {/* Drag handle */}
        <button
          title="Déplacer"
          {...listeners}
          {...attributes}
          style={{ ...toolbarBtnBase, cursor: 'grab' }}
          onClick={e => e.stopPropagation()}
        >
          ⠿
        </button>
        <button
          title="Monter"
          style={toolbarBtnBase}
          onClick={e => { e.stopPropagation(); onMoveUp() }}
        >
          ↑
        </button>
        <button
          title="Descendre"
          style={toolbarBtnBase}
          onClick={e => { e.stopPropagation(); onMoveDown() }}
        >
          ↓
        </button>
        <button
          title="Supprimer"
          style={{ ...toolbarBtnBase, background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}
          onClick={e => { e.stopPropagation(); onRemove() }}
        >
          🗑
        </button>
      </div>

      {/* Block label badge */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 6,
          left: 6,
          background: '#7c3aed',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 4,
          zIndex: 20,
          pointerEvents: 'none',
        }}>
          {def?.label || block.type}
        </div>
      )}

      {/* HTML Preview */}
      <div
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

const toolbarBtnBase: React.CSSProperties = {
  width: 28,
  height: 28,
  background: '#fff',
  border: '1px solid #e4e4e7',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#18181b',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}

// ─── Empty drop zone ──────────────────────────────────────────────────────────
function EmptyDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-empty' })
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        border: `2px dashed ${isOver ? '#7c3aed' : '#d1d5db'}`,
        borderRadius: 12,
        margin: 40,
        background: isOver ? '#f3e8ff' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
      <p style={{ fontSize: 15, color: isOver ? '#7c3aed' : '#6b7280', fontWeight: 600, margin: 0 }}>
        {isOver ? 'Déposez ici !' : 'Glissez votre premier bloc ici'}
      </p>
      <p style={{ fontSize: 13, color: '#9ca3af', margin: '8px 0 0' }}>
        ou cliquez sur un bloc dans le panneau gauche
      </p>
    </div>
  )
}

// ─── Canvas ───────────────────────────────────────────────────────────────────
export default function BuilderCanvas() {
  const { state, dispatch, removeBlock, moveBlock, selectBlock, addBlock } = useBuilder()
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const maxWidth =
    state.viewport === 'tablet' ? 768 :
    state.viewport === 'mobile' ? 375 :
    undefined

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)

    // Drag from palette to canvas
    if (activeId.startsWith('palette-')) {
      const blockType = active.data.current?.blockType as string
      if (blockType) {
        addBlock(blockType)
      }
      return
    }

    // Sortable reorder within canvas
    if (active.id !== over.id) {
      const oldIdx = state.blocks.findIndex(b => b.id === active.id)
      const newIdx = state.blocks.findIndex(b => b.id === over.id)
      if (oldIdx >= 0 && newIdx >= 0) {
        const reordered = arrayMove(state.blocks, oldIdx, newIdx)
        dispatch({ type: 'REORDER_BLOCKS', payload: reordered })
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <main
        ref={containerRef}
        onClick={() => selectBlock(null)}
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#f1f5f9',
          backgroundImage: [
            'repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(0,0,0,0.04) 19px,rgba(0,0,0,0.04) 20px)',
            'repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(0,0,0,0.04) 19px,rgba(0,0,0,0.04) 20px)',
          ].join(','),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '20px 0 60px',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth,
          background: '#fff',
          minHeight: 600,
          boxShadow: maxWidth
            ? '0 0 0 1px rgba(0,0,0,0.1),0 8px 32px rgba(0,0,0,0.12)'
            : 'none',
          borderRadius: maxWidth ? 12 : 0,
          overflow: 'hidden',
          margin: maxWidth ? '0 auto' : 0,
          transition: 'max-width 0.3s ease',
        }}>
          {state.blocks.length === 0 ? (
            <EmptyDropZone />
          ) : (
            <SortableContext
              items={state.blocks.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
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
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>
      </main>
    </DndContext>
  )
}
