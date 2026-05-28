'use client'

import { useState } from 'react'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SkeletonRow } from '@/components/shared/SkeletonCard'
import { useRewardWallet, useRewardLedger } from '@/hooks/useEarnings'
import { WithdrawModal } from '@/components/shared/WithdrawModal'
import { formatAmountFromNaira, formatDate, maskEmail } from '@/lib/utils'

export default function RewardsPage() {
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const { wallet, isLoading: walletLoading } = useRewardWallet()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useRewardLedger()

  const allEntries = data?.pages.flatMap((p) => p.entries) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Referral Rewards</h1>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA5A0C] p-6 text-white">
        <p className="text-sm text-orange-200">Reward Balance</p>
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
        type="REWARD"
        availableBalance={wallet?.balance ?? 0}
      />

      {/* How it works */}
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-800">How rewards work</p>
            <p className="text-xs text-orange-700 mt-1">
              You earn a reward every time someone signs up using your referral code and pays their
              first bill. Keep sharing to keep earning!
            </p>
          </div>
        </div>
      </div>

      {/* CTA to Referrals */}
      <Link href="/referrals">
        <div className="rounded-xl border border-[#6C3CE1] bg-purple-50 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#6C3CE1]">Invite more friends</p>
            <p className="text-xs text-purple-600">Share your code and earn more rewards</p>
          </div>
          <span className="text-[#6C3CE1]">→</span>
        </div>
      </Link>

      {/* Ledger */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Reward History</h2>
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : allEntries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-3xl mb-2">🎁</p>
              <p className="text-sm text-gray-500">No rewards yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Invite friends to start earning rewards
              </p>
            </div>
          ) : (
            allEntries.map((entry: any) => (
              <div key={entry.id} className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm">
                  🎁
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {entry.description ||
                      `Reward from ${entry.meta?.referredEmail ? maskEmail(entry.meta.referredEmail) : 'a friend'} joining BillsPayy`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-orange-600">+{formatAmountFromNaira(entry.amount)}</p>
                </div>
              </div>
            ))
          )}

          {isFetchingNextPage && <SkeletonRow />}
        </div>
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
