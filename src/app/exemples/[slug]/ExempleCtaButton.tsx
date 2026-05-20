'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ExempleCtaButton({ prompt }: { prompt: string }) {
  return (
    <Link
      href={`/auth/signup?prompt=${encodeURIComponent(prompt)}`}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all"
      style={{ background: 'var(--accent)', textDecoration: 'none', boxShadow: '0 0 24px rgba(124,58,237,0.3)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
    >
      Créer un site similaire <ArrowRight size={14} />
    </Link>
  )
}
