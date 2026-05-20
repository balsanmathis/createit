'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassCard from './GlassCard'

export interface PricingPlan {
  key: string
  name: string
  desc: string
  monthlyPrice: number
  tokens: string
  features: string[]
  cta: string
  href: string
  onSelect?: () => void | Promise<void>
}

interface Props {
  plan: PricingPlan
  highlighted?: boolean
  billing?: 'monthly' | 'annual'
  loading?: boolean
}

const ANNUAL_DISCOUNT = 0.80 // -20%

export default function PricingCard({
  plan,
  highlighted = false,
  billing = 'monthly',
  loading = false,
}: Props) {
  const [busy, setBusy] = useState(false)

  const price =
    billing === 'annual' && plan.monthlyPrice > 0
      ? Math.round(plan.monthlyPrice * ANNUAL_DISCOUNT)
      : plan.monthlyPrice

  const handleClick = async () => {
    if (!plan.onSelect) return
    setBusy(true)
    try {
      await plan.onSelect()
    } finally {
      setBusy(false)
    }
  }

  const isLoading = loading || busy

  return (
    <GlassCard
      className={cn(
        'relative flex flex-col p-7 transition-all duration-300',
        highlighted
          ? 'ring-2 ring-[var(--accent)] shadow-[0_0_32px_rgba(124,58,237,0.15)]'
          : 'hover:border-[var(--border-hover)]',
      )}
      hover={!highlighted}
    >
      {/* Popular badge */}
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{ background: 'var(--accent)' }}
          >
            Populaire
          </span>
        </div>
      )}

      {/* Plan name */}
      <p
        className="text-sm font-semibold mb-1"
        style={{ color: highlighted ? 'var(--accent)' : 'var(--fg-muted)' }}
      >
        {plan.name}
      </p>
      <p className="text-xs mb-5" style={{ color: 'var(--fg-subtle)' }}>
        {plan.desc}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-1">
        {plan.monthlyPrice === 0 ? (
          <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
            Gratuit
          </span>
        ) : (
          <>
            <span className="text-4xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
              {price}€
            </span>
            <span className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
              /mois
            </span>
          </>
        )}
      </div>

      {billing === 'annual' && plan.monthlyPrice > 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--accent)' }}>
          soit {price * 12}€/an — 20% d&apos;économie
        </p>
      )}

      {/* Tokens badge */}
      {plan.tokens && (
        <div
          className="inline-flex items-center self-start px-3 py-1.5 rounded-lg text-xs font-semibold mb-5"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          {plan.tokens}
        </div>
      )}

      {/* Features */}
      <ul className="flex-1 space-y-2.5 mb-7">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--fg-muted)' }}>
            <Check
              size={14}
              className="shrink-0 mt-0.5"
              style={{ color: 'var(--accent)' }}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {plan.onSelect ? (
        <button
          onClick={handleClick}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl',
            'text-sm font-semibold transition-all duration-200 disabled:opacity-60',
            highlighted
              ? 'text-white'
              : 'border',
          )}
          style={
            highlighted
              ? { background: isLoading ? 'var(--fg-subtle)' : 'var(--accent)' }
              : {
                  background: 'transparent',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                }
          }
          onMouseEnter={e => {
            if (highlighted && !isLoading)
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--accent-hover)'
          }}
          onMouseLeave={e => {
            if (highlighted)
              (e.currentTarget as HTMLButtonElement).style.background =
                isLoading ? 'var(--fg-subtle)' : 'var(--accent)'
          }}
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {plan.cta}
        </button>
      ) : (
        <Link
          href={plan.href}
          className={cn(
            'w-full flex items-center justify-center py-2.5 rounded-xl',
            'text-sm font-semibold transition-all duration-200 no-underline',
            highlighted ? 'text-white' : 'border',
          )}
          style={
            highlighted
              ? { background: 'var(--accent)' }
              : {
                  background: 'transparent',
                  borderColor: 'var(--border)',
                  color: 'var(--fg)',
                }
          }
        >
          {plan.cta}
        </Link>
      )}
    </GlassCard>
  )
}
