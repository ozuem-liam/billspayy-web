'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'
import { additionalServicesApi } from '@/lib/api'
import { findServiceRecords, readServiceAmount, readServiceText } from '@/lib/serviceData'
import { getApiErrorMessage } from '@/lib/apiError'
import { formatAmountFromNaira } from '@/lib/utils'
import { PinInput } from '@/components/shared/PinInput'
import { Input } from '@/components/ui/input'
import { useWalletBalance } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { IdentityGate } from '@/components/shared/IdentityGate'
import toast from 'react-hot-toast'

const EDUCATION_SERVICES = [
  { serviceId: 'JAMB', name: 'JAMB' },
  { serviceId: 'WAEC', name: 'WAEC' },
  { serviceId: 'NECO', name: 'NECO' },
  { serviceId: 'NABTEB', name: 'NABTEB' },
] as const

type EducationPackage = { id: string; serviceId: string; name: string; description: string; amount: number }

function EducationPageInner() {
  const router = useRouter()
  const walletBalance = useAppStore((state) => state.walletBalance)
  const [serviceId, setServiceId] = useState('JAMB')
  const [selected, setSelected] = useState<EducationPackage | null>(null)
  const [recipient, setRecipient] = useState('')
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const { refetch: refetchBalance } = useWalletBalance()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['education-packages', serviceId],
    queryFn: async () => {
      const response = await additionalServicesApi.getEducationPackages(serviceId)
      return findServiceRecords(response.data).map((item, index): EducationPackage => ({
        id: readServiceText(item, ['id', 'productId', 'product_id', 'code', 'serviceId', 'service_id']) || `${serviceId}-${index}`,
        serviceId: readServiceText(item, ['serviceId', 'service_id', 'serviceCode', 'service_code']) || serviceId,
        name: readServiceText(item, ['name', 'title', 'packageName', 'package_name', 'description']) || `${serviceId} PIN`,
        description: readServiceText(item, ['description', 'validity', 'short_description']),
        amount: readServiceAmount(item),
      })).filter((item) => item.amount > 0)
    },
  })

  const hasEnoughBalance = !!selected && walletBalance !== null && walletBalance >= selected.amount

  async function handlePin(pin: string) {
    if (!selected || !recipient.trim()) return
    setLoading(true)
    setPinError('')
    try {
      const response = await additionalServicesApi.purchaseEducationPin({
        serviceId: selected.serviceId,
        recipient: recipient.trim(),
        amount: selected.amount,
        pin,
      })
      const result = response.data?.data ?? response.data
      await refetchBalance()
      router.push(`/pay/result?reference=${result.transactionId ?? 'pending'}&status=${result.status ?? 'QUEUED'}&amount=${selected.amount * 100}&category=LOGICAL_PINS&recipient=${encodeURIComponent(recipient.trim())}`)
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Unable to purchase this education PIN')
      if (message.toLowerCase().includes('pin')) setPinError(message)
      else toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" aria-label="Back to dashboard" className="rounded-full p-3 transition-colors hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
        <div><h1 className="text-xl font-bold text-gray-900">Education PINs</h1><p className="text-sm text-gray-500">Purchase exam and result-checking products</p></div>
      </div>

      <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Select provider</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {EDUCATION_SERVICES.map((service) => (
              <button
                key={service.serviceId}
                type="button"
                onClick={() => { setServiceId(service.serviceId); setSelected(null) }}
                className={`min-h-12 cursor-pointer rounded-xl border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CE1] ${serviceId === service.serviceId ? 'border-[#6C3CE1] bg-purple-50 text-[#6C3CE1]' : 'border-gray-200 text-gray-600 hover:border-purple-200'}`}
              >{service.name}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Available products</p>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : packages.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">No {serviceId} packages are currently available.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {packages.map((item) => (
                <button key={item.id} type="button" onClick={() => setSelected(item)} className={`cursor-pointer rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CE1] ${selected?.id === item.id ? 'border-[#6C3CE1] bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                  <div className="flex items-start justify-between gap-3"><BookOpen className="h-5 w-5 text-[#6C3CE1]" /><span className="font-bold text-gray-900">{formatAmountFromNaira(item.amount)}</span></div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{item.name}</p>
                  {item.description && <p className="mt-1 text-xs text-gray-500">{item.description}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && <div className="space-y-2 border-t border-gray-100 pt-4"><label htmlFor="education-recipient" className="text-sm font-medium text-gray-700">Recipient phone number or email</label><Input id="education-recipient" value={recipient} onChange={(event) => setRecipient(event.target.value)} className="h-11" placeholder="Enter delivery recipient" /></div>}
      </section>

      {selected && recipient.trim() && !hasEnoughBalance && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Insufficient wallet balance for {formatAmountFromNaira(selected.amount)}.</div>}
      {selected && recipient.trim() && hasEnoughBalance && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600"><GraduationCap className="h-4 w-4" /> PIN details will be delivered to {recipient.trim()}</div>
          <PinInput onComplete={handlePin} error={pinError} disabled={loading} label={`Enter PIN to pay ${formatAmountFromNaira(selected.amount)}`} />
        </section>
      )}
    </div>
  )
}

export default function EducationPage() {
  return <IdentityGate><EducationPageInner /></IdentityGate>
}
