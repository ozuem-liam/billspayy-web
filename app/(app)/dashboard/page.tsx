'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, AlertCircle, Zap, X, TrendingUp, Gift, CreditCard, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WalletCard } from '@/components/shared/WalletCard'
import { TransactionRow } from '@/components/shared/TransactionRow'
import { TierBadge } from '@/components/shared/TierBadge'
import { SkeletonCard, SkeletonRow } from '@/components/shared/SkeletonCard'
import { FundWalletModal } from '@/components/pay/FundWalletModal'
import { useWalletBalance } from '@/hooks/useWallet'
import { useRecentTransactions } from '@/hooks/useTransactions'
import { useEarningsWallets } from '@/hooks/useEarnings'
import { useTierInfo } from '@/hooks/useLeaderboard'
import { useAppStore } from '@/store'
import { useRouter } from 'next/navigation'
import { formatAmountFromNaira } from '@/lib/utils'

const QUICK_ACTIONS = [
  {
    href: '/pay/airtime',
    label: 'Airtime',
    logos: [
      'https://vtpass.com/resources/products/200X200/MTN-Airtime-VTU.jpg',
      'https://vtpass.com/resources/products/200X200/Airtel-Airtime-VTU.jpg',
      'https://vtpass.com/resources/products/200X200/GLO-Airtime.jpg',
      'https://vtpass.com/resources/products/200X200/9mobile-Airtime.jpg',
    ],
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    href: '/pay/data',
    label: 'Data',
    logos: [
      'https://vtpass.com/resources/products/200X200/MTN-Airtime-VTU.jpg',
      'https://vtpass.com/resources/products/200X200/Airtel-Airtime-VTU.jpg',
      'https://vtpass.com/resources/products/200X200/GLO-Airtime.jpg',
      'https://vtpass.com/resources/products/200X200/9mobile-Airtime.jpg',
    ],
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  },
  {
    href: '/pay/electricity',
    label: 'Electricity',
    logos: null,
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    href: '/pay/cable',
    label: 'Cable TV',
    logos: [
      'https://vtpass.com/resources/products/200X200/Pay-DSTV-Subscription.jpg',
      'https://vtpass.com/resources/products/200X200/Gotv-Payment.jpg',
      'https://vtpass.com/resources/products/200X200/Startimes-Subscription.jpg',
      'https://vtpass.com/resources/products/200X200/ShowMax.jpg',
    ],
    bg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const walletBalance = useAppStore((s) => s.walletBalance)
  const [fundModalOpen, setFundModalOpen] = useState(false)
  const [dismissedBanner, setDismissedBanner] = useState(false)

  const { isLoading: balanceLoading } = useWalletBalance()
  const { data: recentTxns, isLoading: txnsLoading } = useRecentTransactions(5)
  const { data: wallets, isLoading: walletsLoading } = useEarningsWallets()
  const { data: tierInfo, isLoading: tierLoading } = useTierInfo()

  const commissionBalance = Array.isArray(wallets)
    ? wallets.find((w: { type: string }) => w.type === 'COMMISSION')?.balance ?? 0
    : 0
  const rewardBalance = Array.isArray(wallets)
    ? wallets.find((w: { type: string }) => w.type === 'REWARD')?.balance ?? 0
    : 0

  const showPinBanner = !user?.hasPin && !dismissedBanner
  const showVerifyBanner = !user?.isIdentityVerified && !showPinBanner && !dismissedBanner

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Good day,</p>
          <h1 className="text-xl font-bold text-gray-900">Hey, {firstName}</h1>
        </div>
        <Avatar
          className="h-9 w-9 cursor-pointer ring-2 ring-white shadow-sm"
          onClick={() => router.push('/profile')}
        >
          <AvatarImage src={user?.picture} />
          <AvatarFallback className="bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] text-white text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Banners */}
      {showPinBanner && (
        <div className="flex items-center gap-3 rounded-2xl bg-orange-50 border border-orange-100 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-orange-900">Set a PIN to start paying bills</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/register">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-3 text-xs">
                Set Now
              </Button>
            </Link>
            <button onClick={() => setDismissedBanner(true)} className="text-orange-300 hover:text-orange-500 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {showVerifyBanner && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 mt-0.5">
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Verify your identity</p>
            <p className="text-xs text-amber-700 mt-0.5">NIN or BVN required to pay bills and fund wallet</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/profile/verify">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-7 px-3 text-xs">
                Verify
              </Button>
            </Link>
            <button onClick={() => setDismissedBanner(true)} className="text-amber-300 hover:text-amber-500 transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wallet */}
      <WalletCard
        balance={walletBalance}
        isLoading={balanceLoading}
        onFund={() => setFundModalOpen(true)}
      />

      {/* Earnings Strip */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/earnings/commission">
          <div className="rounded-2xl bg-white p-4 border border-gray-100 hover:border-[#6C3CE1]/20 hover:shadow-sm transition cursor-pointer group">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50">
                <TrendingUp className="h-4 w-4 text-[#6C3CE1]" />
              </div>
              <p className="text-xs font-medium text-gray-500">Commission</p>
            </div>
            {walletsLoading ? (
              <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-100" />
            ) : (
              <p className="text-lg font-bold text-gray-900">{formatAmountFromNaira(commissionBalance)}</p>
            )}
            <p className="text-xs text-[#6C3CE1] mt-1.5 font-medium group-hover:underline">View history →</p>
          </div>
        </Link>
        <Link href="/earnings/rewards">
          <div className="rounded-2xl bg-white p-4 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition cursor-pointer group">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
                <Gift className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-xs font-medium text-gray-500">Rewards</p>
            </div>
            {walletsLoading ? (
              <div className="h-6 w-20 animate-pulse rounded-lg bg-gray-100" />
            ) : (
              <p className="text-lg font-bold text-gray-900">{formatAmountFromNaira(rewardBalance)}</p>
            )}
            <p className="text-xs text-orange-500 mt-1.5 font-medium group-hover:underline">View history →</p>
          </div>
        </Link>
      </div>

      {/* Quick Pay */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Quick Pay</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.map(({ href, logos, label, bg, iconColor }) => (
            <Link key={href} href={href}>
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition cursor-pointer">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                  {logos ? (
                    <div className="grid grid-cols-2 gap-0.5 h-8 w-8">
                      {logos.slice(0, 4).map((src, i) => (
                        <div key={i} className="overflow-hidden rounded-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Zap className={`h-6 w-6 ${iconColor}`} />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 text-center leading-tight">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent Transactions</h2>
          <Link href="/transactions" className="flex items-center gap-0.5 text-xs font-semibold text-[#6C3CE1]">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {txnsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
          ) : recentTxns?.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No transactions yet</p>
              <p className="text-xs text-gray-400 mt-1">Pay a bill to get started</p>
            </div>
          ) : (
            recentTxns?.map((tx: any) => (
              <TransactionRow
                key={tx.id || tx.reference}
                transaction={tx}
                onClick={() => router.push(`/transactions/${tx.reference}`)}
                compact
              />
            ))
          )}
        </div>
      </div>

      {/* Tier Progress */}
      <Link href="/leaderboard">
        <div className="rounded-2xl bg-white p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition cursor-pointer">
          {tierLoading ? (
            <SkeletonCard lines={2} hasHeader={false} />
          ) : tierInfo ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Your Tier</p>
                  <TierBadge tier={tierInfo.currentTier || 'BRONZE'} />
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
              {tierInfo.nextTier && (
                <>
                  <Progress value={tierInfo.progress || 0} className="h-1.5 mb-2" />
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{tierInfo.progress?.toFixed(0)}% to {tierInfo.nextTier}</span>
                    {tierInfo.remainingAmount && (
                      <span>{formatAmountFromNaira(tierInfo.remainingAmount)} more</span>
                    )}
                  </div>
                </>
              )}
              {!tierInfo.nextTier && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-xs text-gray-500">You&apos;re at the highest tier!</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Your Tier</p>
                <TierBadge tier="BRONZE" />
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          )}
        </div>
      </Link>

      <FundWalletModal open={fundModalOpen} onClose={() => setFundModalOpen(false)} />
    </div>
  )
}
