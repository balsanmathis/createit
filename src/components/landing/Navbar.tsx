'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavbarProps {
  locale?: 'fr' | 'en'
}

export default function Navbar({ locale = 'fr' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          height: 56,
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Create<span style={{ color: '#2563eb' }}>It</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#tarifs" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }} className="hover:text-[#0f172a] transition-colors">
              {locale === 'fr' ? 'Tarifs' : 'Pricing'}
            </a>
            <Link href="/auth/login" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }} className="hover:text-[#0f172a] transition-colors">
              {locale === 'fr' ? 'Connexion' : 'Login'}
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/auth/signup"
              style={{ fontSize: 14, fontWeight: 500, color: 'white', background: '#0f172a', padding: '8px 16px', borderRadius: 6, textDecoration: 'none' }}
              className="transition-colors hover:bg-[#1e293b]"
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0f172a')}
            >
              {locale === 'fr' ? 'Commencer' : 'Get Started'}
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5"
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5" style={{ background: '#0f172a' }} />
            <span className="block w-5 h-0.5" style={{ background: '#0f172a' }} />
            <span className="block w-5 h-0.5" style={{ background: '#0f172a' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col"
          style={{ background: '#ffffff', paddingTop: 56 }}
        >
          <div className="flex flex-col p-6 gap-1">
            <a
              href="#tarifs"
              onClick={() => setMobileOpen(false)}
              className="py-4 text-lg border-b"
              style={{ color: '#0f172a', textDecoration: 'none', borderColor: '#f1f5f9', display: 'block' }}
            >
              {locale === 'fr' ? 'Tarifs' : 'Pricing'}
            </a>
            <Link
              href="/auth/login"
              onClick={() => setMobileOpen(false)}
              className="py-4 text-lg border-b"
              style={{ color: '#0f172a', textDecoration: 'none', borderColor: '#f1f5f9', display: 'block' }}
            >
              {locale === 'fr' ? 'Connexion' : 'Login'}
            </Link>
            <div className="pt-6">
              <Link
                href="/auth/signup"
                onClick={() => setMobileOpen(false)}
                className="block text-center py-3 rounded-lg text-white font-medium"
                style={{ background: '#0f172a', textDecoration: 'none' }}
              >
                {locale === 'fr' ? 'Commencer gratuitement' : 'Get Started Free'}
              </Link>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-5 text-2xl"
            style={{ color: '#94a3b8', top: 68 }}
            aria-label="Fermer le menu"
          >×</button>
        </div>
      )}
    </>
  )
}
