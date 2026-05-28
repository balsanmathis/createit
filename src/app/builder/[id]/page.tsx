'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BuilderProvider, useBuilder } from '@/lib/builder/context'
import { useMobile } from '@/lib/builder/use-mobile'
import BuilderHeader from '@/components/builder/BuilderHeader'
import BlockPanel from '@/components/builder/BlockPanel'
import BuilderCanvas from '@/components/builder/BuilderCanvas'
import StylePanel from '@/components/builder/StylePanel'
import AIAssistant from '@/components/builder/AIAssistant'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

// ─── Preview HTML generator ───────────────────────────────────────────────────
function generatePreviewHtml(blocks: Block[], name: string): string {
  const bodyHtml = blocks.map(block => {
    const def = BLOCK_DEFS.find(d => d.type === block.type)
    if (!def) return ''
    const html = def.render(block.content, block.style)
    if (block.style.anchor) return html.replace(/^(<\w+)/, `$1 id="${block.style.anchor}"`)
    return html
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif}img{max-width:100%}</style>
</head>
<body>
${bodyHtml}
</body>
</html>`
}

// ─── Inner component ──────────────────────────────────────────────────────────
function BuilderEditor({ siteId }: { siteId: string }) {
  const { state, dispatch, undo, redo } = useBuilder()
  const router = useRouter()
  const isMobile = useMobile()
  const [mobilePanel, setMobilePanel] = useState<'blocks' | 'style' | null>(null)
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  // Auto-open style panel on mobile when a block is selected
  const prevSelectedRef = useRef<string | null>(null)
  useEffect(() => {
    if (isMobile && state.selectedId && state.selectedId !== prevSelectedRef.current) {
      setMobilePanel('style')
    }
    prevSelectedRef.current = state.selectedId
  }, [state.selectedId, isMobile])

  // Load site on mount
  useEffect(() => {
    fetch(`/api/builder/${siteId}`)
      .then(async res => {
        if (res.status === 401) { router.replace('/auth/login'); return }
        if (res.status === 404) { router.replace('/builder'); return }
        if (!res.ok) throw new Error('Erreur chargement')
        const data = await res.json()
        dispatch({ type: 'LOAD', payload: data.site })
      })
      .catch(err => console.error('Builder load error:', err))
  }, [siteId, dispatch, router])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((ctrl && e.key === 'y') || (ctrl && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_BLOCK', payload: null })
        if (stateRef.current.aiOpen) dispatch({ type: 'TOGGLE_AI' })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [undo, redo, dispatch])

  const performSave = useCallback(async () => {
    const s = stateRef.current
    if (s.saving || !s.siteId) return
    dispatch({ type: 'SET_SAVING', payload: true })
    dispatch({ type: 'SET_SAVED', payload: false })
    try {
      const res = await fetch('/api/builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.siteId, name: s.name, blocks: s.blocks, styles: {} }),
      })
      if (!res.ok) throw new Error('Erreur sauvegarde')
      dispatch({ type: 'SET_SAVED', payload: true })
      setTimeout(() => dispatch({ type: 'SET_SAVED', payload: false }), 3000)
    } catch (err) {
      console.error('Save error:', err)
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [dispatch])

  // Auto-save every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(performSave, 30_000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [performSave])

  const handleExport = useCallback(async () => {
    const s = stateRef.current
    try {
      const res = await fetch('/api/builder/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: s.blocks, name: s.name }),
      })
      if (!res.ok) throw new Error('Erreur export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${s.name.replace(/[^a-z0-9]/gi, '-')}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
  }, [])

  const handlePreview = useCallback(() => {
    const s = stateRef.current
    const html = generatePreviewHtml(s.blocks, s.name)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <BuilderHeader
        onSave={performSave}
        onExport={handleExport}
        onPreview={handlePreview}
        mobilePanel={mobilePanel}
        onToggleMobilePanel={p => setMobilePanel(prev => prev === p ? null : p)}
      />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!isMobile && <BlockPanel />}
        {isMobile && (
          <BlockPanel
            mobileOpen={mobilePanel === 'blocks'}
            onMobileClose={() => setMobilePanel(null)}
          />
        )}
        <BuilderCanvas onMobileOpenBlocks={() => setMobilePanel('blocks')} />
        {!isMobile && <StylePanel />}
        {isMobile && (
          <StylePanel
            mobileOpen={mobilePanel === 'style'}
            onMobileClose={() => setMobilePanel(null)}
          />
        )}
      </div>
      <AIAssistant />
    </div>
  )
}

// ─── Page (wraps with provider) ───────────────────────────────────────────────
export default function BuilderPage() {
  const params = useParams()
  const siteId = params?.id as string
  if (!siteId) return null

  return (
    <BuilderProvider>
      <BuilderEditor siteId={siteId} />
    </BuilderProvider>
  )
}
