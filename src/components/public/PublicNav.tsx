'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ThemeToggle from '@/components/ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Exemples', href: '/exemples' },
  { label: 'Tarifs',   href: '/tarifs' },
  { label: 'À propos', href: '/a-propos' },
]

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: 60,
          background: scrolled ? 'var(--glass)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          boxShadow: scrolled ? 'var(--shadow)' : 'none',
        }}
      >
        <nav className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              Create<span style={{ color: 'var(--accent)' }}>It</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href + '/')
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm transition-colors"
                  style={{
                    color: active ? 'var(--accent)' : 'var(--fg-muted)',
                    fontWeight: active ? 600 : 400,
                    textDecoration: 'none',
                  }}
                >
                  {l.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm px-4 py-2 rounded-lg transition-all"
              style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--surface-2)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.background = 'transparent' }}
            >
              Connexion
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm px-4 py-2 rounded-lg font-semibold text-white transition-all"
              style={{ background: 'var(--accent)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              Commencer
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ color: 'var(--fg)' }}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 flex flex-col pt-[60px]"
            style={{ background: 'var(--glass)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          >
            <div className="flex flex-col p-6">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-4 text-xl font-medium border-b"
                  style={{ color: 'var(--fg)', textDecoration: 'none', borderColor: 'var(--border)' }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="py-4 text-xl font-medium border-b"
                style={{ color: 'var(--fg)', textDecoration: 'none', borderColor: 'var(--border)' }}
              >
                Connexion
              </Link>
              <div className="pt-6">
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center py-4 rounded-2xl text-white font-bold text-base"
                  style={{ background: 'var(--accent)', textDecoration: 'none' }}
                >
                  Commencer gratuitement
                </Link>
              </div>
              <div className="pt-5 flex items-center gap-2">
                <ThemeToggle />
                <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>Thème</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
