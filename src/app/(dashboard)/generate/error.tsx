'use client'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GenerateError({ error, reset }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--error-light)', border: '1px solid var(--error-border)' }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--error)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--fg)' }}>Une erreur est survenue</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
          {error.message || 'La génération a échoué. Réessayez.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="text-white font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Réessayer
          </button>
          <a
            href="/dashboard"
            className="font-semibold px-6 py-3 rounded-xl transition-colors"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
