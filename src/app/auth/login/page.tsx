'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthCard from '@/components/auth/AuthCard'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState(
    errorParam === 'missing_code' ? 'Lien invalide ou expiré.'
    : errorParam === 'exchange_failed' ? 'Erreur de connexion. Veuillez réessayer.'
    : errorParam ? 'Une erreur est survenue.'
    : ''
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (honeypot) {
      await new Promise(r => setTimeout(r, 1200))
      router.push(redirectTo)
      return
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--fg)',
    borderRadius: 8,
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  return (
    <>
      {error && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-muted)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="vous@exemple.com"
            style={inputStyle}
            onFocus={e => {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>Mot de passe</label>
            <Link href="/auth/forgot-password" className="text-xs transition-colors"
              style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}>
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={inputStyle}
            onFocus={e => {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-medium rounded-lg text-sm transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', height: 42, marginTop: 4 }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connexion…
            </span>
          ) : 'Se connecter'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
        Pas encore de compte ?{' '}
        <Link href="/auth/signup" className="font-medium transition-colors" style={{ color: 'var(--accent)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          Créer un compte
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <AuthCard title="Connexion" subtitle="Bon retour sur CreateIt">
      <Suspense fallback={<div className="h-48 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
