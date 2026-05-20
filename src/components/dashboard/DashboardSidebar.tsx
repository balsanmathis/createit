'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

const NAV_MAIN = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/dashboard/nouveau',
    label: 'Nouveau site',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9" />
        <path d="M18 2l4 4-4 4M22 6H14" />
      </svg>
    ),
  },
]

const NAV_ACCOUNT = [
  {
    href: '/dashboard/abonnement',
    label: 'Abonnement',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: '/dashboard/equipe',
    label: 'Équipe',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/parametres',
    label: 'Paramètres',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/aide',
    label: 'Aide',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
      </svg>
    ),
  },
]

const AnalyticsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

export default function DashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tokens, setTokens] = useState<{ used: number; limit: number } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setIsAdmin(user.email === ADMIN_EMAIL)
      supabase
        .from('users')
        .select('tokens_used, tokens_limit')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setTokens({ used: data.tokens_used, limit: data.tokens_limit })
        })
    })
  }, [])

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarStyle: React.CSSProperties = {
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
  }

  const activeStyle: React.CSSProperties = {
    background: 'var(--accent-light)',
    color: 'var(--accent)',
    fontWeight: 600,
  }

  const inactiveStyle: React.CSSProperties = {
    color: 'var(--fg-muted)',
  }

  return (
    <>
      {/* Burger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
        aria-label="Ouvrir le menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={sidebarStyle}
      >
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
          style={{ color: 'var(--fg-muted)' }}
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Create<span style={{ color: 'var(--accent)' }}>It</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {/* Main */}
          {NAV_MAIN.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={isActive(item.href) ? activeStyle : inactiveStyle}
              onMouseEnter={e => { if (!isActive(item.href)) e.currentTarget.style.background = 'var(--glass)' }}
              onMouseLeave={e => { if (!isActive(item.href)) e.currentTarget.style.background = 'transparent' }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-3" style={{ borderTop: '1px solid var(--border)' }} />

          {/* Account */}
          {NAV_ACCOUNT.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
              style={isActive(item.href) ? activeStyle : inactiveStyle}
              onMouseEnter={e => { if (!isActive(item.href)) e.currentTarget.style.background = 'var(--glass)' }}
              onMouseLeave={e => { if (!isActive(item.href)) e.currentTarget.style.background = 'transparent' }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {/* Admin */}
          {isAdmin && (
            <>
              <div className="my-3" style={{ borderTop: '1px solid var(--border)' }} />
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--fg-subtle)' }}>Admin</p>
              <Link
                href="/analytics"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={isActive('/analytics') ? activeStyle : inactiveStyle}
                onMouseEnter={e => { if (!isActive('/analytics')) e.currentTarget.style.background = 'var(--glass)' }}
                onMouseLeave={e => { if (!isActive('/analytics')) e.currentTarget.style.background = 'transparent' }}
              >
                <AnalyticsIcon />
                Analytics
              </Link>
            </>
          )}
        </nav>

        {/* Token bar */}
        {tokens && !isAdmin && (() => {
          const remaining = Math.max(0, tokens.limit - tokens.used)
          const pct = tokens.limit > 0 ? (tokens.used / tokens.limit) * 100 : 100
          const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : 'var(--accent)'
          const textColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : 'var(--accent)'
          return (
            <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: 'var(--fg-subtle)' }}>Tokens</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: textColor }}>
                  {remaining.toLocaleString('fr-FR')} restants
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(2, 100 - pct)}%`, background: barColor }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--fg-subtle)' }}>
                {tokens.used.toLocaleString('fr-FR')} / {tokens.limit.toLocaleString('fr-FR')} utilisés
              </p>
              {remaining === 0 && (
                <Link
                  href="/tarifs"
                  className="mt-2 flex items-center justify-center text-xs font-semibold py-2 rounded-lg transition-colors"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  Obtenir plus de tokens →
                </Link>
              )}
            </div>
          )
        })()}
      </aside>
    </>
  )
}
