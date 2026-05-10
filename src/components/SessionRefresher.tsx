'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionRefresher() {
  useEffect(() => {
    let supabase: ReturnType<typeof createClient> | null = null
    try {
      supabase = createClient()
      supabase.auth.startAutoRefresh()
    } catch {
      // ignore — non-fatal
    }
    return () => {
      try { supabase?.auth.stopAutoRefresh() } catch { /* ignore */ }
    }
  }, [])

  return null
}
