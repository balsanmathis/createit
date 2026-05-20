import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExportClient from './ExportClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ExportPage({ params }: Props) {
  const { id } = await params

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) redirect('/auth/login')

    const { data: site, error } = await supabase
      .from('sites')
      .select('id, name, html_content, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !site) notFound()

    return <ExportClient site={site} />
  } catch {
    redirect('/auth/login')
  }
}
