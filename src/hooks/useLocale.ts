'use client'

import { useState, useEffect } from 'react'

export function useLocale() {
  const [locale, setLocaleState] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    const saved = document.cookie
      .split('; ')
      .find((row) => row.startsWith('locale='))
      ?.split('=')[1]
    if (saved === 'fr' || saved === 'en') setLocaleState(saved)
  }, [])

  const setLocale = (lang: 'fr' | 'en') => {
    document.cookie = `locale=${lang}; path=/; max-age=31536000`
    setLocaleState(lang)
    window.location.reload()
  }

  return { locale, setLocale }
}
