'use client'

import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Clock, XCircle, RotateCcw } from 'lucide-react'
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
    queryFn: async () => {
      const { data } = await walletApi.getTransactions(20)
      return data?.data?.transactions || data?.transactions || []
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
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage()
      })
      if (node) observerRef.current.observe(node)
    },
    [isLoading, hasNextPage, fetchNextPage]
  )

  const allTxns = data?.pages.flat() || []
  const filtered = allTxns.filter((tx: any) => {
    if (filter === 'ALL') return true
    if (filter === 'CREDIT') return tx.kind === 'CREDIT'
    if (filter === 'DEBIT') return tx.kind === 'DEBIT'
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
            <p className="text-sm text-gray-500">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx: any, idx: number) => {
            const isPending = tx.status === 'PENDING'
            const isFailed = tx.status === 'FAILED'
            const isCredit = tx.kind === 'CREDIT'

            return (
              <div
                key={tx.id || idx}
                ref={idx === filtered.length - 1 ? lastRef : null}
                className="p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                    isPending ? 'bg-amber-50' : isFailed ? 'bg-red-50' : isCredit ? 'bg-green-100' : 'bg-red-100'
                  )}>
                    {isPending ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : isFailed ? (
                      <XCircle className="h-5 w-5 text-red-400" />
                    ) : isCredit ? (
                      <ArrowDownLeft className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {tx.description || (isCredit ? 'Wallet Funding' : 'Bill Payment')}
                      </p>
                      {isPending && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
                      )}
                      {isFailed && (
                        <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Failed</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                  </div>
                  <p className={cn(
                    'text-sm font-semibold flex-shrink-0',
                    isPending || isFailed ? 'text-gray-400' : isCredit ? 'text-green-600' : 'text-red-600'
                  )}>
                    {isCredit ? '+' : '-'}{formatAmountFromNaira(tx.amount)}
                  </p>
                </div>

                {isPending && isCredit && tx.authorizationUrl && (
                  <button
                    onClick={() => { window.location.href = tx.authorizationUrl }}
                    className="mt-1.5 ml-[52px] flex items-center gap-1 text-xs font-semibold text-[#6C3CE1] hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Complete payment
                  </button>
                )}
              </div>
            )
          })
        )}

        {isFetchingNextPage && <SkeletonRow />}
      </div>
    </div>
  )
}
