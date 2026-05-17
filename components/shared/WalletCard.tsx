'use client'

import { useState } from 'react'
import { Eye, EyeOff, Plus, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAmountFromNaira } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface WalletCardProps {
  balance: number | null
  isLoading?: boolean
  onFund?: () => void
  showActions?: boolean
}

export function WalletCard({
  balance,
  isLoading,
  onFund,
  showActions = true,
}: WalletCardProps) {
  const [hidden, setHidden] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6C3CE1] via-[#5A2FBF] to-[#4A2BA0] p-6 text-white shadow-lg shadow-purple-200/50"
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-16 bottom-4 h-16 w-16 rounded-full bg-white/5" />

      <div className="relative">
        <div className="mb-0.5 flex items-center justify-between">
          <p className="text-sm font-medium text-purple-200">Main Wallet</p>
          <button
            onClick={() => setHidden(!hidden)}
            className="rounded-full p-1.5 transition hover:bg-white/10"
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
          >
            {hidden ? (
              <EyeOff className="h-4 w-4 text-purple-300" />
            ) : (
              <Eye className="h-4 w-4 text-purple-300" />
            )}
          </button>
        </div>

        <div className="mb-6">
          {isLoading ? (
            <Skeleton className="mt-1 h-10 w-44 bg-white/20" />
          ) : (
            <p className="mt-1 text-[2.25rem] font-bold tracking-tight leading-none">
              {hidden ? '₦ ••••••' : balance !== null ? formatAmountFromNaira(balance) : '₦ 0.00'}
            </p>
          )}
          <p className="mt-2 text-xs text-purple-300 font-medium">Available balance</p>
        </div>

        {showActions && (
          <div className="flex gap-2.5">
            <Button
              onClick={onFund}
              size="sm"
              className="flex-1 h-9 bg-white text-[#6C3CE1] hover:bg-purple-50 font-semibold text-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Fund
            </Button>
            <Link href="/wallet" className="flex-1">
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50 font-semibold text-sm"
              >
                <History className="mr-1.5 h-4 w-4" />
                History
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  )
}
