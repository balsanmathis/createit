import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SiteEditor from '@/components/editor/SiteEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SitePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!site) notFound()

  return <SiteEditor site={site} />
}
