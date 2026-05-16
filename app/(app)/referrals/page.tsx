'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Copy, Share2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { referralsApi } from '@/lib/api'
import { useAppStore } from '@/store'
import { formatAmount, formatDateShort, maskEmail } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ReferralsPage() {
  const user = useAppStore((s) => s.user)
  const [copied, setCopied] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => {
      const { data } = await referralsApi.getReferrals()
      return data?.data || data
    },
  })

  const referralCode = user?.referralCode || data?.referralCode || 'BP-XXXXXX'
  const referrals = data?.referrals || []
  const totalEarned = data?.totalEarned || 0
  const currentBalance = data?.currentBalance || 0

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      toast.success('Referral code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleShare = async () => {
    const message = `Pay bills & earn rewards with BillsPayy! Use my code ${referralCode} when signing up: ${window.location.origin}/register?ref=${referralCode}`
    try {
      if (navigator.share) {
        await navigator.share({ text: message, title: 'Join BillsPayy' })
      } else {
        await navigator.clipboard.writeText(message)
        toast.success('Link copied to clipboard!')
      }
    } catch {
      // User cancelled
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Refer & Earn</h1>
      </div>

      {/* Referral Code Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] p-6 text-white">
        <p className="mb-3 text-sm text-purple-200">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-xl bg-white/20 px-4 py-3">
            <p className="text-xl font-bold font-mono tracking-widest">{referralCode}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 transition hover:bg-white/30"
          >
            {copied ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <Copy className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            onClick={handleShare}
            className="flex-1 bg-white text-[#6C3CE1] hover:bg-gray-100"
            size="sm"
          >
            <Share2 className="mr-1 h-4 w-4" />
            Share
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="flex-1 border-white/40 text-white hover:bg-white/10 hover:text-white"
            size="sm"
          >
            <Copy className="mr-1 h-4 w-4" />
            Copy Code
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">How it works</h2>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Share your unique referral code with friends' },
            { step: '2', text: 'Friend signs up and pays their first bill' },
            { step: '3', text: 'You earn a reward instantly!' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#6C3CE1] text-xs font-bold text-white">
                {step}
              </div>
              <p className="text-sm text-gray-700 pt-0.5">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <SkeletonCard lines={3} />
      ) : (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Your Stats</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <p className="text-sm text-gray-600">Friends Joined</p>
              <p className="text-sm font-semibold text-gray-900">{referrals.length}</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-sm font-semibold text-[#6C3CE1]">{formatAmount(totalEarned)}</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-sm font-semibold text-[#F97316]">{formatAmount(currentBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Friends List */}
      {referrals.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Friends ({referrals.length})
          </h2>
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 divide-y divide-gray-50">
            {referrals.map((ref: any) => (
              <div key={ref.id} className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-[#6C3CE1]">
                  {ref.referredEmail?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {ref.referredName || maskEmail(ref.referredEmail || '')}
                  </p>
                  <p className="text-xs text-gray-500">{formatDateShort(ref.joinedAt)}</p>
                </div>
                {ref.status === 'ACTIVE' && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
