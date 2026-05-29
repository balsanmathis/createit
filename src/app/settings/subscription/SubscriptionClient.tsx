'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Props {
  planKey: string
  plan: { label: string; color: string; price: string; tokens: string }
  tokensUsed: number
  tokensLimit: number
  hasSubscription: boolean
  isCanceling: boolean
  cancelAt: string | null
  invoices: { id: string; amount: number; date: string; status: string }[]
  email: string
}

const CANCEL_REASONS = [
  'Trop cher',
  "Je n'utilise plus",
  'Manque de fonctionnalités',
  'Problème technique',
  'Autre',
]

export default function SubscriptionClient({
  planKey, plan, tokensUsed, tokensLimit, hasSubscription,
  isCanceling, cancelAt, invoices, email,
}: Props) {
  const [cancelModal, setCancelModal] = useState(false)
  const [cancelStep, setCancelStep] = useState<1 | 2>(1)
  const [reason, setReason] = useState('')
  const [canceling, setCanceling] = useState(false)
  const [reactivating, setReactivating] = useState(false)
  const [canceled, setCanceled] = useState(isCanceling)
  const [cancelDate, setCancelDate] = useState(cancelAt)

  const tokensRemaining = Math.max(0, tokensLimit - tokensUsed)
  const tokenPct = tokensLimit > 0 ? Math.round((tokensRemaining / tokensLimit) * 100) : 0

  async function openPortal() {
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      const json = await res.json()
      if (json?.url) window.location.href = json.url
      else toast.error('Impossible d\'ouvrir le portail client.')
    } catch { toast.error('Une erreur est survenue.') }
  }

  async function confirmCancel() {
    setCanceling(true)
    try {
      const res = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la résiliation')
      setCanceled(true)
      if (data.cancelAt) {
        setCancelDate(new Date(data.cancelAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
      }
      setCancelModal(false)
      toast.success('Votre résiliation a été prise en compte.')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setCanceling(false)
    }
  }

  async function reactivate() {
    setReactivating(true)
    try {
      const res = await fetch('/api/subscription/reactivate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la réactivation')
      setCanceled(false)
      setCancelDate(null)
      toast.success('Votre abonnement a été réactivé !')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setReactivating(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 24, marginBottom: 20,
  }

  return (
    <>
      {/* Canceling banner */}
      {canceled && cancelDate && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#ea580c', marginBottom: 2 }}>
              Votre abonnement se termine le {cancelDate}
            </p>
            <p style={{ fontSize: 13, color: '#9a3412' }}>
              Après cette date, votre compte passe automatiquement en plan gratuit.
            </p>
          </div>
          <button
            onClick={reactivate}
            disabled={reactivating}
            style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 8, background: '#ea580c', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: reactivating ? 0.6 : 1 }}
          >
            {reactivating ? 'En cours…' : 'Réactiver'}
          </button>
        </div>
      )}

      {/* Plan actuel */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--fg)' }}>Plan actuel</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: plan.color }}>{plan.label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: plan.color + '18', color: plan.color }}>
                {canceled ? 'Résiliation en cours' : hasSubscription ? 'Actif' : 'Gratuit'}
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>{plan.price}</p>
          </div>
          {!hasSubscription && (
            <Link href="/tarifs" style={{ padding: '8px 16px', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              Voir les plans
            </Link>
          )}
        </div>
        {hasSubscription && (
          <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            {canceled ? `Accès maintenu jusqu'au ${cancelDate ?? '…'}` : 'Renouvellement automatique · Résiliez à tout moment'}
          </p>
        )}
      </div>

      {/* Utilisation tokens */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--fg)' }}>Utilisation des tokens</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            {tokensRemaining.toLocaleString('fr-FR')} restants / {tokensLimit.toLocaleString('fr-FR')} total
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: tokenPct > 20 ? 'var(--accent)' : '#ef4444' }}>
            {tokenPct}%
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${tokenPct}%`,
            background: tokenPct > 50 ? '#2563eb' : tokenPct > 20 ? '#f97316' : '#ef4444',
            transition: 'width 0.5s ease',
          }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>
          {tokensUsed.toLocaleString('fr-FR')} tokens utilisés ce cycle
        </p>
      </div>

      {/* Historique paiements */}
      {invoices.length > 0 && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--fg)' }}>Historique des paiements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invoices.map(inv => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: 14, color: 'var(--fg)', fontWeight: 500 }}>{inv.date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>{inv.amount.toFixed(2)} €</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#dcfce7', color: '#166534', fontWeight: 500 }}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gérer l'abonnement */}
      {hasSubscription && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--fg)' }}>Gérer l&apos;abonnement</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg)' }}>Portail Stripe</p>
                <p style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Modifier votre moyen de paiement, télécharger les factures</p>
              </div>
              <button onClick={openPortal} style={{ padding: '8px 16px', borderRadius: 8, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                Ouvrir →
              </button>
            </div>

            {!canceled && (
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => { setCancelModal(true); setCancelStep(1) }}
                  style={{ padding: '8px 16px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                >
                  Résilier mon abonnement
                </button>
                <p style={{ fontSize: 12, color: 'var(--fg-subtle)', marginTop: 6 }}>
                  Vous conservez l&apos;accès jusqu&apos;à la fin de la période payée.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Cancel Modal ───────────────────────────────────────── */}
      {cancelModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setCancelModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, zIndex: 1, boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setCancelModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            {cancelStep === 1 && (
              <>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>
                  Résilier votre abonnement ?
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
                  Vous conservez l&apos;accès au plan <strong>{plan.label}</strong> jusqu&apos;à la fin de votre période en cours.
                  Après cette date, votre compte passe automatiquement en plan gratuit (8 000 tokens/mois).
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setCancelModal(false)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Annuler
                  </button>
                  <button onClick={() => setCancelStep(2)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: '#dc2626', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Confirmer la résiliation
                  </button>
                </div>
              </>
            )}

            {cancelStep === 2 && (
              <>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
                  Une dernière chose…
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
                  Pour nous aider à améliorer CreateIt, pourquoi résiliez-vous ?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {CANCEL_REASONS.map(r => (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: `1px solid ${reason === r ? '#2563eb' : '#e2e8f0'}`, background: reason === r ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
                      <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: '#2563eb' }} />
                      <span style={{ fontSize: 14, color: '#0f172a' }}>{r}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setCancelStep(1)} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Retour
                  </button>
                  <button onClick={confirmCancel} disabled={canceling} style={{ flex: 1, padding: '10px 0', borderRadius: 8, background: canceling ? '#94a3b8' : '#dc2626', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: canceling ? 0.7 : 1 }}>
                    {canceling ? 'En cours…' : 'Terminer la résiliation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
