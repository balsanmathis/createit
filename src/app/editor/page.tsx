import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function EditorIndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: sites } = await supabase
    .from('sites')
    .select('id, name, created_at, html_content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <DashboardSidebar />
      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--fg)' }}>Modifier un site</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
            Sélectionnez un site pour l&apos;éditer visuellement
          </p>

          {(!sites || sites.length === 0) ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: '#eff6ff' }}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#2563eb">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--fg)' }}>Aucun site créé</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--fg-muted)' }}>
                Créez votre premier site IA pour commencer à l&apos;éditer
              </p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm"
                style={{ background: '#2563eb' }}
              >
                Créer un site →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.map(site => (
                <div
                  key={site.id}
                  className="rounded-2xl overflow-hidden flex flex-col"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  {/* Site preview */}
                  <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: '#f8f9fa', flexShrink: 0 }}>
                    <iframe
                      srcDoc={site.html_content ||
                        '<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;color:#94a3b8;font-family:system-ui">Aperçu</body></html>'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '1200px',
                        height: '750px',
                        transform: 'scale(0.22)',
                        transformOrigin: 'top left',
                        border: 'none',
                        pointerEvents: 'none',
                      }}
                      sandbox="allow-scripts"
                      title={site.name}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3
                      className="font-semibold text-sm mb-1 truncate"
                      style={{ color: 'var(--fg)' }}
                      title={site.name}
                    >
                      {site.name}
                    </h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>
                      Créé le {formatDate(site.created_at)}
                    </p>
                    <div className="mt-auto">
                      <Link
                        href={`/editor/${site.id}`}
                        className="block w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90"
                        style={{ background: '#2563eb', color: '#fff' }}
                      >
                        Modifier ce site
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
