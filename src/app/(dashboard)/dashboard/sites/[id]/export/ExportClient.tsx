'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GlassCard from '@/components/ui/GlassCard'
import { toast } from 'sonner'

interface Site {
  id: string
  name: string
  html_content: string
  created_at: string
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportClient({ site }: { site: Site }) {
  const [loading, setLoading] = useState<string | null>(null)

  function handleDownloadHTML() {
    setLoading('html')
    try {
      downloadFile(site.html_content, `${site.name || 'site'}.html`, 'text/html')
      toast.success('Fichier HTML téléchargé')
    } finally {
      setLoading(null)
    }
  }

  async function handleDownloadZIP() {
    setLoading('zip')
    try {
      const res = await fetch(`/api/sites/${site.id}/export`, { method: 'POST' })
      if (!res.ok) {
        toast.error("Erreur lors de la création du ZIP")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${site.name || 'site'}.zip`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('ZIP téléchargé')
    } catch {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(null)
    }
  }

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 20px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--fg)',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontSize: 14,
    transition: 'border-color 0.15s, background 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardSidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-2xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
            <Link href="/dashboard" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>Dashboard</Link>
            <span>/</span>
            <Link href={`/dashboard/sites/${site.id}`} style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}>{site.name}</Link>
            <span>/</span>
            <span style={{ color: 'var(--fg)' }}>Export</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>Exporter le site</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
            Téléchargez votre site pour l&apos;héberger où vous le souhaitez.
          </p>

          <GlassCard className="p-6 space-y-4">
            {/* HTML */}
            <button
              onClick={handleDownloadHTML}
              disabled={!!loading}
              style={btnBase}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
            >
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: 'var(--fg)' }}>Fichier HTML</p>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Un seul fichier, prêt à ouvrir dans un navigateur</p>
              </div>
              {loading === 'html' ? (
                <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0" style={{ color: 'var(--accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              )}
            </button>

            {/* ZIP */}
            <button
              onClick={handleDownloadZIP}
              disabled={!!loading}
              style={btnBase}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
            >
              <span className="text-2xl">📦</span>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: 'var(--fg)' }}>Archive ZIP</p>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Dossier décompressé avec index.html séparé</p>
              </div>
              {loading === 'zip' ? (
                <svg className="animate-spin w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0" style={{ color: 'var(--accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              )}
            </button>
          </GlassCard>

          <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
            <p className="font-medium mb-1" style={{ color: 'var(--fg)' }}>Hébergement gratuit</p>
            <p>Hébergez votre site sur <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>GitHub Pages</a>, <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Netlify</a> ou <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Vercel</a> gratuitement en quelques minutes.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
