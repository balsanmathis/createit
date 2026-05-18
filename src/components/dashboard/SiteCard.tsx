'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface Props {
  id: string
  name: string
  title: string
  createdAt: string
}

function sanitizeForOffline(html: string): string {
  let r = html.trim()
  if (!r.toLowerCase().startsWith('<!doctype')) r = '<!DOCTYPE html>\n' + r
  if (!r.match(/<meta[^>]*charset/i))
    r = r.replace(/(<head[^>]*>)/i, '$1\n  <meta charset="UTF-8">')
  r = r.replace(/<link[^>]*href=["']https?:\/\/[^"']*["'][^>]*\/?>/gi, '')
  r = r.replace(/<link[^>]*href=["']\/\/[^"']*["'][^>]*\/?>/gi, '')
  r = r.replace(/@import\s+url\s*\([^)]*\)\s*;?/gi, '')
  r = r.replace(/@import\s+["'][^"']*["']\s*;?/gi, '')
  r = r.replace(/<script[^>]*src=["']https?:\/\/[^"']*["'][^>]*><\/script>/gi, '')
  r = r.replace(/<script[^>]*src=["']\/\/[^"']*["'][^>]*><\/script>/gi, '')
  const override = `<style id="__offline__">
html,body{background-color:#ffffff;color:#111111}
body{font-family:Arial,Helvetica,sans-serif;margin:0}
h1,h2,h3,h4,h5,h6{font-family:Georgia,'Times New Roman',serif}
</style>`
  r = r.replace(/(<\/head>)/i, override + '\n$1')
  r = r.replace(/<img([^>]*)>/gi, (match, attrs) =>
    /onerror/i.test(attrs) ? match : `<img${attrs} onerror="this.style.visibility='hidden'">`
  )
  return r
}

export default function SiteCard({ id, name, title, createdAt }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [iframeVisible, setIframeVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const displayTitle = title || name

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIframeVisible(true) },
      { threshold: 0.1, rootMargin: '100px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/sites/${id}/preview`)
      if (!res.ok) throw new Error('Fetch failed')
      const html = await res.text()
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      zip.file('index.html', sanitizeForOffline(html))
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${displayTitle.replace(/\s+/g, '-').toLowerCase()}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Site téléchargé !')
    } catch {
      toast.error('Erreur lors du téléchargement')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div ref={cardRef} className="group bg-white rounded-xl border border-[#e2e8f0] hover:border-[#cbd5e1] hover:-translate-y-0.5 transition-all duration-200 shadow-sm overflow-hidden flex flex-col">

      {/* Thumbnail */}
      <Link
        href={`/sites/${id}`}
        className="block relative overflow-hidden flex-shrink-0 bg-[#f1f5f9]"
        style={{ height: 160 }}
      >
        {iframeVisible ? (
          <iframe
            src={`/api/sites/${id}/preview`}
            title="Aperçu"
            sandbox="allow-scripts"
            loading="lazy"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '1280px',
              height: '640px',
              transform: 'scale(0.25)',
              transformOrigin: 'top left',
              border: 'none',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-[#eff6ff] flex items-center justify-center">
              <svg className="w-4 h-4 text-[#93c5fd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
              </svg>
            </div>
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(241,245,249,0.8))' }}
        />
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/sites/${id}`} className="block">
          <h3 className="font-semibold text-sm text-[#0f172a] leading-tight truncate group-hover:text-[#2563eb] transition-colors">
            {displayTitle}
          </h3>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {new Date(createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </Link>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/sites/${id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-[#eff6ff] transition-all"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Modifier
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#e2e8f0] text-xs font-medium text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-[#eff6ff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            )}
            {downloading ? 'Préparation…' : 'Télécharger'}
          </button>
        </div>
      </div>
    </div>
  )
}
