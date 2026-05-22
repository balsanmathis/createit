'use client'

import { useState, useRef, useCallback } from 'react'

interface Props {
  value: string
  onChange: (url: string) => void
}

type Tab = 'upload' | 'url' | 'unsplash'

const UNSPLASH_KEYWORDS = ['business', 'office', 'nature', 'city', 'food', 'technology', 'people', 'architecture']

export default function ImageUploader({ value, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('url')
  const [urlInput, setUrlInput] = useState(value || '')
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [unsplashResults, setUnsplashResults] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Format non supporté'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Max 5MB'); return }
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('siteId', 'builder')
      const res = await fetch('/api/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur upload')
      onChange(data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function searchUnsplash(q: string) {
    const keyword = q.trim() || 'abstract'
    const seeds = Array.from({ length: 9 }, (_, i) => i + 1)
    setUnsplashResults(seeds.map(i =>
      `https://source.unsplash.com/featured/400x300/?${encodeURIComponent(keyword)}&sig=${i}`
    ))
  }

  return (
    <div>
      {/* Preview */}
      {value && (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0', display: 'block' }} />
          <button
            onClick={() => { onChange(''); setUrlInput('') }}
            style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
          >×</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 8 }}>
        {(['upload', 'url', 'unsplash'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '6px 0', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent', color: tab === t ? '#2563eb' : '#94a3b8', fontSize: 11, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', marginBottom: -1 }}>
            {t === 'upload' ? '⬆ Upload' : t === 'url' ? '🔗 URL' : '🔍 Unsplash'}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? '#2563eb' : '#e2e8f0'}`, borderRadius: 6, padding: '16px 8px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#eff6ff' : '#f8fafc', transition: 'all 0.15s' }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
          <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px', lineHeight: 1.4 }}>
            {uploading ? 'Upload en cours...' : 'Glissez une image ou cliquez'}
          </p>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>JPG, PNG, WebP, GIF — max 5MB</span>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      )}

      {tab === 'url' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="https://exemple.com/image.jpg"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            style={inputSt}
          />
          <button onClick={() => { if (urlInput) onChange(urlInput) }} style={{ ...btnSt, flexShrink: 0 }}>OK</button>
        </div>
      )}

      {tab === 'unsplash' && (
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              type="text"
              placeholder="Rechercher (ex: business, nature)"
              value={unsplashQuery}
              onChange={e => setUnsplashQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') searchUnsplash(unsplashQuery) }}
              style={inputSt}
            />
            <button onClick={() => searchUnsplash(unsplashQuery)} style={{ ...btnSt, flexShrink: 0 }}>→</button>
          </div>
          {unsplashResults.length === 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {UNSPLASH_KEYWORDS.map(kw => (
                <button key={kw} onClick={() => { setUnsplashQuery(kw); searchUnsplash(kw) }} style={{ fontSize: 11, padding: '3px 8px', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', background: '#f8fafc', color: '#64748b' }}>{kw}</button>
              ))}
            </div>
          )}
          {unsplashResults.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {unsplashResults.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`unsplash ${i}`}
                  onClick={() => onChange(url)}
                  style={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '2px solid transparent', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#2563eb')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: 11, color: '#ef4444', margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}

const inputSt: React.CSSProperties = {
  flex: 1, padding: '0 8px', height: 32, border: '1px solid #e2e8f0', borderRadius: 5, fontSize: 12, outline: 'none', background: '#f8fafc', color: '#374151', minWidth: 0,
}

const btnSt: React.CSSProperties = {
  height: 32, padding: '0 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 600,
}
