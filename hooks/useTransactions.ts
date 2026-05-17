'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { transactionsApi } from '@/lib/api'

export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: ['bills-transactions', 'recent', limit],
    queryFn: async () => {
      const { data } = await transactionsApi.getBillsTransactions(limit, 0)
      return data?.data?.transactions || data?.transactions || data?.data || []
    },
  })
}

export function useTransactions(limit = 20) {
  return useInfiniteQuery({
    queryKey: ['bills-transactions', 'all'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await transactionsApi.getBillsTransactions(limit, pageParam as number)
      const txns = data?.data?.transactions || data?.transactions || data?.data || []
      return {
        transactions: txns,
        nextOffset: (pageParam as number) + limit,
        hasMore: txns.length === limit,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined
    },
  })
}

export function useReceipt(reference: string) {
  return useQuery({
    queryKey: ['receipt', reference],
    queryFn: async () => {
      const { data } = await transactionsApi.getReceipt(reference)
      // GlobalResponseInterceptor: { success, data: receiptObject }
      const receipt = data?.data || data
      if (!receipt?.reference) throw new Error('Receipt not found')
      return receipt
    },
    enabled: !!reference && reference !== 'ref',
    retry: 1,
  })
}

export function useRequery(requestId: string, enabled = true) {
  return useQuery({
    queryKey: ['requery', requestId],
    queryFn: async () => {
      const { data } = await transactionsApi.requery(requestId)
      // Unwrap GlobalResponseInterceptor: { success, data: payload }
      return data?.data || data
    },
    enabled: !!requestId && requestId !== 'ref' && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (
        status === 'SUCCESS' ||
        status === 'SUCCESSFUL' ||
        status === 'FAILED' ||
        status === 'NOT_FOUND'
      ) return false
      return 3000
    },
    retry: 3,
  })
}
