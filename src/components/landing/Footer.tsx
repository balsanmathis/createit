'use client'

import Link from 'next/link'

interface FooterProps {
  locale?: 'fr' | 'en'
}

export default function Footer({ locale = 'fr' }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '32px 24px' }}>
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Logo + tagline */}
        <div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
              Create<span style={{ color: '#2563eb' }}>It</span>
            </span>
          </Link>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
            {locale === 'fr' ? 'Créez des sites en quelques secondes.' : 'Build sites in seconds.'}
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link href="/pricing" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }} className="hover:text-[#0f172a] transition-colors">
            {locale === 'fr' ? 'Tarifs' : 'Pricing'}
          </Link>
          <Link href="/auth/login" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }} className="hover:text-[#0f172a] transition-colors">
            {locale === 'fr' ? 'Connexion' : 'Login'}
          </Link>
          <a href="mailto:hello@create-it.app" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }} className="hover:text-[#0f172a] transition-colors">
            Contact
          </a>
        </div>

        {/* Copyright */}
        <p style={{ fontSize: 13, color: '#94a3b8' }}>© {year} CreateIt</p>
      </div>
    </footer>
  )
}
