'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  profile: { plan: string | null; sites_used_this_month: number } | null
  subscription: { plan: string; status: string; current_period_end: string } | null
}

export default function SettingsClient({ user, profile, subscription }: Props) {
  const router = useRouter()
  const [locale, setLocaleState] = useState<'fr' | 'en'>(() => {
    if (typeof document !== 'undefined') {
      const c = document.cookie.split('; ').find(r => r.startsWith('locale='))?.split('=')[1]
      return (c === 'en' ? 'en' : 'fr')
    }
    return 'fr'
  })
  const [loggingOut, setLoggingOut] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleLocaleChange = (lang: 'fr' | 'en') => {
    document.cookie = `locale=${lang}; path=/; max-age=31536000`
    setLocaleState(lang)
    toast.success(lang === 'fr' ? 'Langue changée en français' : 'Language changed to English')
    setTimeout(() => window.location.reload(), 500)
  }

  const handleManageSubscription = async () => {
    setOpeningPortal(true)
    try {
      const res = await fetch('/api/stripe/create-portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error('Erreur lors de l\'ouverture du portail')
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setOpeningPortal(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white">
      <aside className="fixed left-0 top-0 h-full w-64 glass border-r border-white/5 flex flex-col p-6 z-40">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-lg font-bold">Create<span className="gradient-text">It</span></span>
        </Link>
        <nav className="flex-1 space-y-1">
          {[
            { href: '/dashboard',      icon: '⊞', label: 'Dashboard' },
            { href: '/generate',       icon: '✦', label: 'Générer' },
            { href: '/prompt-builder', icon: '🪄', label: 'Créer un prompt' },
            { href: '/settings',       icon: '◎', label: 'Paramètres', active: true },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                item.active
                  ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-white mb-8">Paramètres</h1>

            <div className="space-y-6">
              {/* Profile */}
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-semibold text-white mb-4">Profil</h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user.email}</p>
                    <p className="text-sm text-white/40">ID: {user.id.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>

              {/* Language */}
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-semibold text-white mb-4">Langue / Language</h2>
                <div className="flex gap-3">
                  {(['fr', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLocaleChange(lang)}
                      className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                        locale === lang
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                          : 'glass border border-white/10 text-white/60 hover:text-white hover:border-violet-500/30'
                      }`}
                    >
                      {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscription */}
              <div className="glass rounded-2xl p-6 border border-white/5">
                <h2 className="text-lg font-semibold text-white mb-4">Abonnement</h2>
                {subscription ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-white capitalize">{subscription.plan}</p>
                        <p className="text-sm text-white/40">
                          Statut: <span className={subscription.status === 'active' ? 'text-green-400' : 'text-red-400'}>{subscription.status}</span>
                        </p>
                        <p className="text-sm text-white/40">
                          Expire le: {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-sm text-white/40">
                          Sites ce mois: {profile?.sites_used_this_month || 0}
                        </p>
                      </div>
                      <button
                        onClick={handleManageSubscription}
                        disabled={openingPortal}
                        className="glass border border-violet-500/30 text-violet-300 hover:text-violet-200 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {openingPortal ? 'Ouverture...' : 'Gérer →'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-white/50">Aucun abonnement actif</p>
                    <Link
                      href="/pricing"
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
                    >
                      Voir les plans
                    </Link>
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className="glass rounded-2xl p-6 border border-red-500/10">
                <h2 className="text-lg font-semibold text-white mb-4">Zone dangereuse</h2>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2 glass border border-red-500/20 text-red-400 hover:text-red-300 hover:border-red-500/40 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {loggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
