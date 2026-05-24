'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--accent-light)' }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
          Vérifiez votre email
        </h1>

        <p className="text-sm mb-1" style={{ color: 'var(--fg-muted)' }}>
          Un lien de confirmation a été envoyé à
        </p>
        {email && (
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--fg)' }}>
            {email}
          </p>
        )}

        <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
          Cliquez sur le lien dans l&apos;email pour activer votre compte et commencer à créer des sites.
        </p>

        <div
          className="rounded-xl p-4 mb-6 text-left text-xs space-y-1"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
        >
          <p>📬 Vous ne voyez pas l&apos;email ? Vérifiez vos spams.</p>
          <p>⏱ Le lien expire dans 24 heures.</p>
        </div>

        <Link
          href="/auth/login"
          className="text-sm"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Retour à la connexion →
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  )
}
