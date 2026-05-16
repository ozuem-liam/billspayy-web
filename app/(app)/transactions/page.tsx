'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { StatusChip } from '@/components/shared/StatusChip'
import { SkeletonRow } from '@/components/shared/SkeletonCard'
import { useTransactions } from '@/hooks/useTransactions'
import { cn, formatAmountFromNaira, formatDate, formatMonthYear, getCategoryIcon, getCategoryLabel } from '@/lib/utils'

const CATEGORIES = ['ALL', 'AIRTIME', 'DATA', 'ELECTRICITY', 'CABLETV']

export default function TransactionsPage() {
  const router = useRouter()
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const observerRef = useRef<IntersectionObserver | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useTransactions()

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

  const allTxns = data?.pages.flatMap((p) => p.transactions) || []
  const filtered =
    categoryFilter === 'ALL'
      ? allTxns
      : allTxns.filter((tx: any) => tx.category?.toUpperCase() === categoryFilter)

  const grouped: Record<string, any[]> = {}
  filtered.forEach((tx: any) => {
    const month = formatMonthYear(tx.createdAt)
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(tx)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100 transition">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition',
              categoryFilter === cat
                ? 'bg-[#6C3CE1] text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            {cat === 'ALL' ? 'All' : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white py-16 text-center border border-gray-100">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">No transactions found</p>
          <p className="text-xs text-gray-400 mt-1">
            {categoryFilter !== 'ALL' ? 'Try a different filter' : 'Pay a bill to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, txns]) => (
            <div key={month}>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-gray-400 px-1">
                {month}
              </p>
              <div className="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {txns.map((tx: any, idx: number) => (
                  <div
                    key={tx.id || tx.reference}
                    ref={
                      idx === filtered.length - 1 &&
                      txns === Object.values(grouped)[Object.values(grouped).length - 1]
                        ? lastRef
                        : null
                    }
                    onClick={() => router.push(`/transactions/${tx.reference}`)}
                    className="flex cursor-pointer items-center gap-3.5 px-4 py-3.5 hover:bg-gray-50/60 transition"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xl">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {tx.serviceName || getCategoryLabel(tx.category)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="text-sm font-bold text-gray-900">
                        {formatAmountFromNaira(tx.amount)}
                      </p>
                      <StatusChip status={tx.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isFetchingNextPage && (
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <SkeletonRow />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
