'use client'

import { useState, useRef, useEffect } from 'react'
import { useBuilder } from '@/lib/builder/context'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  // Block mode
  suggestedContent?: Record<string, string>
  // Site mode
  suggestedBlocks?: Block[]
  changedCount?: number
}

const QUICK_ACTIONS_BLOCK = [
  { label: 'Améliore ce texte', prompt: 'Améliore ce texte pour le rendre plus engageant et convaincant.' },
  { label: 'Plus professionnel', prompt: 'Rends ce contenu plus professionnel et formel pour un contexte B2B.' },
  { label: 'Version courte', prompt: 'Raccourcis et simplifie ce contenu pour un affichage percutant.' },
  { label: 'Génère une variante', prompt: 'Génère une variante créative et originale de ce contenu.' },
]

const QUICK_ACTIONS_SITE = [
  { label: 'Améliore tous les textes', prompt: 'Améliore tous les textes du site pour les rendre plus engageants, percutants et convaincants.' },
  { label: 'Thème sombre', prompt: 'Applique un thème sombre : fonds noirs/gris foncé (#111, #1a1a2e), textes blancs/clairs.' },
  { label: 'Thème violet', prompt: 'Applique un thème violet moderne : fonds violets (#7c3aed, #f3e8ff), accents violets.' },
  { label: 'Augmente les espacements', prompt: 'Augmente les paddingTop et paddingBottom de tous les blocs de 20px pour plus d\'air.' },
]

export default function AIAssistant() {
  const { state, dispatch, updateContent } = useBuilder()
  const [mode, setMode] = useState<'block' | 'site'>('site')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastApplied, setLastApplied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedBlock = state.blocks.find(b => b.id === state.selectedId)
  const blockDef = selectedBlock ? BLOCK_DEFS.find(d => d.type === selectedBlock.type) : null

  // Auto-switch to block mode when a block is selected
  useEffect(() => {
    if (selectedBlock) setMode('block')
  }, [selectedBlock?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendBlockMessage(prompt: string) {
    if (!prompt.trim() || loading || !selectedBlock) return
    const userMsg: ChatMessage = { role: 'user', content: prompt }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/builder/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          blockType: selectedBlock.type,
          currentContent: selectedBlock.content,
          action: 'improve',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur API')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Voici les modifications suggérées.',
        suggestedContent: data.content,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Erreur : ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  async function sendSiteMessage(prompt: string) {
    if (!prompt.trim() || loading || !state.blocks.length) return
    const userMsg: ChatMessage = { role: 'user', content: prompt }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/builder/ai-global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: state.blocks, prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur API')
      const changed = data.changedCount ?? 0
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: changed === 0
          ? 'Aucune modification détectée. Essaie une instruction plus précise (ex: "change le fond en bleu foncé", "améliore les titres").'
          : `${changed} bloc${changed > 1 ? 's' : ''} modifié${changed > 1 ? 's' : ''}. Aperçu prêt — applique ou ignore.`,
        suggestedBlocks: changed > 0 ? data.blocks : undefined,
        changedCount: changed,
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Erreur : ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  function sendMessage(prompt: string) {
    if (mode === 'block') sendBlockMessage(prompt)
    else sendSiteMessage(prompt)
  }

  function applyBlockContent(content: Record<string, string>) {
    if (!selectedBlock) return
    updateContent(selectedBlock.id, content)
  }

  function applySiteBlocks(blocks: Block[]) {
    dispatch({ type: 'REORDER_BLOCKS', payload: blocks })
    setLastApplied(true)
    setTimeout(() => setLastApplied(false), 8000)
  }

  if (!state.aiOpen) return null

  const canSend = input.trim() && !loading && (mode === 'site' ? state.blocks.length > 0 : !!selectedBlock)

  return (
    <>
      <div
        onClick={() => dispatch({ type: 'TOGGLE_AI' })}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 100 }}
      />

      <div style={{
        position: 'fixed', top: 52, right: 0, bottom: 0, width: 380,
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        zIndex: 101, display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }}>

        {/* Header */}
        <div style={{ padding: '14px 20px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--fg)' }}>✨ Assistant IA</h2>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_AI' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--fg-muted)', lineHeight: 1, padding: 4 }}
            >×</button>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 0, background: 'var(--bg)', borderRadius: 8, padding: 3, marginBottom: 12 }}>
            <button
              onClick={() => setMode('site')}
              style={{
                flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s',
                background: mode === 'site' ? 'var(--accent)' : 'transparent',
                color: mode === 'site' ? '#fff' : 'var(--fg-muted)',
              }}
            >
              🌐 Site entier
            </button>
            <button
              onClick={() => setMode('block')}
              style={{
                flex: 1, padding: '7px 0', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 6, transition: 'all 0.15s',
                background: mode === 'block' ? 'var(--accent)' : 'transparent',
                color: mode === 'block' ? '#fff' : 'var(--fg-muted)',
              }}
            >
              🎯 Bloc sélectionné
            </button>
          </div>
        </div>

        {/* Undo banner */}
        {lastApplied && (
          <div style={{ padding: '8px 14px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#15803d', flex: 1, fontWeight: 600 }}>✓ Modifications appliquées</span>
            <button
              onClick={() => { dispatch({ type: 'UNDO' }); setLastApplied(false) }}
              style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed', background: 'none', border: '1px solid #7c3aed', borderRadius: 6, padding: '2px 10px', cursor: 'pointer' }}
            >
              ↩ Annuler
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
          {mode === 'site' ? (
            <>
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Actions rapides — site ({state.blocks.length} blocs)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {QUICK_ACTIONS_SITE.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => sendSiteMessage(qa.prompt)}
                    disabled={loading || !state.blocks.length}
                    style={{
                      padding: '7px 8px', background: 'var(--accent-light)',
                      border: '1px solid var(--accent-ring)', borderRadius: 8,
                      color: 'var(--accent)', fontSize: 11, fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      textAlign: 'left', opacity: loading ? 0.5 : 1,
                    }}
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </>
          ) : selectedBlock ? (
            <>
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Actions — {blockDef?.label || selectedBlock.type}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {QUICK_ACTIONS_BLOCK.map(qa => (
                  <button
                    key={qa.label}
                    onClick={() => sendBlockMessage(qa.prompt)}
                    disabled={loading}
                    style={{
                      padding: '7px 8px', background: 'var(--accent-light)',
                      border: '1px solid var(--accent-ring)', borderRadius: 8,
                      color: 'var(--accent)', fontSize: 11, fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      textAlign: 'left', opacity: loading ? 0.5 : 1,
                    }}
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-muted)' }}>
              💡 Sélectionnez un bloc pour utiliser le mode bloc.
            </p>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, minHeight: 0 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--fg-subtle)', paddingTop: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {mode === 'site'
                  ? 'Décrivez les modifications à apporter à l\'ensemble du site.'
                  : 'Demandez-moi d\'améliorer le contenu du bloc sélectionné.'}
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '88%', padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                  color: msg.role === 'user' ? '#fff' : 'var(--fg)',
                  fontSize: 13, lineHeight: 1.6,
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  {msg.content}
                </div>
              </div>

              {/* Block mode: apply button */}
              {msg.role === 'assistant' && msg.suggestedContent && selectedBlock && mode === 'block' && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>
                    <strong style={{ color: 'var(--fg)' }}>Aperçu :</strong>
                    {Object.entries(msg.suggestedContent).slice(0, 3).map(([k, v]) => (
                      <div key={k} style={{ marginTop: 3 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{k}:</span>{' '}
                        <span>{String(v).slice(0, 60)}{String(v).length > 60 ? '…' : ''}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => applyBlockContent(msg.suggestedContent!)}
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}
                  >
                    ✓ Appliquer au bloc
                  </button>
                </div>
              )}

              {/* Site mode: apply button */}
              {msg.role === 'assistant' && msg.suggestedBlocks && mode === 'site' && (
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => applySiteBlocks(msg.suggestedBlocks!)}
                    style={{
                      background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
                      padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    ✓ Appliquer les modifications
                    {msg.changedCount ? <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '1px 8px', fontSize: 11 }}>{msg.changedCount} bloc{msg.changedCount > 1 ? 's' : ''}</span> : null}
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 5, padding: '10px 0', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, background: 'var(--accent)', borderRadius: '50%', animation: `aiBounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
              {mode === 'site' && <span style={{ fontSize: 12, color: 'var(--fg-muted)', marginLeft: 4 }}>Analyse du site…</span>}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          {mode === 'site' && !state.blocks.length && (
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center' }}>
              Ajoutez des blocs avant d'utiliser l'IA globale.
            </p>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
              }}
              placeholder={mode === 'site'
                ? 'Ex: Rends tous les textes plus percutants, applique un thème bleu…'
                : 'Ex: Améliore ce texte, rends-le plus accrocheur…'}
              rows={3}
              style={{
                flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 13, background: 'var(--bg)', color: 'var(--fg)', outline: 'none', resize: 'none', lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!canSend}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 14px', fontSize: 16, cursor: !canSend ? 'not-allowed' : 'pointer',
                opacity: !canSend ? 0.5 : 1, flexShrink: 0, height: 42,
              }}
            >↑</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes aiBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  )
}
