'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AuroraBackground from '@/components/ui/AuroraBackground'
import GlassCard from '@/components/ui/GlassCard'

interface Props {
  title: string
  subtitle: string
  backHref?: string
  backLabel?: string
  children: React.ReactNode
}

export default function AuthCard({
  title,
  subtitle,
  backHref = '/',
  backLabel = 'Retour',
  children,
}: Props) {
  return (
    <AuroraBackground
      intensity="subtle"
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
    >
      <div className="w-full max-w-sm">
        {/* Back */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm mb-7 transition-colors"
          style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
        >
          <ArrowLeft size={13} />
          {backLabel}
        </Link>

        {/* Logo + heading */}
        <div className="text-center mb-7">
          <Link href="/" className="inline-block mb-5" style={{ textDecoration: 'none' }}>
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Create<span style={{ color: 'var(--accent)' }}>It</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--fg)' }}>{title}</h1>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{subtitle}</p>
        </div>

        {/* Glass card */}
        <GlassCard strong className="p-8">
          {children}
        </GlassCard>
      </div>
    </AuroraBackground>
  )
}
