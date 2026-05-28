'use client'
import { useState, useEffect } from 'react'

export function useMobile(): boolean | null {
  // null = unknown (server / before hydration), false = desktop, true = mobile
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}
