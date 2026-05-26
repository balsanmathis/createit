'use client'

import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function HomeButton() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't render on the homepage itself or the dashboard root to avoid redundancy
  const isHome = pathname === '/'
  const isDashboardRoot = pathname === '/dashboard'
  if (isHome || isDashboardRoot) return null

  const handleClick = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      router.push(session ? '/dashboard' : '/')
    } catch {
      router.push('/')
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Accueil"
      title="Accueil"
      className="fixed z-[9999] flex items-center justify-center rounded-xl transition-all duration-200"
      style={{
        bottom: 20,
        right: 20,
        width: 44,
        height: 44,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--fg-muted)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = 'var(--accent)'
        el.style.color = '#fff'
        el.style.borderColor = 'var(--accent)'
        el.style.transform = 'scale(1.08)'
        el.style.boxShadow = '0 6px 20px rgba(124,58,237,0.35)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = 'var(--surface)'
        el.style.color = 'var(--fg-muted)'
        el.style.borderColor = 'var(--border)'
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    </button>
  )
}
