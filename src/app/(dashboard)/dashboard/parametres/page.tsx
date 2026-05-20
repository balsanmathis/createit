import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ParametresClient from './ParametresClient'

export default async function ParametresPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) redirect('/auth/login')

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return <ParametresClient user={{ id: user.id, email: user.email ?? '', ...profile }} />
  } catch {
    redirect('/auth/login')
  }
}
