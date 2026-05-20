'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { EXAMPLES, SECTORS } from '@/data/examples'
import { cn } from '@/lib/utils'

interface Props {
  initialSector: string
}

export default function ExemplesGrid({ initialSector }: Props) {
  const [sector, setSector] = useState(initialSector)
  const router = useRouter()

  const filtered = sector === 'tous'
    ? EXAMPLES
    : EXAMPLES.filter(e => e.sector === sector)

  const handleFilter = (slug: string) => {
    setSector(slug)
    const url = slug === 'tous' ? '/exemples' : `/exemples?secteur=${slug}`
    router.push(url, { scroll: false })
  }

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {SECTORS.map(s => (
          <button
            key={s.slug}
            onClick={() => handleFilter(s.slug)}
            className="text-sm px-4 py-2 rounded-full font-medium transition-all duration-200"
            style={
              sector === s.slug
                ? { background: 'var(--accent)', color: '#fff' }
                : { background: 'var(--surface)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(ex => (
          <GlassCard key={ex.slug} hover className="overflow-hidden group">
            <Link href={`/exemples/${ex.slug}`} style={{ textDecoration: 'none' }}>
              {/* Image + chrome */}
              <div className="relative overflow-hidden" style={{ height: 200 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ex.img}
                  alt={ex.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Browser chrome bar */}
                <div
                  className="absolute inset-x-0 top-0 flex items-center gap-1.5 px-3 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(4px)' }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FC6358' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FEBC2E' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                  <span
                    className="flex-1 mx-2 h-4 rounded-sm text-[10px] flex items-center px-2 truncate"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    createit.app/sites/{ex.slug}
                  </span>
                </div>
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  style={{ background: 'rgba(124,58,237,0.72)' }}
                >
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    Voir cet exemple <ArrowRight size={14} />
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{ex.label}</p>
                  <span
                    className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                  >
                    {ex.sector}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{ex.desc}</p>
              </div>
            </Link>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-base" style={{ color: 'var(--fg-muted)' }}>
            Aucun exemple dans cette catégorie pour l&apos;instant.
          </p>
        </div>
      )}
    </>
  )
}
