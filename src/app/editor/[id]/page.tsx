import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditorClient from './EditorClient'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: site }, { data: profile }] = await Promise.all([
    supabase.from('sites').select('id,name,html_content,prompt').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('users').select('tokens_used,tokens_limit').eq('id', user.id).single(),
  ])

  if (!site) redirect('/dashboard')

  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <EditorClient
      siteId={site.id}
      siteName={site.name}
      initialHtml={site.html_content ?? ''}
      prompt={site.prompt ?? ''}
      tokensUsed={isAdmin ? -1 : (profile?.tokens_used ?? 0)}
      tokensLimit={isAdmin ? -1 : (profile?.tokens_limit ?? 0)}
    />
  )
}
