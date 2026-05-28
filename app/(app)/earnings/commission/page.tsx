'use client'

import { useState } from 'react'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SkeletonRow } from '@/components/shared/SkeletonCard'
import { useCommissionWallet, useCommissionLedger } from '@/hooks/useEarnings'
import { WithdrawModal } from '@/components/shared/WithdrawModal'
import { cn, formatAmountFromNaira, formatDate, getCategoryLabel } from '@/lib/utils'

const CATEGORIES = ['ALL', 'AIRTIME', 'DATA', 'ELECTRICITY', 'CABLETV']

export default function CommissionPage() {
  const [category, setCategory] = useState('ALL')
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const { wallet, isLoading: walletLoading } = useCommissionWallet()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCommissionLedger()

  const allEntries = data?.pages.flatMap((p) => p.entries) || []
  const filtered =
    category === 'ALL'
      ? allEntries
      : allEntries.filter((e: any) => e.category?.toUpperCase() === category)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Commission Earnings</h1>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] p-6 text-white">
        <p className="text-sm text-purple-200">Commission Balance</p>
        {walletLoading ? (
          <div className="mt-2 h-10 w-36 animate-pulse rounded bg-white/20" />
        ) : (
          <p className="mt-2 text-4xl font-bold">{formatAmountFromNaira(wallet?.balance ?? 0)}</p>
        )}
        <Button
          onClick={() => setWithdrawOpen(true)}
          disabled={!wallet?.balance || wallet.balance < 1}
          className="mt-4 bg-white/20 text-white hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
          size="sm"
        >
          Withdraw to Wallet
        </Button>
      </div>

      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        type="COMMISSION"
        availableBalance={wallet?.balance ?? 0}
      />

      {/* How it works */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">How it works</p>
            <p className="text-xs text-blue-700 mt-1">
              Every bill you pay earns you a percentage back as commission.
              The more you pay, the higher your tier and the more you earn.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-blue-700">
              <span>⚡ Electricity: ~0.6%</span>
              <span>📱 Airtime: ~0.6%</span>
              <span>📶 Data: ~0.6%</span>
              <span>📺 Cable TV: ~0.6%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
              category === cat
                ? 'bg-[#6C3CE1] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            )}
          >
            {cat === 'ALL' ? 'All' : getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Ledger */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 divide-y divide-gray-50">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-sm text-gray-500">No commission earned yet</p>
            <p className="text-xs text-gray-400 mt-1">Pay bills to start earning</p>
          </div>
        ) : (
          filtered.map((entry: any, i: number) => {
            const isWithdrawal = entry.reason === 'WITHDRAWAL_TO_MAIN'
            const absAmount = Math.abs(entry.amount)
            return (
              <div key={entry.id ?? i} className="flex items-start gap-3 p-4">
                <div className={cn(
                  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm',
                  isWithdrawal ? 'bg-gray-100' : 'bg-green-100'
                )}>
                  {isWithdrawal ? '↗️' : '💰'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {isWithdrawal
                      ? 'Withdrawn to main wallet'
                      : entry.description || `Commission on ${getCategoryLabel(entry.category || '')} payment`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className={cn('text-sm font-bold', isWithdrawal ? 'text-red-500' : 'text-green-600')}>
                    {isWithdrawal ? '-' : '+'}{formatAmountFromNaira(absAmount)}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {isFetchingNextPage && <SkeletonRow />}
      </div>

      {hasNextPage && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          Load More
        </Button>
      )}
    </div>
  )
}
