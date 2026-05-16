'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api'
import { useAppStore } from '@/store'

export function useLeaderboard(params?: {
  timeRange?: string
  category?: string
  limit?: number
  page?: number
}) {
  return useQuery({
    queryKey: ['leaderboard', params],
    queryFn: async () => {
      const { data } = await analyticsApi.getLeaderboard(params)
      return data?.leaderboard || data?.data || []
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useTierInfo() {
  const user = useAppStore((s) => s.user)

  return useQuery({
    queryKey: ['tier', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID')
      const { data } = await analyticsApi.getTier(user.id)
      const raw = data?.data || data
      // Normalize backend shape { currentTier: { name }, progress: { progressPercentage, amountToNextTier }, nextTier: { name } }
      // to the flat shape the dashboard expects
      return {
        currentTier: raw?.currentTier?.name?.toUpperCase() || 'BRONZE',
        progress: raw?.progress?.progressPercentage ?? 0,
        nextTier: raw?.nextTier?.name?.toUpperCase() || null,
        remainingAmount: raw?.progress?.amountToNextTier ?? 0,
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}
