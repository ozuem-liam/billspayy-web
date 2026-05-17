'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Clock, Wallet } from 'lucide-react'
import { WalletCard } from '@/components/shared/WalletCard'
import { FundWalletModal } from '@/components/pay/FundWalletModal'
import { SkeletonRow } from '@/components/shared/SkeletonCard'
import { useWalletBalance, useWalletTransactions, useVerifyWallet } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { cn, formatAmountFromNaira, formatDate } from '@/lib/utils'
import { IdentityGate } from '@/components/shared/IdentityGate'

function WalletPageInner() {
  const walletBalance = useAppStore((s) => s.walletBalance)
  const [fundModalOpen, setFundModalOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const verifyMutation = useVerifyWallet()
  const hasVerified = useRef(false)

  const { isLoading: balanceLoading } = useWalletBalance()
  const { data: transactions, isLoading: txnsLoading } = useWalletTransactions(10)

  // Auto-verify when Paystack redirects back with ?reference=xxx
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference || hasVerified.current) return
    hasVerified.current = true
    verifyMutation.mutateAsync({ reference, paymentMethod: 'paystack' }).finally(() => {
      // Clean up the URL params
      router.replace('/wallet')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100 transition">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Wallet</h1>
      </div>

      <WalletCard
        balance={walletBalance}
        isLoading={balanceLoading}
        onFund={() => setFundModalOpen(true)}
      />

      {/* Coming Soon Notice */}
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3.5">
        <Clock className="h-4.5 w-4.5 text-amber-500 shrink-0" style={{ width: 18, height: 18 }} />
        <div>
          <p className="text-sm font-semibold text-amber-800">Withdrawals coming soon</p>
          <p className="text-xs text-amber-600 mt-0.5">Contact support for assistance in the meantime.</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
          <Link href="/wallet/transactions" className="flex items-center gap-0.5 text-xs font-semibold text-[#6C3CE1]">
            See all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {txnsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : !transactions || transactions.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Wallet className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No wallet activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Fund your wallet to get started</p>
            </div>
          ) : (
            transactions.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="flex items-center gap-3.5 px-4 py-3.5">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    tx.type === 'CREDIT' ? 'bg-green-50' : 'bg-red-50'
                  )}
                >
                  {tx.type === 'CREDIT' ? (
                    <ArrowDownLeft className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {tx.description || (tx.type === 'CREDIT' ? 'Wallet Funding' : 'Bill Payment')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                </div>
                <p
                  className={cn(
                    'text-sm font-bold shrink-0',
                    tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'
                  )}
                >
                  {tx.type === 'CREDIT' ? '+' : '−'}
                  {formatAmountFromNaira(tx.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <FundWalletModal open={fundModalOpen} onClose={() => setFundModalOpen(false)} />
    </div>
  )
}

export default function WalletPage() {
  return (
    <IdentityGate>
      <WalletPageInner />
    </IdentityGate>
  )
}
