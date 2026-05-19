'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

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
      else toast.error("Erreur lors de l'ouverture du portail")
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setOpeningPortal(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DashboardSidebar activeHref="/settings" />

      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] mb-6 md:mb-8">Paramètres</h1>

          <div className="space-y-4 md:space-y-5">

            {/* Profile */}
            <div className="bg-white rounded-xl p-5 md:p-6 border border-[#e2e8f0] shadow-sm">
              <h2 className="text-base font-semibold text-[#0f172a] mb-4">Profil</h2>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-base font-bold text-[#2563eb] flex-shrink-0">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#0f172a] truncate text-sm">{user.email}</p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">ID : {user.id.slice(0, 8)}…</p>
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="bg-white rounded-xl p-5 md:p-6 border border-[#e2e8f0] shadow-sm">
              <h2 className="text-base font-semibold text-[#0f172a] mb-4">Langue / Language</h2>
              <div className="flex gap-3">
                {(['fr', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLocaleChange(lang)}
                    className="flex-1 py-2.5 rounded-lg font-medium transition-all text-sm border"
                    style={locale === lang
                      ? { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }
                      : { background: '#ffffff', color: '#64748b', borderColor: '#e2e8f0' }
                    }
                    onMouseEnter={(e) => { if (locale !== lang) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={(e) => { if (locale !== lang) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    {lang === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-xl p-5 md:p-6 border border-[#e2e8f0] shadow-sm">
              <h2 className="text-base font-semibold text-[#0f172a] mb-4">Abonnement</h2>
              {subscription ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-[#0f172a] capitalize text-sm">{subscription.plan}</p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#2563eb]">
                        {subscription.status === 'active' ? 'Actif' : subscription.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8]">
                      Expire le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                    </p>
                    {profile?.sites_used_this_month !== undefined && (
                      <p className="text-xs text-[#94a3b8]">
                        Utilisations ce mois : {profile.sites_used_this_month}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={openingPortal}
                    className="border border-[#e2e8f0] text-[#0f172a] hover:border-[#cbd5e1] hover:bg-[#f8fafc] px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 self-start sm:self-auto"
                  >
                    {openingPortal ? 'Ouverture…' : 'Gérer →'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-sm text-[#64748b]">Aucun abonnement actif</p>
                  <Link
                    href="/pricing"
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Voir les plans
                  </Link>
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl p-5 md:p-6 border border-[#fecaca]">
              <h2 className="text-base font-semibold text-[#0f172a] mb-4">Zone dangereuse</h2>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 border border-[#fecaca] text-red-600 hover:border-red-300 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {loggingOut ? 'Déconnexion…' : 'Se déconnecter'}
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
