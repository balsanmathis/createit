import { cn } from '@/lib/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  strong?: boolean
  hover?: boolean
  children: React.ReactNode
}

/**
 * Glassmorphism card — semi-transparent, backdrop-blur, soft border.
 * `strong` increases blur & shadow. `hover` adds lift effect.
 */
export default function GlassCard({
  strong = false,
  hover = false,
  className,
  children,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        strong ? 'glass-card-strong' : 'glass-card',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
