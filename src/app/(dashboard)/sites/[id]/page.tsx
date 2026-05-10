import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SiteEditor from '@/components/editor/SiteEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SitePage({ params }: Props) {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) redirect('/auth/login')

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (siteError || !site) notFound()

    return <SiteEditor site={site} />
  } catch {
    redirect('/auth/login')
  }
}
