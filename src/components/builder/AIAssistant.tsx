'use client'

import { useState, useRef, useEffect } from 'react'
import { useBuilder } from '@/lib/builder/context'
import { BLOCK_DEFS } from '@/lib/builder/blocks'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  suggestedContent?: Record<string, string>
}

const QUICK_ACTIONS = [
  { label: 'Améliore ce texte', action: 'improve', prompt: 'Améliore ce texte pour le rendre plus engageant et convaincant.' },
  { label: 'Rends plus professionnel', action: 'improve', prompt: 'Rends ce contenu plus professionnel et formel pour un contexte B2B.' },
  { label: 'Optimise pour mobile', action: 'improve', prompt: 'Raccourcis et optimise ce contenu pour un affichage mobile (textes courts et percutants).' },
  { label: 'Génère une variante', action: 'generate', prompt: 'Génère une variante créative et originale de ce contenu.' },
]

export default function AIAssistant() {
  const { state, dispatch, updateContent } = useBuilder()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokensUsed, setTokensUsed] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedBlock = state.blocks.find(b => b.id === state.selectedId)
  const blockDef = selectedBlock ? BLOCK_DEFS.find(d => d.type === selectedBlock.type) : null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(prompt: string, action = 'improve') {
    if (!prompt.trim() || loading) return

    const userMessage: ChatMessage = { role: 'user', content: prompt }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/builder/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          blockType: selectedBlock?.type || 'unknown',
          currentContent: selectedBlock?.content || {},
          action,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erreur API')

      setTokensUsed(prev => prev + (data.tokensUsed || 0))

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message || 'Voici les modifications suggérées.',
        suggestedContent: data.content,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Désolé, une erreur s'est produite : ${err instanceof Error ? err.message : 'Erreur inconnue'}`,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  function applyContent(content: Record<string, string>) {
    if (!selectedBlock) return
    updateContent(selectedBlock.id, content)
  }

  if (!state.aiOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => dispatch({ type: 'TOGGLE_AI' })}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 100 }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 52,
        right: 0,
        bottom: 0,
        width: 380,
        background: 'var(--surface)',
        borderLeft: '1px solid var(--border)',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>✨ Assistant IA</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--fg-muted)' }}>
              {tokensUsed > 0 && `${tokensUsed} tokens utilisés`}
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_AI' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--fg-muted)', lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        </div>

        {/* Quick actions */}
        {selectedBlock && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Actions rapides — {blockDef?.label || selectedBlock.type}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {QUICK_ACTIONS.map(qa => (
                <button
                  key={qa.label}
                  onClick={() => sendMessage(qa.prompt, qa.action)}
                  disabled={loading}
                  style={{
                    padding: '8px 10px',
                    background: 'var(--accent-light)',
                    border: '1px solid var(--accent-ring)',
                    borderRadius: 8,
                    color: 'var(--accent)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    opacity: loading ? 0.6 : 1,
                    transition: 'all 0.15s',
                  }}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!selectedBlock && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-muted)' }}>
              💡 Sélectionnez un bloc pour utiliser les actions rapides.
            </p>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--fg-subtle)', paddingTop: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>
                Demandez-moi d&apos;améliorer votre contenu,<br />
                de générer des variantes ou d&apos;optimiser<br />
                vos textes pour votre audience.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <div style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg)',
                  color: msg.role === 'user' ? '#fff' : 'var(--fg)',
                  fontSize: 13,
                  lineHeight: 1.6,
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}>
                  {msg.content}
                </div>
              </div>

              {/* Apply button for assistant messages with content */}
              {msg.role === 'assistant' && msg.suggestedContent && selectedBlock && (
                <div style={{ marginTop: 8, paddingLeft: 0 }}>
                  <div style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 12,
                    color: 'var(--fg-muted)',
                    marginBottom: 8,
                  }}>
                    <strong style={{ color: 'var(--fg)' }}>Contenu suggéré :</strong>
                    {Object.entries(msg.suggestedContent).slice(0, 3).map(([k, v]) => (
                      <div key={k} style={{ marginTop: 4 }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{k}:</span>{' '}
                        <span style={{ color: 'var(--fg)' }}>{String(v).slice(0, 60)}{String(v).length > 60 ? '...' : ''}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => applyContent(msg.suggestedContent!)}
                    style={{
                      background: 'var(--accent)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    ✓ Appliquer ces modifications
                  </button>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 6, padding: '12px 0' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder="Décrivez vos modifications... (Entrée pour envoyer)"
              rows={3}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 13,
                background: 'var(--bg)',
                color: 'var(--fg)',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 16,
                cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                opacity: (!input.trim() || loading) ? 0.6 : 1,
                flexShrink: 0,
                height: 42,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  )
}
