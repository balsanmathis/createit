'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import GlassCard from '@/components/ui/GlassCard'

export default function AbonnementActions({ hasSubscription }: { hasSubscription: boolean }) {
  const [loading, setLoading] = useState(false)

  async function openPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      const json = await res.json()
      if (json?.url) {
        window.location.href = json.url
      } else {
        toast.error('Impossible d\'ouvrir le portail client.')
      }
    } catch {
      toast.error('Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  if (!hasSubscription) return null

  return (
    <GlassCard className="p-6">
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--fg)' }}>Gérer l&apos;abonnement</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>Portail Stripe</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Modifier le moyen de paiement, télécharger les factures, résilier</p>
          </div>
          <button
            onClick={openPortal}
            disabled={loading}
            className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            {loading ? 'Chargement…' : 'Ouvrir →'}
          </button>
        </div>

        <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/tarifs" className="text-sm transition-colors" style={{ color: 'var(--fg-muted)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}>
            Changer de plan →
          </Link>
        </div>
      </div>
    </GlassCard>
  )
}
