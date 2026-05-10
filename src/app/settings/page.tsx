import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) redirect('/auth/login')

    const [profileResult, subscriptionResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
    ])

    return (
      <SettingsClient
        user={user}
        profile={profileResult.data}
        subscription={subscriptionResult.data}
      />
    )
  } catch {
    redirect('/auth/login')
  }
}
