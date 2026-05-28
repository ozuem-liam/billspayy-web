'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { earningsApi } from '@/lib/api'
import { useAppStore } from '@/store'
import toast from 'react-hot-toast'

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

export function useWithdrawToWallet() {
  const queryClient = useQueryClient()
  const setWalletBalance = useAppStore((s) => s.setWalletBalance)

  return useMutation({
    mutationFn: async ({ type, amount }: { type: 'COMMISSION' | 'REWARD'; amount: number }) => {
      const { data } = await earningsApi.withdraw(type, amount)
      return data?.data ?? data
    },
    onSuccess: (data) => {
      if (data?.newMainBalanceNaira !== undefined) {
        setWalletBalance(data.newMainBalanceNaira)
      }
      queryClient.invalidateQueries({ queryKey: ['earnings-wallets'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      toast.success('Withdrawn to main wallet successfully!')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Withdrawal failed. Please try again.'
      toast.error(msg)
    },
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
