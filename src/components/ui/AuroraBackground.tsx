'use client'

import { cn } from '@/lib/utils'

interface Props {
  intensity?: 'strong' | 'medium' | 'subtle'
  className?: string
  children?: React.ReactNode
}

/**
 * Decorative aurora background with animated colour blobs.
 * Wraps its children; blobs are absolutely positioned inside.
 */
export default function AuroraBackground({
  intensity = 'medium',
  className,
  children,
}: Props) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blobs */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 -z-0',
          intensity === 'strong' && 'aurora-strong',
          intensity === 'subtle' && 'aurora-subtle',
        )}
      >
        <span className="aurora-blob aurora-blue   aurora-1 aurora-blur-xl" />
        <span className="aurora-blob aurora-violet aurora-2 aurora-blur-2xl" />
        <span className="aurora-blob aurora-rose   aurora-3 aurora-blur-xl" />
        <span className="aurora-blob aurora-indigo aurora-4 aurora-blur-lg" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
