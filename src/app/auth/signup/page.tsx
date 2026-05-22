'use client'

import { useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Turnstile } from '@marsidev/react-turnstile'
import AuthCard from '@/components/auth/AuthCard'

const PLAN_INFO: Record<string, { label: string; price: string }> = {
  starter: { label: 'Starter', price: '20 €/mois' },
  pro: { label: 'Pro', price: '45 €/mois' },
  agency: { label: 'Agency', price: '250 €/mois' },
}

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'guerrillamail.com', 'yopmail.com',
  'throwaway.email', 'sharklasers.com', 'trashmail.com', 'trashmail.me',
  'trashmail.net', 'maildrop.cc', 'discard.email', 'spam4.me',
  'dispostable.com', 'getairmail.com', 'fakeinbox.com', 'tempr.email',
])

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || ''
  const prompt = searchParams.get('prompt') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')

  const openTimeRef = useRef(Date.now())
  const planInfo = PLAN_INFO[plan.toLowerCase()]

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Honeypot check (client-side, instant)
    if (honeypot) {
      await new Promise(r => setTimeout(r, 1200))
      router.push('/dashboard')
      return
    }

    // Behavioral check: submitted in < 2s = likely bot
    if (Date.now() - openTimeRef.current < 2000) {
      await new Promise(r => setTimeout(r, 1200))
      router.push('/dashboard')
      return
    }

    // Disposable email check (client-side pre-validation)
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain && DISPOSABLE_DOMAINS.has(domain)) {
      setError('Veuillez utiliser une adresse email professionnelle')
      setLoading(false)
      return
    }

    // Call server-side signup route (rate limit + Turnstile + disposable email + account creation)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        turnstileToken,
        openTime: openTimeRef.current,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    // ok: true = silent bot rejection (fake success)
    // user: { id } = real user created

    if (json.user) {
      fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {})
    }

    if (plan) {
      try {
        const checkoutRes = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const checkoutJson = await checkoutRes.json()
        if (checkoutJson?.url) {
          window.location.href = checkoutJson.url
          return
        }
      } catch {
        // fall through
      }
      router.push(`/tarifs?plan=${plan}`)
    } else if (prompt) {
      router.push(`/dashboard/nouveau?prompt=${encodeURIComponent(prompt)}`)
    } else {
      router.push('/dashboard')
    }
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
      {planInfo && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm flex items-center gap-2"
          style={{ background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--fg)' }}>
          <span style={{ color: 'var(--accent)' }}>✦</span>
          <span>Plan <strong style={{ color: 'var(--accent)' }}>{planInfo.label}</strong> sélectionné — {planInfo.price}</span>
        </div>
      )}

      {prompt && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--fg)' }}>Votre prompt sera utilisé :</p>
          <p className="italic truncate">"{prompt}"</p>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#ef4444' }}>
          {error}
          {error.includes('Connectez-vous') && (
            <Link href="/auth/login" className="ml-1 underline" style={{ color: '#ef4444' }}>Se connecter</Link>
          )}
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
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-muted)' }}>
            Mot de passe <span style={{ color: 'var(--fg-subtle)' }}>(min. 8 caractères)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
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

        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
          <div className="flex justify-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onSuccess={setTurnstileToken}
              onError={() => setTurnstileToken('')}
              onExpire={() => setTurnstileToken('')}
              options={{ theme: 'auto', size: 'normal' }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken)}
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
              Création…
            </span>
          ) : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs" style={{ color: 'var(--fg-muted)' }}>
        En créant un compte vous acceptez nos{' '}
        <Link href="/legal/cgv" style={{ color: 'var(--accent)', textDecoration: 'none' }}>CGV</Link>
        {' '}et notre{' '}
        <Link href="/legal/confidentialite" style={{ color: 'var(--accent)', textDecoration: 'none' }}>politique de confidentialité</Link>.
      </p>

      <p className="mt-4 text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
        Déjà un compte ?{' '}
        <Link href="/auth/login" className="font-medium" style={{ color: 'var(--accent)', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          Se connecter
        </Link>
      </p>
    </>
  )
}

export default function SignupPage() {
  return (
    <AuthCard title="Créer un compte" subtitle="Commencez à créer des sites en quelques secondes">
      <Suspense fallback={<div className="h-48 rounded-lg animate-pulse" style={{ background: 'var(--surface)' }} />}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  )
}
