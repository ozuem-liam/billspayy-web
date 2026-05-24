'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { TierBadge } from '@/components/shared/TierBadge'
import { SkeletonCard, SkeletonRow } from '@/components/shared/SkeletonCard'
import { useLeaderboard, useTierInfo } from '@/hooks/useLeaderboard'
import { useAppStore } from '@/store'
import { cn, formatAmount, getTierBadge } from '@/lib/utils'

const TIME_RANGES = ['30d', '7d', 'all']
const CATEGORIES = ['ALL', 'AIRTIME', 'DATA', 'ELECTRICITY', 'CABLETV']

export default function LeaderboardPage() {
  const user = useAppStore((s) => s.user)
  const [timeRange, setTimeRange] = useState('30d')
  const [category, setCategory] = useState('ALL')

  const { data: lbData, isLoading: lbLoading } = useLeaderboard({
    timeRange,
    category: category === 'ALL' ? undefined : category,
    limit: 50,
  })
  const { data: tierInfo, isLoading: tierLoading } = useTierInfo()

  const entries = lbData?.leaderboard || []
  const currentUser = lbData?.currentUser
  const myRank = currentUser?.rank || '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Leaderboard</h1>
      </div>

      {/* Your Rank */}
      <div className="rounded-2xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] p-6 text-white">
        {tierLoading ? (
          <SkeletonCard lines={3} hasHeader={false} className="bg-transparent" />
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-purple-200">Your Rank</p>
                <p className="text-4xl font-bold">#{myRank}</p>
              </div>
              <TierBadge tier={tierInfo?.currentTier || 'BRONZE'} size="md" />
            </div>
            {currentUser?.stats && (
              <p className="text-sm text-purple-200 mb-3">
                {formatAmount(currentUser.stats.totalSpent || 0)} spent · {currentUser.stats.transactionCount || 0} bills
              </p>
            )}
            {tierInfo?.nextTier && (
              <>
                <Progress value={tierInfo.progress || 0} className="h-2 bg-white/20 mb-2" />
                <div className="flex justify-between text-xs text-purple-200">
                  <span>{tierInfo.progress?.toFixed(0)}% to {tierInfo.nextTier}</span>
                  {tierInfo.remainingAmount != null && (
                    <span>{formatAmount(tierInfo.remainingAmount)} more</span>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition',
                timeRange === range
                  ? 'bg-[#6C3CE1] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              )}
            >
              {range === '30d' ? '30 Days' : range === '7d' ? '7 Days' : 'All Time'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
                category === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              )}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 divide-y divide-gray-50">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Top Spenders
          </p>
        </div>
        {lbLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
        ) : entries.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-sm text-gray-500">No leaderboard data yet</p>
          </div>
        ) : (
          entries.map((entry: any, idx: number) => {
            const isMe = entry.isCurrentUser || entry.userId === user?.id
            const rank = entry.rank || idx + 1
            const tier = entry.tier || 'bronze'
            const totalSpent = entry.stats?.totalSpent || 0
            const txCount = entry.stats?.transactionCount || 0

            return (
              <div
                key={entry.userId || idx}
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  isMe && 'bg-purple-50'
                )}
              >
                {/* Rank */}
                <div className="w-8 shrink-0 text-center">
                  {rank <= 3 ? (
                    <span className="text-xl">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className={cn('text-sm font-bold', isMe ? 'text-[#6C3CE1]' : 'text-gray-500')}>
                      #{rank}
                    </span>
                  )}
                </div>

                {/* Tier badge */}
                <span className="text-xl shrink-0">{getTierBadge(tier)}</span>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className={cn('text-sm font-medium', isMe ? 'text-[#6C3CE1]' : 'text-gray-900')}>
                    {isMe ? 'You' : entry.displayName || entry.name}
                  </p>
                  <p className="text-xs text-gray-500">{txCount} bills</p>
                </div>

                {/* Amount */}
                <p className={cn('text-sm font-semibold shrink-0', isMe ? 'text-[#6C3CE1]' : 'text-gray-900')}>
                  {formatAmount(totalSpent)}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
