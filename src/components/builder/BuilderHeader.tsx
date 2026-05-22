'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useBuilder } from '@/lib/builder/context'
import type { Viewport } from '@/lib/builder/types'

interface BuilderHeaderProps {
  onSave: () => void
  onExport: () => void
  onPreview: () => void
}

export default function BuilderHeader({ onSave, onExport, onPreview }: BuilderHeaderProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useBuilder()
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(state.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setNameVal(state.name)
  }, [state.name])

  useEffect(() => {
    if (editingName && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingName])

  function commitName() {
    dispatch({ type: 'SET_NAME', payload: nameVal.trim() || 'Mon site' })
    setEditingName(false)
  }

  function setViewport(v: Viewport) {
    dispatch({ type: 'SET_VIEWPORT', payload: v })
  }

  const viewports: { key: Viewport; icon: string; title: string }[] = [
    { key: 'desktop', icon: '🖥️', title: 'Bureau' },
    { key: 'tablet', icon: '⬛', title: 'Tablette' },
    { key: 'mobile', icon: '📱', title: 'Mobile' },
  ]

  return (
    <header style={{
      height: 52,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      zIndex: 50,
      flexShrink: 0,
      gap: 12,
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>CreateIt</span>
      </Link>

      {/* Site name */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {editingName ? (
          <input
            ref={inputRef}
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={commitName}
            onKeyDown={e => {
              if (e.key === 'Enter') commitName()
              if (e.key === 'Escape') { setNameVal(state.name); setEditingName(false) }
            }}
            style={{
              border: '1px solid var(--accent)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              outline: 'none',
              background: 'var(--bg)',
              color: 'var(--fg)',
              width: 200,
            }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Cliquez pour renommer"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)',
              padding: '4px 10px',
              borderRadius: 6,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            {state.name}
          </button>
        )}
      </div>

      {/* Viewport toggle */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--surface-2)', borderRadius: 8, padding: 2 }}>
        {viewports.map(v => (
          <button
            key={v.key}
            title={v.title}
            onClick={() => setViewport(v.key)}
            style={{
              background: state.viewport === v.key ? 'var(--bg)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: 14,
              boxShadow: state.viewport === v.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {v.icon}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Annuler (Ctrl+Z)"
          style={actionBtnStyle(!canUndo)}
        >
          ↩
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Refaire (Ctrl+Y)"
          style={actionBtnStyle(!canRedo)}
        >
          ↪
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        <button onClick={onPreview} style={ghostBtnStyle}>
          👁 Aperçu
        </button>
        <button onClick={onExport} style={ghostBtnStyle}>
          📦 Exporter
        </button>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_AI' })}
          style={{
            ...ghostBtnStyle,
            background: state.aiOpen ? 'var(--accent-light)' : 'transparent',
            color: state.aiOpen ? 'var(--accent)' : 'var(--fg)',
          }}
        >
          ✨ IA
        </button>
        <button
          onClick={onSave}
          disabled={state.saving}
          style={{
            background: state.saved ? '#059669' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 16px',
            fontSize: 13,
            fontWeight: 700,
            cursor: state.saving ? 'not-allowed' : 'pointer',
            opacity: state.saving ? 0.7 : 1,
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        >
          {state.saving ? 'Sauvegarde...' : state.saved ? '✓ Sauvegardé' : '💾 Sauvegarder'}
        </button>
      </div>
    </header>
  )
}

const actionBtnStyle = (disabled: boolean): React.CSSProperties => ({
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '4px 8px',
  fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  color: 'var(--fg)',
  transition: 'all 0.15s',
})

const ghostBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '5px 12px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  color: 'var(--fg)',
  transition: 'all 0.15s',
}
