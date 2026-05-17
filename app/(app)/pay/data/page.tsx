'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NetworkSelector } from '@/components/shared/NetworkSelector'
import { CommissionPreview } from '@/components/shared/CommissionPreview'
import { PinInput } from '@/components/shared/PinInput'
import { Skeleton } from '@/components/ui/skeleton'
import { useWalletBalance } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { billsApi } from '@/lib/api'
import { cn, formatAmountFromNaira } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { NetworkProvider, DataPlan } from '@/types'
import { IdentityGate } from '@/components/shared/IdentityGate'

function DataPageInner() {
  const router = useRouter()
  const user = useAppStore((s) => s.user)
  const walletBalance = useAppStore((s) => s.walletBalance)
  const lastNetwork = useAppStore((s) => s.lastNetworkUsed)
  const lastPhone = useAppStore((s) => s.lastPhoneNumber)
  const setLastNetwork = useAppStore((s) => s.setLastNetwork)
  const setLastPhone = useAppStore((s) => s.setLastPhoneNumber)

  const [network, setNetwork] = useState<NetworkProvider | null>(
    (lastNetwork as NetworkProvider) || null
  )
  const [phone, setPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')

  const { refetch: refetchBalance } = useWalletBalance()

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['data-plans', network],
    queryFn: async () => {
      if (!network) return []
      const { data } = await billsApi.getDataPlans(network)
      // Backend returns { data: { network, plans: DataPlan[] } }
      const plans = data?.data?.plans ?? data?.plans ?? data?.data
      return Array.isArray(plans) ? (plans as DataPlan[]) : []
    },
    enabled: !!network,
  })

  const amountKobo = selectedPlan ? selectedPlan.amount * 100 : 0
  const hasEnoughBalance = walletBalance !== null && walletBalance >= (selectedPlan?.amount ?? 0)
  const canPay = network && phone.length >= 10 && selectedPlan

  const handlePinComplete = async (pin: string) => {
    if (!canPay || !network || !selectedPlan) return
    setLoading(true)
    setPinError('')

    try {
      toast.loading('Processing payment...', { id: 'data-pay' })

      const { data } = await billsApi.purchaseData({
        amount: selectedPlan.amount, // naira — backend converts to kobo internally
        recipient: phone,
        productId: selectedPlan.productId || selectedPlan.id,
        network,
        pin,
      })

      toast.dismiss('data-pay')
      setLastNetwork(network)
      setLastPhone(phone)

      const result = data?.data || data
      const transactionId = result?.transactionId
      const reference = result?.reference || transactionId || 'ref'
      const requestId = result?.requestId || transactionId || 'ref'
      const status = result?.status || 'PROCESSING'

      await refetchBalance()

      router.push(
        `/pay/result?reference=${reference}&requestId=${requestId}&status=${status}&amount=${amountKobo}&category=DATA&recipient=${phone}&network=${network}`
      )
    } catch (error: any) {
      toast.dismiss('data-pay')
      const msg = error?.response?.data?.message || 'Payment failed.'
      if (msg.toLowerCase().includes('pin')) {
        setPinError('Incorrect PIN. Please try again.')
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
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
        <div>
          <h1 className="text-xl font-bold text-gray-900">Buy Data</h1>
          <p className="text-sm text-gray-500">Earn 2% commission on every purchase</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
        <div>
          <Label className="mb-3 block text-sm font-medium">Select Network</Label>
          <NetworkSelector
            value={network}
            onChange={(n) => {
              setNetwork(n)
              setSelectedPlan(null)
            }}
            disabled={loading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Phone Number</Label>
          </div>
          {lastPhone && (
            <div className="mb-2">
              <button
                type="button"
                onClick={() => setPhone(lastPhone)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
              >
                {lastPhone} (last used)
              </button>
            </div>
          )}
          <Input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="08012345678"
            disabled={loading}
          />
        </div>

        {/* Data Plans */}
        {network && (
          <div>
            <Label className="mb-3 block text-sm font-medium">Select Plan</Label>
            {plansLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto scrollbar-hide">
                {plans?.map((plan: DataPlan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={cn(
                      'rounded-xl border-2 p-3 text-left transition-all',
                      selectedPlan?.id === plan.id
                        ? 'border-[#6C3CE1] bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <p className="text-sm font-semibold text-gray-900">{plan.name || plan.size}</p>
                    <p className="text-xs text-gray-500">{plan.validity}</p>
                    <p className="mt-1 text-base font-bold text-[#6C3CE1]">
                      {formatAmountFromNaira(plan.amount)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedPlan && !hasEnoughBalance && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">Insufficient balance</p>
            <p className="text-xs text-red-600 mt-1">
              Your balance: {formatAmountFromNaira(walletBalance || 0)}
            </p>
          </div>
        )}

        {selectedPlan && hasEnoughBalance && (
          <CommissionPreview amount={selectedPlan.amount} category="DATA" />
        )}
      </div>

      {canPay && hasEnoughBalance && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="mb-4 text-center text-sm font-medium text-gray-700">
            Enter PIN to confirm — {selectedPlan ? formatAmountFromNaira(selectedPlan.amount) : ''}
          </p>
          <PinInput
            onComplete={handlePinComplete}
            label=""
            error={pinError}
            disabled={loading}
          />
        </div>
      )}
    </div>
  )
}

export default function DataPage() {
  return (
    <IdentityGate>
      <DataPageInner />
    </IdentityGate>
  )
}
