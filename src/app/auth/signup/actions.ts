'use server'

import { createClient } from '@supabase/supabase-js'

export async function signUpAdmin(email: string, password: string): Promise<{ error: string | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('[signUpAdmin] SUPABASE_URL:', url ? `${url.slice(0, 30)}... (len=${url.length})` : 'UNDEFINED')
  console.log('[signUpAdmin] SERVICE_ROLE_KEY:', serviceKey ? `${serviceKey.slice(0, 8)}... (len=${serviceKey.length})` : 'UNDEFINED')

  if (!url || !serviceKey) {
    return { error: `Variables manquantes: URL=${!!url} SERVICE_KEY=${!!serviceKey}` }
  }

  const supabase = createClient(url, serviceKey)

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.log('[signUpAdmin] createUser error:', error.message)
    return { error: error.message }
  }

  console.log('[signUpAdmin] createUser success for:', email)
  return { error: null }
}
