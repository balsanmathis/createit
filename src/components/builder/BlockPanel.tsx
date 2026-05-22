'use client'

import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useBuilder } from '@/lib/builder/context'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import { TEMPLATES } from '@/lib/builder/templates'
import type { BlockCategory } from '@/lib/builder/types'

const CATEGORY_LABELS: Record<BlockCategory, string> = {
  layout: 'Mise en page',
  navigation: 'Navigation',
  hero: 'Hero',
  text: 'Texte',
  media: 'Médias',
  buttons: 'Boutons',
  cards: 'Cartes',
  sections: 'Sections',
  forms: 'Formulaires',
  effects: 'Effets',
}

const CATEGORY_ORDER: BlockCategory[] = [
  'layout', 'navigation', 'hero', 'text', 'media', 'buttons', 'cards', 'sections', 'forms', 'effects'
]

function DraggableBlockItem({ type, icon, label, onAdd }: {
  type: string
  icon: string
  label: string
  onAdd: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type: 'palette', blockType: type },
  })

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onAdd}
      title={`Ajouter : ${label}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 12px',
        background: isDragging ? 'var(--accent-light)' : 'transparent',
        border: '1px solid transparent',
        borderRadius: 8,
        cursor: 'grab',
        textAlign: 'left',
        transition: 'all 0.15s',
        opacity: isDragging ? 0.5 : 1,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--accent-light)'
        e.currentTarget.style.borderColor = 'var(--accent-ring)'
      }}
      onMouseLeave={e => {
        if (!isDragging) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.borderColor = 'transparent'
        }
      }}
    >
      <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--fg)', fontWeight: 500 }}>{label}</span>
    </button>
  )
}

export default function BlockPanel() {
  const { addBlock, dispatch, state } = useBuilder()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'blocks' | 'templates'>('blocks')
  const [expanded, setExpanded] = useState<Set<BlockCategory>>(new Set(['layout', 'hero', 'sections']))

  const filtered = BLOCK_DEFS.filter(d =>
    d.label.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = CATEGORY_ORDER.reduce<Record<BlockCategory, typeof filtered>>((acc, cat) => {
    acc[cat] = filtered.filter(d => d.category === cat)
    return acc
  }, {} as Record<BlockCategory, typeof filtered>)

  function toggleCategory(cat: BlockCategory) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  function loadTemplate(templateId: string) {
    const tpl = TEMPLATES.find(t => t.id === templateId)
    if (!tpl) return
    const blocks = tpl.blocks.map(b => ({
      ...b,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    }))
    dispatch({ type: 'LOAD', payload: { id: state.siteId || '', name: tpl.label, blocks, styles: {} } })
  }

  return (
    <aside style={{
      width: 280,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Search */}
      <div style={{ padding: '12px 12px 8px' }}>
        <input
          type="text"
          placeholder="🔍 Rechercher un bloc..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: 13,
            background: 'var(--bg)',
            color: 'var(--fg)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', margin: '0 12px' }}>
        {(['blocks', 'templates'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--fg-muted)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginBottom: -1,
            }}
          >
            {tab === 'blocks' ? '🧩 Blocs' : '📄 Templates'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 20px' }}>
        {activeTab === 'blocks' ? (
          CATEGORY_ORDER.map(cat => {
            const items = grouped[cat]
            if (items.length === 0) return null
            const isOpen = expanded.has(cat) || search.length > 0
            return (
              <div key={cat} style={{ marginBottom: 4 }}>
                <button
                  onClick={() => toggleCategory(cat)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '6px 8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 6,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--fg-subtle)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {isOpen && (
                  <div style={{ paddingLeft: 4 }}>
                    {items.map(def => (
                      <DraggableBlockItem
                        key={def.type}
                        type={def.type}
                        icon={def.icon}
                        label={def.label}
                        onAdd={() => addBlock(def.type)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 4px' }}>
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => loadTemplate(tpl.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '14px 16px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.background = 'var(--accent-light)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg)'
                }}
              >
                <div style={{ fontSize: 24 }}>{tpl.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>{tpl.label}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.4 }}>{tpl.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
