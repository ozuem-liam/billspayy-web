'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CommissionPreview } from '@/components/shared/CommissionPreview'
import { PinInput } from '@/components/shared/PinInput'
import { Skeleton } from '@/components/ui/skeleton'
import { useWalletBalance } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { billsApi } from '@/lib/api'
import { cn, formatAmount, formatAmountFromNaira } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { CableProvider, CableTvProduct, CableTvValidation } from '@/types'
import { IdentityGate } from '@/components/shared/IdentityGate'

const PROVIDERS: Array<{
  id: CableProvider
  label: string
  serviceId: string
  logo: string
  borderColor: string
  selectedBg: string
}> = [
  {
    id: 'DSTV',
    label: 'DStv',
    serviceId: 'DSTV',
    logo: 'https://vtpass.com/resources/products/200X200/Pay-DSTV-Subscription.jpg',
    borderColor: 'border-blue-600',
    selectedBg: 'bg-blue-50',
  },
  {
    id: 'GOTV',
    label: 'GOtv',
    serviceId: 'GOTV',
    logo: 'https://vtpass.com/resources/products/200X200/Gotv-Payment.jpg',
    borderColor: 'border-cyan-500',
    selectedBg: 'bg-cyan-50',
  },
  {
    id: 'STARTIMES',
    label: 'Startimes',
    serviceId: 'STARTIMES',
    logo: 'https://vtpass.com/resources/products/200X200/Startimes-Subscription.jpg',
    borderColor: 'border-red-500',
    selectedBg: 'bg-red-50',
  },
  {
    id: 'SHOWMAX',
    label: 'Showmax',
    serviceId: 'SHOWMAX',
    logo: 'https://vtpass.com/resources/products/200X200/ShowMax.jpg',
    borderColor: 'border-orange-500',
    selectedBg: 'bg-orange-50',
  },
]

function CablePageInner() {
  const router = useRouter()
  const walletBalance = useAppStore((s) => s.walletBalance)

  const [provider, setProvider] = useState<CableProvider>('DSTV')
  const [cardNumber, setCardNumber] = useState('')
  const [validated, setValidated] = useState<CableTvValidation | null>(null)
  const [validating, setValidating] = useState(false)
  const [validateError, setValidateError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<CableTvProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')

  const { refetch: refetchBalance } = useWalletBalance()
  const currentProvider = PROVIDERS.find((p) => p.id === provider)!

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['cable-products', provider],
    queryFn: async () => {
      if (provider === 'DSTV') {
        const { data } = await billsApi.getMultichoiceProducts('DSTV')
        return data?.products || data?.data || []
      }
      if (provider === 'GOTV') {
        const { data } = await billsApi.getMultichoiceProducts('GOTV')
        return data?.products || data?.data || []
      }
      if (provider === 'STARTIMES') {
        const { data } = await billsApi.getStartimesProducts()
        return data?.products || data?.data || []
      }
      if (provider === 'SHOWMAX') {
        const { data } = await billsApi.getShowmaxPlans()
        return data?.plans || data?.data || []
      }
      return []
    },
  })

  const amountKobo = selectedPlan ? selectedPlan.amount * 100 : 0
  const hasEnoughBalance = walletBalance !== null && walletBalance >= amountKobo

  const handleValidate = async () => {
    if (!cardNumber) {
      toast.error('Please enter your smart card / decoder number')
      return
    }
    setValidating(true)
    setValidateError('')
    setValidated(null)

    try {
      const { data } = await billsApi.validateCableTv(cardNumber, currentProvider.serviceId)
      const result = data?.data || data
      setValidated({
        customerName: result.customerName || result.name,
        customerNo: cardNumber,
        currentPackage: result.currentPackage || result.bouquet,
      })
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Validation failed. Please check your card number.'
      setValidateError(msg)
    } finally {
      setValidating(false)
    }
  }

  const handlePinComplete = async (pin: string) => {
    if (!validated || !selectedPlan) return
    setLoading(true)
    setPinError('')

    try {
      toast.loading('Processing payment...', { id: 'cable-pay' })

      const { data } = await billsApi.purchaseCableTv({
        amount: amountKobo,
        customerNo: validated.customerNo,
        productCode: selectedPlan.productCode,
        serviceId: currentProvider.serviceId,
        pin,
      })

      toast.dismiss('cable-pay')
      const result = data?.data || data
      const reference = result?.reference || 'ref'
      const requestId = result?.requestId || reference
      const status = result?.status || 'PROCESSING'

      await refetchBalance()

      router.push(
        `/pay/result?reference=${reference}&requestId=${requestId}&status=${status}&amount=${amountKobo}&category=CABLETV`
      )
    } catch (error: any) {
      toast.dismiss('cable-pay')
      const msg = error?.response?.data?.message || 'Payment failed.'
      if (msg.toLowerCase().includes('pin')) {
        setPinError('Incorrect PIN.')
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
          <h1 className="text-xl font-bold text-gray-900">Cable TV</h1>
          <p className="text-sm text-gray-500">Earn 2% commission on every payment</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Provider Tabs */}
        <div>
          <Label className="mb-3 block text-sm font-medium">Select Provider</Label>
          <div className="grid grid-cols-4 gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProvider(p.id)
                  setSelectedPlan(null)
                  setValidated(null)
                  setValidateError('')
                }}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all',
                  provider === p.id
                    ? `${p.borderColor} ${p.selectedBg}`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.logo} alt={p.label} className="h-full w-full object-cover" />
                </div>
                <span className="text-xs font-medium text-gray-700">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Smart Card Number */}
        <div>
          <Label className="mb-2 block text-sm font-medium">
            {provider === 'SHOWMAX' ? 'Email Address' : 'Smart Card / Decoder Number'}
          </Label>
          <div className="flex gap-2">
            <Input
              type={provider === 'SHOWMAX' ? 'email' : 'text'}
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value)
                setValidated(null)
                setValidateError('')
              }}
              placeholder={provider === 'SHOWMAX' ? 'email@example.com' : 'Enter card number'}
              disabled={validating || loading}
            />
            <Button
              onClick={handleValidate}
              disabled={!cardNumber || validating}
              className="flex-shrink-0 bg-[#6C3CE1] hover:bg-[#5B32C7]"
            >
              {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
            </Button>
          </div>
          {validateError && (
            <p className="mt-2 text-sm text-red-500">{validateError}</p>
          )}
        </div>

        {/* Subscriber info */}
        {validated && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">{validated.customerName}</p>
                {validated.currentPackage && (
                  <p className="text-xs text-green-600">Current: {validated.currentPackage}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plan Picker */}
        <div>
          <Label className="mb-3 block text-sm font-medium">Select Plan</Label>
          {plansLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-hide">
              {plans?.map((plan: CableTvProduct) => (
                <button
                  key={plan.productCode || plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    'w-full rounded-xl border-2 p-4 text-left transition-all',
                    selectedPlan?.productCode === plan.productCode
                      ? 'border-[#6C3CE1] bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                      {plan.validity && (
                        <p className="text-xs text-gray-500">{plan.validity}</p>
                      )}
                    </div>
                    <p className="text-base font-bold text-[#6C3CE1]">
                      {formatAmountFromNaira(plan.amount)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedPlan && !hasEnoughBalance && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">Insufficient balance</p>
          </div>
        )}

        {selectedPlan && hasEnoughBalance && (
          <CommissionPreview amount={selectedPlan.amount} category="CABLETV" />
        )}
      </div>

      {validated && selectedPlan && hasEnoughBalance && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="mb-4 text-center text-sm font-medium text-gray-700">
            Enter PIN to confirm — {formatAmountFromNaira(selectedPlan.amount)}
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

export default function CablePage() {
  return (
    <IdentityGate>
      <CablePageInner />
    </IdentityGate>
  )
}
