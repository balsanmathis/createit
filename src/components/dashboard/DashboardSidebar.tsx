'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Sparkles, PenSquare, CreditCard, Settings,
  LogOut, BarChart2, Menu, X,
} from 'lucide-react'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit', starter: 'Starter', pro: 'Pro', agency: 'Agency',
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tokens, setTokens] = useState<{ used: number; limit: number; plan: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setIsAdmin(user.email === ADMIN_EMAIL)
      supabase
        .from('users')
        .select('tokens_used, tokens_limit, plan')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setTokens({ used: data.tokens_used ?? 0, limit: data.tokens_limit ?? 8000, plan: data.plan ?? 'free' })
        })
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/generate') return pathname.startsWith('/generate') || pathname.startsWith('/dashboard/nouveau')
    if (href === '/settings') return (pathname === '/settings' || pathname === '/dashboard/parametres') && !pathname.startsWith('/settings/subscription')
    if (href === '/settings/subscription') return pathname.startsWith('/settings/subscription') || pathname.startsWith('/dashboard/abonnement')
    if (href === '/editor') return pathname.startsWith('/editor')
    return pathname.startsWith(href)
  }

  function navStyle(active: boolean): React.CSSProperties {
    return active
      ? { background: '#eff6ff', color: '#2563eb', borderLeft: '3px solid #2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px', fontSize: 14, borderRadius: 8, textDecoration: 'none' }
      : { color: '#64748b', borderLeft: '3px solid transparent', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px', fontSize: 14, borderRadius: 8, textDecoration: 'none', background: 'transparent' }
  }

  const NAV_MAIN = [
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/generate', label: 'Créer un site', Icon: Sparkles },
    { href: '/editor', label: 'Modifier un site', Icon: PenSquare },
  ]

  const NAV_SECONDARY = [
    { href: '/settings/subscription', label: 'Mon abonnement', Icon: CreditCard },
    { href: '/settings', label: 'Paramètres', Icon: Settings },
  ]

  return (
    <>
      {/* Burger — mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#64748b' }}
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
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
        className={`fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ background: '#fff', borderRight: '1px solid #e2e8f0' }}
      >
        {/* Close — mobile */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
          style={{ color: '#64748b' }}
          aria-label="Fermer"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#0f172a' }}>
              Create<span style={{ color: '#2563eb' }}>It</span>
            </span>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-0.5 px-3">
            {NAV_MAIN.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={navStyle(isActive(href))}
                onMouseEnter={e => { if (!isActive(href)) (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isActive(href)) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 mx-4" style={{ borderTop: '1px solid #e2e8f0' }} />

          {/* Secondary nav */}
          <div className="flex flex-col gap-0.5 px-3">
            {NAV_SECONDARY.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={navStyle(isActive(href))}
                onMouseEnter={e => { if (!isActive(href)) (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isActive(href)) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              style={{ color: '#64748b', borderLeft: '3px solid transparent', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 13px', fontSize: 14, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.background = '#fef2f2'
                b.style.color = '#ef4444'
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.background = 'transparent'
                b.style.color = '#64748b'
              }}
            >
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>

          {/* Admin */}
          {isAdmin && (
            <>
              <div className="my-4 mx-4" style={{ borderTop: '1px solid #e2e8f0' }} />
              <div className="px-3">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>Admin</p>
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  style={navStyle(isActive('/admin'))}
                  onMouseEnter={e => { if (!isActive('/admin')) (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (!isActive('/admin')) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
                >
                  <BarChart2 size={16} />
                  Admin
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Token bar */}
        {tokens && !isAdmin && (() => {
          const remaining = Math.max(0, tokens.limit - tokens.used)
          const pct = tokens.limit > 0 ? (tokens.used / tokens.limit) * 100 : 100
          const barColor = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : '#2563eb'
          return (
            <div className="px-4 py-4" style={{ borderTop: '1px solid #e2e8f0' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                  Plan {PLAN_LABELS[tokens.plan] ?? tokens.plan}
                </span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: barColor }}>
                  {remaining.toLocaleString('fr-FR')} tokens
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: '#f1f5f9' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(2, 100 - pct)}%`, background: barColor }}
                />
              </div>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                {tokens.used.toLocaleString('fr-FR')} / {tokens.limit.toLocaleString('fr-FR')} utilisés
              </p>
            </div>
          )
        })()}
      </aside>
    </>
  )
}
