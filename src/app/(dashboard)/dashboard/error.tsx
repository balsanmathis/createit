'use client'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: Props) {
  return (
    <div className="min-h-screen bg-[#080810] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Une erreur est survenue</h2>
        <p className="text-white/50 text-sm mb-6">
          {error.message || "Quelque chose s'est mal passé sur le dashboard."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Réessayer
          </button>
          <a
            href="/dashboard"
            className="glass border border-white/10 text-white/70 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Recharger
          </a>
        </div>
      </div>
    </div>
  )
}
