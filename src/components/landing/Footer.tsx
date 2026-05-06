'use client'

import Link from 'next/link'

interface FooterProps {
  locale?: 'fr' | 'en'
}

export default function Footer({ locale = 'fr' }: FooterProps) {
  const year = new Date().getFullYear()

  const LINKS_FR = {
    product: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Tarifs', href: '#pricing' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Générer un site', href: '/generate' },
    ],
    company: [
      { label: 'À propos', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    legal: [
      { label: 'CGU', href: '#' },
      { label: 'Confidentialité', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  }

  const LINKS_EN = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Generate a site', href: '/generate' },
    ],
    company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#' },
    ],
    legal: [
      { label: 'Terms', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  }

  const links = locale === 'fr' ? LINKS_FR : LINKS_EN

  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">
                Create<span className="gradient-text">It</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              {locale === 'fr'
                ? 'Le générateur de sites web propulsé par l\'IA.'
                : 'The AI-powered website generator.'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {locale === 'fr' ? 'Produit' : 'Product'}
            </h4>
            <ul className="space-y-3">
              {links.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {locale === 'fr' ? 'Entreprise' : 'Company'}
            </h4>
            <ul className="space-y-3">
              {links.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              {locale === 'fr' ? 'Légal' : 'Legal'}
            </h4>
            <ul className="space-y-3">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {year} CreateIt. {locale === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}
          </p>
          <p className="text-sm text-white/20">
            {locale === 'fr' ? 'Propulsé par' : 'Powered by'}{' '}
            <span className="text-violet-400">Claude AI</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
