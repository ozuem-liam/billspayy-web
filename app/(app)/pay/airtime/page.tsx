'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NetworkSelector } from '@/components/shared/NetworkSelector'
import { AmountInput } from '@/components/shared/AmountInput'
import { CommissionPreview } from '@/components/shared/CommissionPreview'
import { PinInput } from '@/components/shared/PinInput'
import { useWalletBalance } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { billsApi } from '@/lib/api'
import { formatAmount } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { NetworkProvider } from '@/types'
import { IdentityGate } from '@/components/shared/IdentityGate'

function AirtimePageInner() {
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
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')

  const { refetch: refetchBalance } = useWalletBalance()

  const amountKobo = amount * 100
  const hasEnoughBalance = walletBalance !== null && walletBalance >= amountKobo
  const canPay = network && phone.length >= 10 && amount >= 50

  const handlePinComplete = async (pin: string) => {
    if (!canPay || !network) return
    setLoading(true)
    setPinError('')

    try {
      toast.loading('Processing payment...', { id: 'airtime-pay' })

      // Map frontend network names to CreditSwitch airtime service codes
      const networkServiceMap: Record<string, string> = {
        MTN: 'A04E',
        GLO: 'A03E',
        AIRTEL: 'A01E',
        '9MOBILE': 'A02E',
      }

      const { data } = await billsApi.purchaseAirtime({
        amount: amountKobo,
        recipient: phone,
        serviceId: networkServiceMap[network] ?? network,
        pin,
      })

      toast.dismiss('airtime-pay')
      setLastNetwork(network)
      setLastPhone(phone)

      const result = data?.data || data
      const reference = result?.reference || result?.requestId || 'ref'
      const requestId = result?.requestId || result?.reference || 'ref'
      const status = result?.status || 'PROCESSING'

      await refetchBalance()

      router.push(
        `/pay/result?reference=${reference}&requestId=${requestId}&status=${status}&amount=${amountKobo}&category=AIRTIME&recipient=${phone}&network=${network}`
      )
    } catch (error: any) {
      toast.dismiss('airtime-pay')
      const msg = error?.response?.data?.message || 'Payment failed. Please try again.'
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Buy Airtime</h1>
          <p className="text-sm text-gray-500">Earn 2% commission on every purchase</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Network Selector */}
        <div>
          <Label className="mb-3 block text-sm font-medium">Select Network</Label>
          <NetworkSelector
            value={network}
            onChange={(n) => setNetwork(n)}
            disabled={loading}
          />
        </div>

        {/* Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium">Phone Number</Label>
            {user?.phone && (
              <button
                type="button"
                onClick={() => setPhone(user.phone!)}
                className="flex items-center gap-1 text-xs font-medium text-[#6C3CE1]"
              >
                <Phone className="h-3 w-3" />
                Use my number
              </button>
            )}
          </div>
          {lastPhone && lastPhone !== phone && (
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
            className="text-base"
          />
        </div>

        {/* Amount */}
        <AmountInput
          label="Amount"
          value={amount}
          onChange={setAmount}
          min={50}
          quickAmounts={[50, 100, 200, 500, 1000]}
          disabled={loading}
        />

        {/* Balance check */}
        {amount > 0 && !hasEnoughBalance && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">Insufficient balance</p>
            <p className="text-xs text-red-600 mt-1">
              Your balance: {formatAmount(walletBalance || 0)} · Need: {formatAmount(amountKobo)}
            </p>
          </div>
        )}

        {/* Commission Preview */}
        {amount > 0 && hasEnoughBalance && (
          <CommissionPreview amount={amount} category="AIRTIME" />
        )}
      </div>

      {/* PIN + Pay */}
      {canPay && hasEnoughBalance && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <p className="mb-4 text-center text-sm font-medium text-gray-700">
            Enter PIN to confirm payment of {formatAmount(amountKobo)}
          </p>
          <PinInput
            onComplete={handlePinComplete}
            label=""
            error={pinError}
            disabled={loading}
          />
        </div>
      )}

      {/* Fund wallet CTA if insufficient */}
      {amount > 0 && !hasEnoughBalance && (
        <Button
          onClick={() => router.push('/wallet')}
          className="w-full bg-[#F97316] hover:bg-orange-600"
          size="lg"
        >
          Fund Wallet First
        </Button>
      )}
    </div>
  )
}

export default function AirtimePage() {
  return (
    <IdentityGate>
      <AirtimePageInner />
    </IdentityGate>
  )
}
