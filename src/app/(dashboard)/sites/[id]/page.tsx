import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SiteEditor from '@/components/editor/SiteEditor'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'balsanmathis08@gmail.com'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SitePage({ params }: Props) {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) redirect('/auth/login')

    const [siteResult, profileResult] = await Promise.all([
      supabase.from('sites').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('users').select('tokens_used, tokens_limit').eq('id', user.id).single(),
    ])

    if (siteResult.error || !siteResult.data) notFound()

    const isAdmin    = user.email === ADMIN_EMAIL
    const tokensUsed  = profileResult.data?.tokens_used  ?? 0
    const tokensLimit = profileResult.data?.tokens_limit ?? 8_000

    return (
      <SiteEditor
        site={siteResult.data}
        tokensUsed={isAdmin ? -1 : tokensUsed}
        tokensLimit={isAdmin ? -1 : tokensLimit}
      />
    )
  } catch {
    redirect('/auth/login')
  }
}
