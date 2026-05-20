'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXAMPLES = [
  'Un restaurant gastronomique à Paris avec réservations...',
  'Un portfolio de photographe de mariage minimaliste...',
  'Une boutique de bijoux artisanaux avec e-commerce...',
  "Un cabinet d'architecte avec galerie de projets...",
  'Une landing page SaaS qui convertit...',
  'Un coach sportif avec programmes et tarifs...',
]

interface Props {
  onSubmit?: (prompt: string) => void
  redirectTo?: string
  placeholder?: string[]
  className?: string
  size?: 'default' | 'large'
  autoFocus?: boolean
  buttonLabel?: string
  initialValue?: string
}

export default function PromptInput({
  onSubmit,
  redirectTo = '/auth/signup',
  placeholder = EXAMPLES,
  className,
  size = 'default',
  autoFocus = false,
  buttonLabel = 'Générer',
  initialValue = '',
}: Props) {
  const router = useRouter()
  const [value, setValue] = useState(initialValue)
  const [phIdx, setPhIdx] = useState(0)
  const [phVisible, setPhVisible] = useState(true)
  const [focused, setFocused] = useState(false)

  /* Typewriter cycle */
  useEffect(() => {
    const id = setInterval(() => {
      setPhVisible(false)
      setTimeout(() => {
        setPhIdx(i => (i + 1) % placeholder.length)
        setPhVisible(true)
      }, 380)
    }, 3400)
    return () => clearInterval(id)
  }, [placeholder.length])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (onSubmit) {
      onSubmit(trimmed)
    } else {
      router.push(`${redirectTo}?prompt=${encodeURIComponent(trimmed)}`)
    }
  }, [value, onSubmit, redirectTo, router])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const isLarge = size === 'large'
  const height = isLarge ? 76 : 60

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className="flex items-center w-full rounded-2xl transition-all duration-200"
        style={{
          height,
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: focused
            ? '2px solid var(--accent)'
            : '2px solid var(--border)',
          boxShadow: focused
            ? '0 0 0 4px var(--accent-ring), var(--shadow-lg)'
            : 'var(--shadow)',
        }}
      >
        {/* Input zone */}
        <div className="relative flex-1 overflow-hidden">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder=""
            autoFocus={autoFocus}
            className={cn(
              'w-full bg-transparent outline-none font-medium',
              isLarge ? 'text-base px-6' : 'text-sm px-5',
            )}
            style={{ height, color: 'var(--fg)' }}
          />

          {/* Animated placeholder */}
          {!value && (
            <span
              aria-hidden
              className={cn(
                'absolute top-1/2 -translate-y-1/2 pointer-events-none select-none',
                'transition-opacity duration-300',
                isLarge ? 'left-6 text-base' : 'left-5 text-sm',
                phVisible ? 'opacity-100' : 'opacity-0',
              )}
              style={{
                color: 'var(--fg-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                maxWidth: 'calc(100% - 24px)',
              }}
            >
              {placeholder[phIdx]}
            </span>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          aria-label={buttonLabel}
          className={cn(
            'm-2 flex items-center gap-2 font-semibold text-white rounded-xl',
            'transition-all duration-200 disabled:cursor-not-allowed',
            isLarge ? 'px-7 py-3.5 text-sm' : 'px-5 py-2.5 text-sm',
          )}
          style={{
            background: value.trim() ? 'var(--accent)' : 'var(--fg-subtle)',
            height: height - 16,
          }}
          onMouseEnter={e => {
            if (value.trim())
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--accent-hover)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = value.trim()
              ? 'var(--accent)'
              : 'var(--fg-subtle)'
          }}
        >
          <span className="hidden sm:inline">{buttonLabel}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
