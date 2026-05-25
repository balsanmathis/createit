'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Edit2, Download, Trash2 } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

interface BuilderSite {
  id: string
  name: string
  created_at: string
  updated_at: string
  previewHtml?: string
}

interface Props {
  sites: BuilderSite[]
}

function BuilderSiteCard({ site, onDelete }: { site: BuilderSite; onDelete: (id: string) => void }) {
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    if (exporting) return
    setExporting(true)
    try {
      const siteRes = await fetch(`/api/builder/${site.id}`)
      if (!siteRes.ok) throw new Error('Erreur chargement')
      const { site: data } = await siteRes.json()

      const res = await fetch('/api/builder/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: data.blocks, name: data.name }),
      })
      if (!res.ok) throw new Error('Erreur export')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${site.name.replace(/[^a-z0-9]/gi, '-')}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erreur lors de l\'export.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <GlassCard hover className="group flex flex-col overflow-hidden">
      {/* Preview */}
      <Link
        href={`/builder/${site.id}`}
        className="block relative flex-shrink-0 overflow-hidden"
        style={{ height: 180, background: 'var(--surface-2)' }}
        tabIndex={-1}
        aria-label={`Ouvrir dans le builder — ${site.name}`}
      >
        {/* Chrome bar */}
        <div
          className="absolute top-0 left-0 right-0 h-8 flex items-center gap-1.5 px-3 z-10"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FC6358' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
          <div className="flex-1 mx-2 h-5 rounded" style={{ background: 'var(--surface-2)' }} />
        </div>

        {/* Preview iframe — srcdoc avoids auth/network issues */}
        <div className="absolute inset-0 top-8 overflow-hidden">
          {site.previewHtml ? (
            <iframe
              srcDoc={site.previewHtml}
              title={site.name}
              sandbox="allow-scripts"
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '1024px', height: '576px',
                transform: 'scale(0.34)', transformOrigin: 'top left',
                border: 'none', pointerEvents: 'none',
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: 28 }}>🎨</span>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 top-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.22)' }}
        >
          <span
            className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.50)' }}
          >
            Ouvrir le builder →
          </span>
        </div>
      </Link>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--fg)' }}>
              {site.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-subtle)' }}>
              {new Date(site.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span
            className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            🎨 Builder
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-auto">
          <Link
            href={`/builder/${site.id}`}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 text-white"
            style={{ background: 'var(--accent)' }}
          >
            <Edit2 size={11} />
            Éditer
          </Link>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)', background: 'transparent' }}
          >
            <Download size={11} />
            {exporting ? '...' : 'Exporter'}
          </button>

          <button
            onClick={() => onDelete(site.id)}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150"
            style={{ borderColor: 'var(--border)', color: '#ef4444', background: 'transparent' }}
          >
            <Trash2 size={11} />
            Supprimer
          </button>
        </div>
      </div>
    </GlassCard>
  )
}

export default function BuilderSitesGrid({ sites: initial }: Props) {
  const router = useRouter()
  const [sites, setSites] = useState(initial)

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce site builder définitivement ?')) return
    setSites(prev => prev.filter(s => s.id !== id))
    try {
      const res = await fetch(`/api/builder/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error)
      }
      toast.success('Site supprimé.')
    } catch {
      toast.error('Erreur lors de la suppression.')
      router.refresh()
    }
  }

  if (!sites.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {sites.map(site => (
        <BuilderSiteCard key={site.id} site={site} onDelete={handleDelete} />
      ))}
    </div>
  )
}
