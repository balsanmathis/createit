'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

export default function ThemeToggle({ className }: Props) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className={cn('w-9 h-9', className)} />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
        'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)]',
        className,
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
