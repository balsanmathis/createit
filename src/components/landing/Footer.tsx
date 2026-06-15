'use client'

import Link from 'next/link'

interface FooterProps {
  locale?: 'fr' | 'en'
}

export default function Footer({ locale = 'fr' }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '32px 24px' }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo + tagline */}
        <div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>
              Create<span style={{ color: 'var(--accent)' }}>It</span>
            </span>
          </Link>
          <p style={{ fontSize: 13, color: 'var(--fg-subtle)', marginTop: 4 }}>
            {locale === 'fr' ? 'Créez des sites en quelques secondes.' : 'Build sites in seconds.'}
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="/tarifs" style={{ fontSize: 14, color: 'var(--fg-muted)', textDecoration: 'none' }}>
            {locale === 'fr' ? 'Tarifs' : 'Pricing'}
          </Link>
          <Link href="/auth/login" style={{ fontSize: 14, color: 'var(--fg-muted)', textDecoration: 'none' }}>
            {locale === 'fr' ? 'Connexion' : 'Login'}
          </Link>
          <a href="mailto:createitapp@gmail.com" style={{ fontSize: 14, color: 'var(--fg-muted)', textDecoration: 'none' }}>
            Contact
          </a>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>© {year} CreateIt</p>
      </div>
    </footer>
  )
}
