'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Globe2, Loader2, Signal } from 'lucide-react'
import { additionalServicesApi } from '@/lib/api'
import { findServiceRecords, findServiceStrings, readServiceAmount, readServiceText, type ServiceRecord } from '@/lib/serviceData'
import { getApiErrorMessage } from '@/lib/apiError'
import { formatAmountFromNaira } from '@/lib/utils'
import { PinInput } from '@/components/shared/PinInput'
import { Input } from '@/components/ui/input'
import { useWalletBalance } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import { IdentityGate } from '@/components/shared/IdentityGate'
import toast from 'react-hot-toast'

type Country = { code: string; name: string }
type EsimPackage = { productId: string; title: string; amount: number; description: string; raw: ServiceRecord }

function EsimPageInner() {
  const router = useRouter()
  const walletBalance = useAppStore((state) => state.walletBalance)
  const [country, setCountry] = useState('')
  const [selected, setSelected] = useState<EsimPackage | null>(null)
  const [iccid, setIccid] = useState('')
  const [loading, setLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const { refetch: refetchBalance } = useWalletBalance()

  const { data: countries = [], isLoading: countriesLoading } = useQuery({
    queryKey: ['esim-countries'],
    queryFn: async () => {
      const response = await additionalServicesApi.getEsimCountries()
      const records = findServiceRecords(response.data).map((item): Country => ({
        code: readServiceText(item, ['code', 'countryCode', 'country_code', 'iso', 'name', 'country']),
        name: readServiceText(item, ['name', 'country', 'title', 'countryName', 'country_name']),
      })).filter((item) => item.code && item.name)
      return records.length > 0
        ? records
        : findServiceStrings(response.data).map((name) => ({ code: name, name }))
    },
    staleTime: 60 * 60 * 1000,
  })

  const { data: packages = [], isLoading: packagesLoading } = useQuery({
    queryKey: ['esim-packages', country],
    enabled: !!country,
    queryFn: async () => {
      const response = await additionalServicesApi.getEsimPackages(country)
      return findServiceRecords(response.data).map((item): EsimPackage => ({
        productId: readServiceText(item, ['productId', 'product_id', 'id', 'code']),
        title: readServiceText(item, ['title', 'name', 'productName', 'product_name']),
        amount: readServiceAmount(item),
        description: readServiceText(item, ['description', 'validity', 'data', 'short_description']),
        raw: item,
      })).filter((item) => item.productId && item.title && item.amount > 0)
    },
  })

  const hasEnoughBalance = !!selected && walletBalance !== null && walletBalance >= selected.amount

  async function handlePin(pin: string) {
    if (!selected || !country) return
    if (iccid && !/^\d{18,22}$/.test(iccid)) {
      toast.error('ICCID must contain 18 to 22 digits')
      return
    }
    setLoading(true)
    setPinError('')
    try {
      const response = await additionalServicesApi.purchaseEsim({
        country,
        productId: selected.productId,
        iccid: iccid || undefined,
        pin,
      })
      const result = response.data?.data ?? response.data
      await refetchBalance()
      router.push(`/pay/result?reference=${result.transactionId ?? 'pending'}&status=${result.status ?? 'QUEUED'}&amount=${selected.amount * 100}&category=ESIM`)
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, 'Unable to purchase this eSIM package')
      if (message.toLowerCase().includes('pin')) setPinError(message)
      else toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" aria-label="Back to dashboard" className="rounded-full p-3 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Travel eSIM</h1>
          <p className="text-sm text-gray-500">Stay connected in supported countries</p>
        </div>
      </div>

      <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <label className="block text-sm font-medium text-gray-700" htmlFor="esim-country">Destination</label>
        <div className="relative">
          <select
            id="esim-country"
            value={country}
            onChange={(event) => { setCountry(event.target.value); setSelected(null) }}
            disabled={countriesLoading || loading}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-base outline-none focus:border-[#6C3CE1] focus:ring-2 focus:ring-[#6C3CE1]/20"
          >
            <option value="">Select a country</option>
            {countries.map((item) => <option key={`${item.code}-${item.name}`} value={item.code}>{item.name}</option>)}
          </select>
          {countriesLoading && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-gray-400" />}
        </div>

        {country && (
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700">Available packages</p>
            {packagesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}</div>
            ) : packages.length === 0 ? (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">No packages are currently available for this destination.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {packages.map((item) => (
                  <button
                    key={item.productId}
                    type="button"
                    onClick={() => setSelected(item)}
                    className={`min-h-24 cursor-pointer rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CE1] ${selected?.productId === item.productId ? 'border-[#6C3CE1] bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Signal className="mt-0.5 h-5 w-5 text-[#6C3CE1]" />
                      <span className="font-bold text-gray-900">{formatAmountFromNaira(item.amount)}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">{item.title}</p>
                    {item.description && <p className="mt-1 text-xs text-gray-500">{item.description}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {selected && (
          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label htmlFor="esim-iccid" className="text-sm font-medium text-gray-700">Existing eSIM ICCID <span className="font-normal text-gray-400">(optional, for top-up)</span></label>
            <Input id="esim-iccid" inputMode="numeric" value={iccid} onChange={(event) => setIccid(event.target.value.replace(/\D/g, '').slice(0, 22))} className="h-11" placeholder="18–22 digit ICCID" />
          </div>
        )}
      </section>

      {selected && !hasEnoughBalance && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Insufficient wallet balance for {formatAmountFromNaira(selected.amount)}.</div>}
      {selected && hasEnoughBalance && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600"><Globe2 className="h-4 w-4" /> Confirm {selected.title}</div>
          <PinInput onComplete={handlePin} error={pinError} disabled={loading} label={`Enter PIN to pay ${formatAmountFromNaira(selected.amount)}`} />
        </section>
      )}
    </div>
  )
}

export default function EsimPage() {
  return <IdentityGate><EsimPageInner /></IdentityGate>
}
