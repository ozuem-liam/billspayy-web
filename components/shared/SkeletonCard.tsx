import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonCardProps {
  lines?: number
  hasHeader?: boolean
  className?: string
}

export function SkeletonCard({
  lines = 3,
  hasHeader = true,
  className,
}: SkeletonCardProps) {
  return (
    <div className={`rounded-xl bg-white p-4 shadow-sm ${className}`}>
      {hasHeader && <Skeleton className="mb-4 h-6 w-1/3" />}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
    </div>
  )
}

export function SkeletonWalletCard() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#6C3CE1]/30 to-[#4A2BA0]/30 p-6">
      <Skeleton className="mb-2 h-4 w-24 bg-white/20" />
      <Skeleton className="mb-6 h-10 w-40 bg-white/20" />
      <div className="flex gap-3">
        <Skeleton className="h-9 flex-1 bg-white/20" />
        <Skeleton className="h-9 flex-1 bg-white/20" />
      </div>
    </div>
  )
}
