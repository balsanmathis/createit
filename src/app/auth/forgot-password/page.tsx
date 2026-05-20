'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import AuthCard from '@/components/auth/AuthCard'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthCard
        title="Email envoyé"
        subtitle="Vérifiez votre boîte de réception"
        backHref="/auth/login"
        backLabel="Retour à la connexion"
      >
        <div className="text-center py-4">
          <div className="text-4xl mb-4">✉️</div>
          <p className="text-sm mb-2" style={{ color: 'var(--fg)' }}>
            Un lien de réinitialisation a été envoyé à
          </p>
          <p className="text-sm font-semibold mb-4" style={{ color: 'var(--accent)' }}>{email}</p>
          <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            Le lien expire dans 1 heure. Vérifiez aussi vos spams.
          </p>
        </div>
      </AuthCard>
    )
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
    <AuthCard
      title="Mot de passe oublié ?"
      subtitle="Entrez votre email pour recevoir un lien de réinitialisation"
      backHref="/auth/login"
      backLabel="Retour à la connexion"
    >
      {error && (
        <div className="mb-5 rounded-lg px-4 py-3 text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              Envoi…
            </span>
          ) : 'Envoyer le lien'}
        </button>
      </form>
    </AuthCard>
  )
}
