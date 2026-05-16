'use client'

import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useInfiniteQuery } from '@tanstack/react-query'
import { SkeletonRow } from '@/components/shared/SkeletonCard'
import { walletApi } from '@/lib/api'
import { cn, formatAmountFromNaira, formatDate } from '@/lib/utils'

type FilterType = 'ALL' | 'CREDIT' | 'DEBIT'

export default function WalletTransactionsPage() {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const observerRef = useRef<IntersectionObserver | null>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['wallet-transactions-infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await walletApi.getTransactions(20)
      return data?.transactions || data?.data?.transactions || (Array.isArray(data?.data) ? data.data : [])
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === 20 ? pages.length + 1 : undefined
    },
  })

  const lastRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      })
      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasNextPage, fetchNextPage]
  )

  const allTxns = data?.pages.flat() || []
  const filtered = allTxns.filter((tx: any) => {
    if (filter === 'ALL') return true
    if (filter === 'CREDIT') return tx.type === 'CREDIT'
    if (filter === 'DEBIT') return tx.type === 'DEBIT'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/wallet">
          <button className="rounded-full p-3 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Wallet History</h1>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2">
        {(['ALL', 'CREDIT', 'DEBIT'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              filter === f
                ? 'bg-[#6C3CE1] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            )}
          >
            {f === 'ALL' ? 'All' : f === 'CREDIT' ? 'Credits' : 'Debits'}
          </button>
        ))}
      </div>

      {/* Transactions */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 divide-y divide-gray-50">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">💳</p>
            <p className="text-sm text-gray-500">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx: any, idx: number) => (
            <div
              key={tx.id || idx}
              ref={idx === filtered.length - 1 ? lastRef : null}
              className="flex items-center gap-3 p-3"
            >
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                  tx.type === 'CREDIT' ? 'bg-green-100' : 'bg-red-100'
                )}
              >
                {tx.type === 'CREDIT' ? (
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {tx.description || (tx.type === 'CREDIT' ? 'Wallet Funding' : 'Bill Payment')}
                </p>
                <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                {tx.status && tx.status !== 'SUCCESS' && (
                  <span className="text-xs text-amber-600">{tx.status}</span>
                )}
              </div>
              <p
                className={cn(
                  'text-sm font-semibold flex-shrink-0',
                  tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {tx.type === 'CREDIT' ? '+' : '-'}
                {formatAmountFromNaira(tx.amount)}
              </p>
            </div>
          ))
        )}

        {isFetchingNextPage && <SkeletonRow />}
      </div>
    </div>
  )
}
