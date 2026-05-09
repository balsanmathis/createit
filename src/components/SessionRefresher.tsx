'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionRefresher() {
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.startAutoRefresh()
    return () => { supabase.auth.stopAutoRefresh() }
  }, [])

  return null
}
