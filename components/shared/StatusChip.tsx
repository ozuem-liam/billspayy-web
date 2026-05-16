import { cn, getStatusColor, getStatusLabel } from '@/lib/utils'

interface StatusChipProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const colorClass = getStatusColor(status)
  const label = getStatusLabel(status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        colorClass,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      {label}
    </span>
  )
}
