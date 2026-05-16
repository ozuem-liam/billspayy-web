import { cn, getTierBadge, getTierColor } from '@/lib/utils'

interface TierBadgeProps {
  tier: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function TierBadge({ tier, showLabel = true, size = 'md' }: TierBadgeProps) {
  const badge = getTierBadge(tier)
  const colorClass = getTierColor(tier)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        colorClass,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base'
      )}
    >
      <span>{badge}</span>
      {showLabel && <span>{tier.charAt(0) + tier.slice(1).toLowerCase()}</span>}
    </span>
  )
}
