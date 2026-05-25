import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Site } from '@/types'
import SitesGrid from '@/components/dashboard/SitesGrid'
import BuilderSitesGrid from '@/components/dashboard/BuilderSitesGrid'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import PaymentSuccessToast from '@/components/dashboard/PaymentSuccessToast'
import { BLOCK_DEFS } from '@/lib/builder/blocks'
import type { Block } from '@/lib/builder/types'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return m?.[1]?.trim() ?? ''
}

function generateBuilderPreview(blocks: Block[], name: string): string {
  if (!blocks.length) {
    return `<!DOCTYPE html><html><body style="margin:0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f4f4f5"><p style="color:#a1a1aa;font-size:18px;font-weight:600">${name}</p></body></html>`
  }
  const body = blocks.map(block => {
    const def = BLOCK_DEFS.find(d => d.type === block.type)
    if (!def) return ''
    const style = block.style ?? {}
    const html = def.render(block.content, style)
    if (style.anchor) return html.replace(/^(<\w+)/, `$1 id="${style.anchor}"`)
    return html
  }).join('\n')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif}img{max-width:100%}</style></head><body>${body}</body></html>`
}

interface Props {
  searchParams: Promise<{ success?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const isAdmin = user.email === ADMIN_EMAIL

    const [sitesResult, profileResult, subscriptionResult, builderSitesResult] = await Promise.all([
      supabase.from('sites').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').single(),
      supabase.from('builder_sites').select('id, name, blocks, created_at, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }),
    ])

    const sites = sitesResult.data as Site[] | null
    const profile = profileResult.data
    const subscription = subscriptionResult.data
    const canGenerate = isAdmin || !!subscription
    const builderSites = (builderSitesResult.data ?? []).map(s => ({
      ...s,
      previewHtml: generateBuilderPreview(Array.isArray(s.blocks) ? s.blocks as Block[] : [], s.name),
    }))

    const tokensUsed = profile?.tokens_used ?? 0
    const tokensLimit = profile?.tokens_limit ?? 8_000
    const tokensRemaining = Math.max(0, tokensLimit - tokensUsed)
    const tokenPct = tokensLimit > 0 ? Math.round((tokensRemaining / tokensLimit) * 100) : 0

    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {params.success === '1' && <PaymentSuccessToast />}

        <DashboardSidebar />

        <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--fg)' }}>
                  Mes sites
                </h1>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                  {sites?.length || 0} site{(sites?.length || 0) !== 1 ? 's' : ''} créé{(sites?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <Link
                href="/dashboard/nouveau"
                className={`flex items-center gap-2 text-white font-semibold px-4 md:px-5 py-2.5 rounded-xl transition-all text-sm btn-accent ${!canGenerate ? 'opacity-40 pointer-events-none' : ''}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Nouveau site</span>
                <span className="sm:hidden">Nouveau</span>
              </Link>
            </div>

            {/* Stats row */}
            {!isAdmin && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>Sites créés</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>{sites?.length || 0}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>Plan actuel</p>
                  <p className="text-sm font-semibold capitalize" style={{ color: 'var(--accent)' }}>
                    {subscription ? (profile?.plan || 'Starter') : 'Gratuit'}
                  </p>
                </div>
                <div className="rounded-xl p-4 col-span-2 sm:col-span-1" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Tokens restants</p>
                    <p className="text-xs font-semibold" style={{ color: tokenPct > 20 ? 'var(--accent)' : '#ef4444' }}>
                      {tokenPct}%
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${tokenPct}%`,
                        background: tokenPct > 50 ? 'var(--accent)' : tokenPct > 20 ? '#f97316' : '#ef4444',
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--fg-subtle)' }}>
                    {tokensRemaining.toLocaleString('fr-FR')} / {tokensLimit.toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            )}

            {/* Admin banner */}
            {isAdmin && (
              <div className="rounded-2xl p-4 mb-8 flex items-center gap-3"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <span className="text-lg">⚡</span>
                <p className="text-sm" style={{ color: '#b45309' }}>Mode admin actif — génération illimitée.</p>
              </div>
            )}

            {/* No plan CTA */}
            {!isAdmin && !subscription && (
              <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="font-semibold mb-1" style={{ color: 'var(--fg)' }}>Aucun plan actif</p>
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    Choisissez un plan pour générer des sites sans limite.
                  </p>
                </div>
                <Link
                  href="/tarifs"
                  className="shrink-0 text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--accent)' }}
                >
                  Voir les plans
                </Link>
              </div>
            )}

            {/* Builder sites section */}
            {builderSites.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>Sites Builder</h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      🎨 Builder
                    </span>
                  </div>
                  <Link href="/builder" className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    + Nouveau →
                  </Link>
                </div>
                <BuilderSitesGrid sites={builderSites} />
              </div>
            )}

            {/* AI site grid */}
            {sites && sites.length > 0 ? (
              <>
                {builderSites.length > 0 && (
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--fg)' }}>Sites IA</h2>
                )}
                <SitesGrid
                  sites={sites.map((site) => ({
                    id: site.id,
                    name: site.name,
                    title: extractTitle(site.html_content),
                    created_at: site.created_at,
                    previewHtml: site.html_content ?? undefined,
                  }))}
                />
              </>
            ) : builderSites.length === 0 ? (
              <div className="text-center py-16 md:py-24">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--accent-light)' }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--fg)' }}>Aucun site créé</h3>
                <p className="text-sm px-4 mb-6" style={{ color: 'var(--fg-muted)' }}>
                  Créez votre premier site web en quelques secondes avec l&apos;IA
                </p>
                {canGenerate && (
                  <Link
                    href="/dashboard/nouveau"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm"
                    style={{ background: 'var(--accent)' }}
                  >
                    Générer mon premier site
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    )
  } catch {
    redirect('/auth/login')
  }
}
