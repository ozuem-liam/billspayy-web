'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, ChevronDown, Loader2, Layers } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AmountInput } from '@/components/shared/AmountInput'
import { CommissionPreview } from '@/components/shared/CommissionPreview'
import { PinInput } from '@/components/shared/PinInput'
import { useWalletBalance } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { billsApi } from '@/lib/api'
import { cn, formatAmount } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { ElectricityValidation } from '@/types'
import { IdentityGate } from '@/components/shared/IdentityGate'

/** Logos keyed by vtpass serviceID, common backend aliases, and CreditSwitch codes (E01E–E18E) */
const DISCO_LOGOS: Record<string, string> = {
  // vtpass serviceIDs
  'ikeja-electric':        'https://vtpass.com/resources/products/200X200/Ikeja-Electric-Payment-PHCN.jpg',
  'eko-electric':          'https://vtpass.com/resources/products/200X200/Eko-Electric-Payment-PHCN.jpg',
  'abuja-electric':        'https://vtpass.com/resources/products/200X200/Abuja-Electric.jpg',
  'kano-electric':         'https://vtpass.com/resources/products/200X200/Kano-Electric.jpg',
  'portharcourt-electric': 'https://vtpass.com/resources/products/200X200/PHED-Port-Harcourt-Electric.jpg',
  'jos-electric':          'https://vtpass.com/resources/products/200X200/Jos-Electric-JED.jpg',
  'kaduna-electric':       'https://vtpass.com/resources/products/200X200/Kaduna-Electric-KAEDCO.jpg',
  'enugu-electric':        'https://vtpass.com/resources/products/200X200/Enugu-Electric-EEDC.jpg',
  'ibadan-electric':       'https://vtpass.com/resources/products/200X200/IBEDC-Ibadan-Electricity-Distribution-Company.jpg',
  'benin-electric':        'https://vtpass.com/resources/products/200X200/Benin-Electricity-BEDC.jpg',
  'aba-electric':          'https://vtpass.com/resources/products/200X200/Aba-Electric-Payment-ABEDC.jpg',
  'yola-electric':         'https://vtpass.com/resources/products/200X200/Yola-Electric-Payment-IKEDC.jpg',
  // Common backend / CreditSwitch short aliases
  'IKEDC': 'https://vtpass.com/resources/products/200X200/Ikeja-Electric-Payment-PHCN.jpg',
  'EKEDC': 'https://vtpass.com/resources/products/200X200/Eko-Electric-Payment-PHCN.jpg',
  'AEDC':  'https://vtpass.com/resources/products/200X200/Abuja-Electric.jpg',
  'KEDC':  'https://vtpass.com/resources/products/200X200/Kano-Electric.jpg',
  'PHEDC': 'https://vtpass.com/resources/products/200X200/PHED-Port-Harcourt-Electric.jpg',
  'JED':   'https://vtpass.com/resources/products/200X200/Jos-Electric-JED.jpg',
  'KAEDCO':'https://vtpass.com/resources/products/200X200/Kaduna-Electric-KAEDCO.jpg',
  'EEDC':  'https://vtpass.com/resources/products/200X200/Enugu-Electric-EEDC.jpg',
  'IBEDC': 'https://vtpass.com/resources/products/200X200/IBEDC-Ibadan-Electricity-Distribution-Company.jpg',
  'BEDC':  'https://vtpass.com/resources/products/200X200/Benin-Electricity-BEDC.jpg',
  // CreditSwitch E-codes
  'E01E': 'https://vtpass.com/resources/products/200X200/Ikeja-Electric-Payment-PHCN.jpg',
  'E02E': 'https://vtpass.com/resources/products/200X200/Ikeja-Electric-Payment-PHCN.jpg',
  'E03E': 'https://vtpass.com/resources/products/200X200/IBEDC-Ibadan-Electricity-Distribution-Company.jpg',
  'E04E': 'https://vtpass.com/resources/products/200X200/IBEDC-Ibadan-Electricity-Distribution-Company.jpg',
  'E05E': 'https://vtpass.com/resources/products/200X200/Eko-Electric-Payment-PHCN.jpg',
  'E06E': 'https://vtpass.com/resources/products/200X200/Eko-Electric-Payment-PHCN.jpg',
  'E07E': 'https://vtpass.com/resources/products/200X200/Abuja-Electric.jpg',
  'E08E': 'https://vtpass.com/resources/products/200X200/Abuja-Electric.jpg',
  'E09E': 'https://vtpass.com/resources/products/200X200/PHED-Port-Harcourt-Electric.jpg',
  'E10E': 'https://vtpass.com/resources/products/200X200/PHED-Port-Harcourt-Electric.jpg',
  'E11E': 'https://vtpass.com/resources/products/200X200/Kaduna-Electric-KAEDCO.jpg',
  'E12E': 'https://vtpass.com/resources/products/200X200/Kaduna-Electric-KAEDCO.jpg',
  'E13E': 'https://vtpass.com/resources/products/200X200/Jos-Electric-JED.jpg',
  'E14E': 'https://vtpass.com/resources/products/200X200/Jos-Electric-JED.jpg',
  'E15E': 'https://vtpass.com/resources/products/200X200/Enugu-Electric-EEDC.jpg',
  'E16E': 'https://vtpass.com/resources/products/200X200/Enugu-Electric-EEDC.jpg',
  'E17E': 'https://vtpass.com/resources/products/200X200/Kano-Electric.jpg',
  'E18E': 'https://vtpass.com/resources/products/200X200/Kano-Electric.jpg',
}

const FALLBACK_DISCOS = [
  { name: 'Ikeja Electric - IKEDC',       serviceId: 'ikeja-electric' },
  { name: 'Eko Electric - EKEDC',          serviceId: 'eko-electric' },
  { name: 'Abuja Electric - AEDC',         serviceId: 'abuja-electric' },
  { name: 'Port Harcourt Electric - PHED', serviceId: 'portharcourt-electric' },
  { name: 'Ibadan Electric - IBEDC',       serviceId: 'ibadan-electric' },
  { name: 'Enugu Electric - EEDC',         serviceId: 'enugu-electric' },
  { name: 'Kaduna Electric - KAEDCO',      serviceId: 'kaduna-electric' },
  { name: 'Kano Electric - KEDC',          serviceId: 'kano-electric' },
  { name: 'Jos Electric - JED',            serviceId: 'jos-electric' },
  { name: 'Benin Electric - BEDC',         serviceId: 'benin-electric' },
  { name: 'Aba Electric - ABEDC',          serviceId: 'aba-electric' },
  { name: 'Yola Electric - YEDC',          serviceId: 'yola-electric' },
]

function DiscoLogo({ serviceId, name }: { serviceId: string; name: string }) {
  const logo = DISCO_LOGOS[serviceId]
  if (!logo) {
    return (
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        {serviceId.slice(0, 2).toUpperCase()}
      </div>
    )
  }
  return (
    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo}
        alt={name}
        className="h-full w-full object-cover"
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = 'none'
          const parent = target.parentElement!
          parent.innerHTML = `<div class="flex h-full w-full items-center justify-center bg-orange-100 text-xs font-bold text-orange-700">${serviceId.slice(0, 2).toUpperCase()}</div>`
        }}
      />
    </div>
  )
}

function ElectricityPageInner() {
  const router = useRouter()
  const walletBalance = useAppStore((s) => s.walletBalance)
  const lastMeter = useAppStore((s) => s.lastMeterNumber)
  const setLastMeter = useAppStore((s) => s.setLastMeterNumber)

  const [serviceId, setServiceId] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [meterNumber, setMeterNumber] = useState(lastMeter || '')
  const [validated, setValidated] = useState<ElectricityValidation | null>(null)
  const [validating, setValidating] = useState(false)
  const [validateError, setValidateError] = useState('')
  const [amount, setAmount] = useState(0)
  const [mdEnabled, setMdEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')

  const { refetch: refetchBalance } = useWalletBalance()

  const { data: electricityCodes } = useQuery({
    queryKey: ['electricity-codes'],
    queryFn: async () => {
      const { data } = await billsApi.getElectricityCodes()
      const raw = data?.data ?? data
      if (Array.isArray(raw)) return raw as { name: string; serviceId: string }[]
      if (raw && typeof raw === 'object') {
        return Object.entries(raw).map(([name, serviceId]) => ({ name, serviceId: serviceId as string }))
      }
      return []
    },
    staleTime: 1000 * 60 * 60,
  })

  const discos = (electricityCodes && electricityCodes.length > 0) ? electricityCodes : FALLBACK_DISCOS
  const selectedDisco = discos.find((d) => d.serviceId === serviceId)

  const amountKobo = amount * 100
  const hasEnoughBalance = walletBalance !== null && walletBalance >= amountKobo
  const mdCapValueKobo = validated?.mdCapValueKobo ?? 0
  const showMdToggle = !!(validated?.mdEnabled && mdCapValueKobo > 0 && amountKobo > mdCapValueKobo)

  const handleValidate = async () => {
    if (!serviceId || !meterNumber) {
      toast.error('Please select a DISCO and enter meter number')
      return
    }
    setValidating(true)
    setValidateError('')
    setValidated(null)

    try {
      const { data } = await billsApi.validateElectricity(meterNumber, serviceId)
      const result = data?.data || data
      const isMdEligible = result.mdEnabled || false
      setValidated({
        customerName: result.customerName || result.name,
        customerAddress: result.customerAddress || result.address || '',
        customerAccountId: meterNumber,
        mdEnabled: isMdEligible,
        mdCapValueKobo: result.mdCapValueKobo || 0,
      })
      setMdEnabled(isMdEligible)
      setLastMeter(meterNumber)
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Meter validation failed. Please check the details.'
      setValidateError(msg)
    } finally {
      setValidating(false)
    }
  }

  const handlePinComplete = async (pin: string) => {
    if (!validated || !serviceId) return
    setLoading(true)
    setPinError('')

    try {
      toast.loading('Processing payment...', { id: 'elec-pay' })

      const { data } = await billsApi.purchaseElectricity({
        amount, // naira — backend converts to kobo internally
        customerAccountId: validated.customerAccountId,
        customerName: validated.customerName,
        customerAddress: validated.customerAddress,
        serviceId,
        pin,
        mdEnabled: showMdToggle && mdEnabled,
      })

      toast.dismiss('elec-pay')
      const result = data?.data || data
      const reference = result?.reference || 'ref'
      const requestId = result?.requestId || reference
      const status = result?.status || 'PROCESSING'

      await refetchBalance()

      router.push(
        `/pay/result?reference=${reference}&requestId=${requestId}&status=${status}&amount=${amountKobo}&category=ELECTRICITY`
      )
    } catch (error: any) {
      toast.dismiss('elec-pay')
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
          <h1 className="text-xl font-bold text-gray-900">Pay Electricity</h1>
          <p className="text-sm text-gray-500">Earn 2% commission on every payment</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">

        {/* DISCO Selector */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Select DISCO</Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
                dropdownOpen ? 'border-[#6C3CE1] ring-1 ring-[#6C3CE1]' : 'border-gray-200 hover:border-gray-300',
                'bg-white'
              )}
            >
              {selectedDisco ? (
                <>
                  <DiscoLogo serviceId={selectedDisco.serviceId} name={selectedDisco.name} />
                  <span className="flex-1 text-left text-gray-900">{selectedDisco.name}</span>
                </>
              ) : (
                <span className="flex-1 text-left text-gray-400">Choose electricity provider</span>
              )}
              <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  {discos.map((disco) => (
                    <button
                      key={disco.serviceId}
                      type="button"
                      onClick={() => {
                        setServiceId(disco.serviceId)
                        setValidated(null)
                        setDropdownOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-gray-50',
                        serviceId === disco.serviceId && 'bg-purple-50'
                      )}
                    >
                      <DiscoLogo serviceId={disco.serviceId} name={disco.name} />
                      <span className={cn('flex-1 text-left', serviceId === disco.serviceId ? 'font-medium text-[#6C3CE1]' : 'text-gray-900')}>
                        {disco.name}
                      </span>
                      {serviceId === disco.serviceId && (
                        <CheckCircle className="h-4 w-4 text-[#6C3CE1]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meter Number */}
        <div>
          <Label className="mb-2 block text-sm font-medium">Meter Number</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={meterNumber}
              onChange={(e) => {
                setMeterNumber(e.target.value)
                setValidated(null)
                setValidateError('')
                setMdEnabled(false)
              }}
              placeholder="Enter meter number"
              disabled={validating || loading}
            />
            <Button
              onClick={handleValidate}
              disabled={!serviceId || !meterNumber || validating}
              className="flex-shrink-0 bg-[#6C3CE1] hover:bg-[#5B32C7]"
            >
              {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
            </Button>
          </div>
          {validateError && (
            <p className="mt-2 text-sm text-red-500">{validateError}</p>
          )}
        </div>

        {/* Customer Info (after validation) */}
        {validated && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">Meter verified</p>
                <p className="text-sm text-green-700">{validated.customerName}</p>
                {validated.customerAddress && (
                  <p className="text-xs text-green-600">{validated.customerAddress}</p>
                )}
              </div>
            </div>

            {/* MD Toggle — only shown when amount exceeds the cap */}
            {showMdToggle && (
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Maximum Demand (MD) mode</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Split large payments into sub-transactions to comply with DISCO limits
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={mdEnabled}
                onClick={() => setMdEnabled((v) => !v)}
                className={cn(
                  'relative ml-3 h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CE1] focus-visible:ring-offset-2',
                  mdEnabled ? 'bg-[#6C3CE1]' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                    mdEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                  style={{ marginTop: 2 }}
                />
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Step B: Payment */}
      {validated && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-6">
          <AmountInput
            label="Amount"
            value={amount}
            onChange={setAmount}
            min={500}
            quickAmounts={[1000, 2000, 5000, 10000, 20000]}
            disabled={loading}
          />

          {amount > 0 && !hasEnoughBalance && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">Insufficient balance</p>
              <p className="text-xs text-red-600 mt-1">
                Your balance: {formatAmount(walletBalance || 0)}
              </p>
            </div>
          )}

          {amount >= 500 && hasEnoughBalance && (
            <CommissionPreview amount={amount} category="ELECTRICITY" />
          )}
        </div>
      )}

      {/* PIN Input */}
      {validated && amount >= 500 && hasEnoughBalance && (
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
    </div>
  )
}

export default function ElectricityPage() {
  return (
    <IdentityGate>
      <ElectricityPageInner />
    </IdentityGate>
  )
}
