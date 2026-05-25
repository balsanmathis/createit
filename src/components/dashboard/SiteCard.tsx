'use client'

import Link from 'next/link'
import { Edit2, Download, Copy, Trash2, Globe } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

export interface Site {
  id: string
  name: string
  title?: string
  created_at: string
  status?: 'brouillon' | 'publié'
  previewHtml?: string
}

interface Props {
  site: Site
  onDuplicate?: (id: string) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
}

export default function SiteCard({ site, onDuplicate, onDelete }: Props) {
  const displayTitle = site.title || site.name
  const status = site.status ?? 'brouillon'

  return (
    <GlassCard hover className="group flex flex-col overflow-hidden">

        {/* Browser chrome + preview */}
        <Link
          href={`/dashboard/sites/${site.id}`}
          className="block relative flex-shrink-0 overflow-hidden"
          style={{ height: 180, background: 'var(--surface-2)' }}
          tabIndex={-1}
          aria-label={`Ouvrir l'éditeur — ${displayTitle}`}
        >
          {/* Chrome bar */}
          <div
            className="absolute top-0 left-0 right-0 h-8 flex items-center gap-1.5 px-3 z-10"
            style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FC6358' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
            <div
              className="flex-1 mx-2 h-5 rounded"
              style={{ background: 'var(--surface-2)' }}
            />
          </div>

          {/* Preview iframe */}
          <div className="absolute inset-0 top-8 overflow-hidden">
            {site.previewHtml ? (
              <iframe
                srcDoc={site.previewHtml}
                title={displayTitle}
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
                <Globe size={28} style={{ color: 'var(--fg-subtle)' }} />
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
              Ouvrir l'éditeur →
            </span>
          </div>
        </Link>

        {/* Card body */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Meta */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="font-semibold text-sm leading-tight truncate"
                style={{ color: 'var(--fg)' }}
              >
                {displayTitle}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--fg-subtle)' }}>
                {new Date(site.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>

            {/* Status badge */}
            <span
              className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
              style={
                status === 'publié'
                  ? { background: 'rgba(34,197,94,0.12)', color: '#16a34a' }
                  : { background: 'var(--surface-2)', color: 'var(--fg-muted)' }
              }
            >
              {status === 'publié' ? '● Publié' : '○ Brouillon'}
            </span>
          </div>

          {/* Actions 2×2 */}
          <div className="grid grid-cols-2 gap-1.5 mt-auto">
            <Link
              href={`/dashboard/sites/${site.id}`}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 text-white"
              style={{ background: 'var(--accent)' }}
            >
              <Edit2 size={11} />
              Éditer
            </Link>

            <Link
              href={`/dashboard/sites/${site.id}/export`}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150"
              style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)', background: 'transparent' }}
            >
              <Download size={11} />
              Exporter
            </Link>

            <button
              onClick={() => onDuplicate?.(site.id)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150"
              style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)', background: 'transparent' }}
            >
              <Copy size={11} />
              Dupliquer
            </button>

            <button
              onClick={() => onDelete?.(site.id)}
              className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all duration-150"
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
