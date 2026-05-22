'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { TEMPLATES } from '@/lib/builder/templates'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function BuilderSelectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth/login')
      } else {
        setAuthChecked(true)
      }
    })
  }, [router])

  async function handleSelectTemplate(templateId: string) {
    if (loading) return
    setLoading(templateId)

    try {
      const tpl = TEMPLATES.find(t => t.id === templateId)
      if (!tpl) return

      const blocks = tpl.blocks.map(b => ({ ...b, id: genId() }))

      const res = await fetch('/api/builder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tpl.label,
          blocks,
          styles: {},
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erreur lors de la création')
      }

      const data = await res.json()
      router.push(`/builder/${data.id}`)
    } catch (err) {
      console.error(err)
      setLoading(null)
    }
  }

  if (!authChecked) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ fontSize: 24 }}>⏳</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'system-ui,sans-serif' }}>
      {/* Header */}
      <header style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', textDecoration: 'none' }}>
          CreateIt
        </Link>
        <Link
          href="/dashboard"
          style={{ fontSize: 14, color: 'var(--fg-muted)', textDecoration: 'none', fontWeight: 500 }}
        >
          ← Dashboard
        </Link>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 999, marginBottom: 16 }}>
            Éditeur no-code
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--fg)', margin: '0 0 16px', lineHeight: 1.15 }}>
            Choisissez un template
          </h1>
          <p style={{ fontSize: 16, color: 'var(--fg-muted)', margin: 0 }}>
            Démarrez avec un template ou partez d&apos;une page vierge. Tout est personnalisable.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {TEMPLATES.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => handleSelectTemplate(tpl.id)}
              disabled={loading !== null}
              style={{
                background: loading === tpl.id ? 'var(--accent-light)' : 'var(--surface)',
                border: loading === tpl.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                borderRadius: 16,
                padding: '32px 28px',
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: loading !== null && loading !== tpl.id ? 0.6 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.12)'
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }
              }}
            >
              <div style={{ fontSize: 48 }}>{tpl.emoji}</div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fg)', margin: '0 0 6px' }}>
                  {tpl.label}
                  {loading === tpl.id && <span style={{ marginLeft: 8, fontSize: 14 }}>⏳</span>}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--fg-muted)', margin: 0, lineHeight: 1.5 }}>
                  {tpl.description}
                </p>
              </div>
              {tpl.blocks.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {Array.from(new Set(tpl.blocks.map(b => b.type.split('-')[0]))).slice(0, 4).map(cat => (
                    <span
                      key={cat}
                      style={{
                        background: 'var(--surface-2)',
                        color: 'var(--fg-muted)',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        textTransform: 'capitalize',
                      }}
                    >
                      {cat}
                    </span>
                  ))}
                  <span style={{ color: 'var(--fg-subtle)', fontSize: 11, fontWeight: 600, padding: '2px 4px' }}>
                    {tpl.blocks.length} blocs
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
