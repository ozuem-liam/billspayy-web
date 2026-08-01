'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, FileCheck2, ShieldCheck } from 'lucide-react'
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

type VerificationPackage = { code: string; name: string; description: string; amount: number }

function displayFields(value: unknown): Array<[string, string]> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  return Object.entries(value as Record<string, unknown>)
    .filter(([, field]) => ['string', 'number', 'boolean'].includes(typeof field) && String(field).trim())
    .map(([key, field]) => [key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(), String(field)] as [string, string])
}

function VerificationPageInner() {
  const walletBalance = useAppStore((state) => state.walletBalance)
  const [selected, setSelected] = useState<VerificationPackage | null>(null)
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const { refetch: refetchBalance } = useWalletBalance()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['verification-packages'],
    queryFn: async () => {
      const response = await additionalServicesApi.getVerificationPackages()
      return findServiceRecords(response.data).map((item): VerificationPackage => ({
        code: readServiceText(item, ['service_code', 'serviceCode', 'serviceId', 'code']),
        name: readServiceText(item, ['service_name', 'serviceName', 'name', 'title']),
        description: readServiceText(item, ['service_description', 'serviceDescription', 'description']),
        amount: readServiceAmount(item),
      })).filter((item) => item.code && item.name && item.amount > 0)
    },
    staleTime: 15 * 60 * 1000,
  })

  const hasEnoughBalance = !!selected && walletBalance !== null && walletBalance >= selected.amount

  async function handlePin(pin: string) {
    if (!selected || !identifier.trim()) return
    setLoading(true)
    setPinError('')
    setResult(null)
    try {
      const response = await additionalServicesApi.purchaseVerification({
        serviceId: selected.code,
        uniqueIdentifier: identifier.trim(),
        pin,
      })
      const transaction = response.data?.data ?? response.data
      if (transaction.status !== 'SUCCESSFUL') {
        throw new Error(transaction.reason ?? 'Verification was not successful; your wallet has been refunded')
      }
      const providerResult = transaction.providerResult ?? {}
      const details = providerResult.data ?? providerResult.details ?? providerResult.detail ?? providerResult
      setResult(details && typeof details === 'object' ? details as Record<string, unknown> : { result: String(details) })
      setIdentifier('')
      await refetchBalance()
      toast.success('Verification completed')
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Unable to complete verification')
      if (message.toLowerCase().includes('pin')) setPinError(message)
      else toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fields = displayFields(result)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" aria-label="Back to dashboard" className="rounded-full p-3 transition-colors hover:bg-gray-100"><ArrowLeft className="h-5 w-5 text-gray-600" /></Link>
        <div><h1 className="text-xl font-bold text-gray-900">Verification Services</h1><p className="text-sm text-gray-500">Secure identity and document lookups</p></div>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p>Your identifier is sent securely for this lookup and is not retained in the bill transaction payload.</p></div>

      <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">Choose a verification service</p>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : packages.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Verification services are temporarily unavailable.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {packages.map((item) => (
                <button key={item.code} type="button" onClick={() => { setSelected(item); setResult(null) }} className={`cursor-pointer rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CE1] ${selected?.code === item.code ? 'border-[#6C3CE1] bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                  <div className="flex items-start justify-between gap-3"><FileCheck2 className="h-5 w-5 text-[#6C3CE1]" /><span className="font-bold text-gray-900">{formatAmountFromNaira(item.amount)}</span></div>
                  <p className="mt-2 text-sm font-semibold text-gray-900">{item.name}</p>
                  {item.description && <p className="mt-1 text-xs leading-5 text-gray-500">{item.description}</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {selected && <div className="space-y-2 border-t border-gray-100 pt-4"><label htmlFor="verification-id" className="text-sm font-medium text-gray-700">Identifier for {selected.name}</label><Input id="verification-id" value={identifier} onChange={(event) => setIdentifier(event.target.value.replace(/\s/g, ''))} className="h-11" autoComplete="off" placeholder="Enter the number to verify" /></div>}
      </section>

      {selected && identifier && !hasEnoughBalance && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Insufficient wallet balance for {formatAmountFromNaira(selected.amount)}.</div>}
      {selected && identifier && hasEnoughBalance && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><PinInput onComplete={handlePin} error={pinError} disabled={loading} label={`Enter PIN to pay ${formatAmountFromNaira(selected.amount)}`} /></section>
      )}

      {result && (
        <section className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm" aria-live="polite">
          <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /><h2 className="font-semibold text-gray-900">Verification result</h2></div>
          {fields.length > 0 ? <dl className="grid gap-3 sm:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="rounded-xl bg-gray-50 p-3"><dt className="text-xs capitalize text-gray-500">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-gray-900">{value}</dd></div>)}</dl> : <p className="text-sm text-gray-600">The provider confirmed this verification successfully.</p>}
        </section>
      )}
    </div>
  )
}

export default function VerificationPage() {
  return <IdentityGate><VerificationPageInner /></IdentityGate>
}
