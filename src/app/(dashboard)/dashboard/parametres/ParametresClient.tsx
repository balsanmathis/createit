'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GlassCard from '@/components/ui/GlassCard'

interface Props {
  user: {
    id: string
    email: string
    plan?: string
    tokens_used?: number
    tokens_limit?: number
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--fg)' }}>{title}</h2>
      {children}
    </div>
  )
}

export default function ParametresClient({ user }: Props) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleDeleteAccount() {
    if (confirmDelete !== user.email) {
      toast.error("L'email saisi ne correspond pas.")
      return
    }
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erreur lors de la suppression du compte.')
        return
      }
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/?deleted=1')
    } catch {
      toast.error('Une erreur est survenue.')
    } finally {
      setDeleting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--fg)',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardSidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight mb-8" style={{ color: 'var(--fg)' }}>Paramètres</h1>

          <div className="space-y-8">
            {/* Profile */}
            <GlassCard className="p-6">
              <Section title="Compte">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-muted)' }}>Email</label>
                    <input type="email" value={user.email} readOnly style={{ ...inputStyle, opacity: 0.7 }} />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>Mot de passe</p>
                      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Modifiez votre mot de passe par email</p>
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      style={{ background: 'var(--accent-light)', color: 'var(--accent)', textDecoration: 'none' }}
                    >
                      Changer
                    </Link>
                  </div>
                </div>
              </Section>
            </GlassCard>

            {/* Session */}
            <GlassCard className="p-6">
              <Section title="Session">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>Déconnexion</p>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Vous serez redirigé vers la page d&apos;accueil</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                  >
                    {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
                  </button>
                </div>
              </Section>
            </GlassCard>

            {/* Danger zone */}
            <GlassCard className="p-6" style={{ border: '1px solid rgba(220,38,38,0.25)' }}>
              <Section title="Zone dangereuse">
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    La suppression de votre compte est <strong style={{ color: 'var(--fg)' }}>irréversible</strong>.
                    Toutes vos données (sites, historique) seront définitivement effacées.
                  </p>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--fg-muted)' }}>
                      Confirmez en saisissant votre email : <strong style={{ color: 'var(--fg)' }}>{user.email}</strong>
                    </label>
                    <input
                      type="email"
                      value={confirmDelete}
                      onChange={e => setConfirmDelete(e.target.value)}
                      placeholder={user.email}
                      style={{ ...inputStyle, marginBottom: 12 }}
                    />
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting || confirmDelete !== user.email}
                      className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: '#dc2626', color: '#fff' }}
                    >
                      {deleting ? 'Suppression…' : 'Supprimer mon compte'}
                    </button>
                  </div>
                </div>
              </Section>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
