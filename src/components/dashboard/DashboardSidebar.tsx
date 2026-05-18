'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAIL = 'balsanmathis08@gmail.com'

const NAV_ITEMS = [
  { href: '/dashboard',      icon: '⊞',  label: 'Dashboard' },
  { href: '/generate',       icon: '✦',  label: 'Générer' },
  { href: '/prompt-builder', icon: '🪄', label: 'Créer un prompt' },
  { href: '/settings',       icon: '◎',  label: 'Paramètres' },
]

const AnalyticsIcon = () => (
  <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

interface Props {
  activeHref: string
  children?: React.ReactNode
}

export default function DashboardSidebar({ activeHref, children }: Props) {
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

  const navItems = isAdmin
    ? [
        ...NAV_ITEMS.slice(0, 3),
        { href: '/analytics', icon: null as null, label: 'Analytics' },
        NAV_ITEMS[3],
      ]
    : NAV_ITEMS

  return (
    <>
      {/* Burger button — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#64748b] hover:text-[#0f172a] transition-colors"
        aria-label="Ouvrir le menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-[#e2e8f0] flex flex-col p-6 z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#94a3b8] hover:text-[#0f172a] transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <Link href="/" className="flex items-center mb-10" style={{ textDecoration: 'none' }}>
          <span className="text-lg font-bold" style={{ color: '#0f172a', letterSpacing: '-0.3px' }}>
            Create<span style={{ color: '#2563eb' }}>It</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeHref === item.href
                  ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] font-medium'
                  : 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] border border-transparent'
              }`}
            >
              <span className="text-base flex items-center justify-center w-4">
                {item.icon === null ? <AnalyticsIcon /> : item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {children}

        {/* Token bar */}
        {tokens && !isAdmin && (() => {
          const remaining = Math.max(0, tokens.limit - tokens.used)
          const pct = tokens.limit > 0 ? (tokens.used / tokens.limit) * 100 : 100
          const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : '#2563eb'
          const textColor = pct > 80 ? '#dc2626' : pct > 50 ? '#ea580c' : '#2563eb'
          return (
            <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[#94a3b8]">Tokens</span>
                <span className="text-xs font-semibold" style={{ color: textColor }}>
                  {remaining.toLocaleString('fr-FR')} restants
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(0, 100 - pct)}%`, background: barColor }}
                />
              </div>
              <p className="text-xs text-[#94a3b8]">
                {tokens.used.toLocaleString('fr-FR')} / {tokens.limit.toLocaleString('fr-FR')} utilisés
              </p>
              {remaining === 0 && (
                <Link
                  href="/pricing"
                  className="mt-2 flex items-center justify-center text-xs font-semibold py-2 rounded-lg bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] hover:bg-[#dbeafe] transition-colors"
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
