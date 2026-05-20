import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GlassCard from '@/components/ui/GlassCard'

export default async function EquipePage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/auth/login')

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <DashboardSidebar />
        <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>Équipe</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
              Collaborez sur vos sites avec votre équipe.
            </p>

            <GlassCard className="p-10 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <p className="text-base font-semibold mb-2" style={{ color: 'var(--fg)' }}>Bientôt disponible</p>
              <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
                La gestion d&apos;équipe sera disponible avec le plan Agency. Invitez des collaborateurs, gérez les accès et travaillez ensemble sur vos projets.
              </p>
              <Link
                href="/tarifs"
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)', textDecoration: 'none', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                Voir le plan Agency →
              </Link>
            </GlassCard>
          </div>
        </main>
      </div>
    )
  } catch {
    redirect('/auth/login')
  }
}
