'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const NAV_LINKS_FR = [
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#how-it-works', label: 'Comment ça marche' },
  { href: '#pricing', label: 'Tarifs' },
]
const NAV_LINKS_EN = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
]

interface NavbarProps {
  locale?: 'fr' | 'en'
}

export default function Navbar({ locale = 'fr' }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const links = locale === 'fr' ? NAV_LINKS_FR : NAV_LINKS_EN

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/5' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-shadow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Create<span className="gradient-text">It</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors px-3 py-1.5"
          >
            {locale === 'fr' ? 'Connexion' : 'Login'}
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-violet-500/25"
          >
            {locale === 'fr' ? 'Commencer' : 'Get Started'}
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}
