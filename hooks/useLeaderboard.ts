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
      // GlobalResponseInterceptor wraps: { success, data: { leaderboard, currentUser, pagination } }
      const result = data?.data || data
      return {
        leaderboard: result?.leaderboard || [],
        currentUser: result?.currentUser || null,
        pagination: result?.pagination || null,
      }
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
