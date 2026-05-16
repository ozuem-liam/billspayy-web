'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { earningsApi } from '@/lib/api'

export function useEarningsWallets() {
  return useQuery({
    queryKey: ['earnings-wallets'],
    queryFn: async () => {
      const { data } = await earningsApi.getWallets()
      const raw = data?.wallets || data?.data || data || {}
      // Backend returns a flat object { commissionBalanceNaira, rewardBalanceNaira, ... }
      // Normalise into an array for consistent consumption
      if (!Array.isArray(raw)) {
        return [
          { type: 'COMMISSION', balance: (raw as any).commissionBalanceNaira ?? 0 },
          { type: 'REWARD',     balance: (raw as any).rewardBalanceNaira ?? 0 },
        ]
      }
      return raw
    },
  })
}

export function useCommissionWallet() {
  const { data: wallets, ...rest } = useEarningsWallets()
  const commission = Array.isArray(wallets)
    ? wallets.find((w: { type: string }) => w.type === 'COMMISSION')
    : null
  return { wallet: commission, ...rest }
}

export function useRewardWallet() {
  const { data: wallets, ...rest } = useEarningsWallets()
  const reward = Array.isArray(wallets)
    ? wallets.find((w: { type: string }) => w.type === 'REWARD')
    : null
  return { wallet: reward, ...rest }
}

export function useCommissionLedger() {
  return useInfiniteQuery({
    queryKey: ['commission-ledger'],
    queryFn: async ({ pageParam }) => {
      const { data } = await earningsApi.getLedger('COMMISSION', {
        cursor: pageParam as string | undefined,
        limit: 20,
      })
      const raw = data?.entries || data?.data?.entries || data?.data || []
      // Normalise: backend entries have amountNaira; expose as amount for UI
      const entries = raw.map((e: any) => ({ ...e, amount: e.amountNaira ?? e.amount }))
      return {
        entries,
        nextCursor: data?.nextCursor || data?.data?.nextCursor || null,
      }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  })
}

export function useRewardLedger() {
  return useInfiniteQuery({
    queryKey: ['reward-ledger'],
    queryFn: async ({ pageParam }) => {
      const { data } = await earningsApi.getLedger('REWARD', {
        cursor: pageParam as string | undefined,
        limit: 20,
      })
      const raw = data?.entries || data?.data?.entries || data?.data || []
      const entries = raw.map((e: any) => ({ ...e, amount: e.amountNaira ?? e.amount }))
      return {
        entries,
        nextCursor: data?.nextCursor || data?.data?.nextCursor || null,
      }
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  })
}
