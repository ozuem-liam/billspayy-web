'use client'

import { use } from 'react'
import { ArrowLeft, Share2, AlertTriangle, Copy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/shared/StatusChip'
import { SkeletonCard } from '@/components/shared/SkeletonCard'
import { useReceipt } from '@/hooks/useTransactions'
import { formatAmountFromNaira, formatDate, getCategoryIcon, getCategoryLabel } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ReceiptPageProps {
  params: Promise<{ reference: string }>
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const { reference } = use(params)
  const { data: receipt, isLoading, error } = useReceipt(reference)

  const handleShare = async () => {
    const text = `Receipt: ${getCategoryLabel(receipt?.category || '')} — ${formatAmountFromNaira(receipt?.amount || 0)}\nRef: ${reference}\nDate: ${formatDate(receipt?.createdAt || '')}`
    try {
      if (navigator.share) {
        await navigator.share({ text, title: 'BillsPayy Receipt' })
      } else {
        await navigator.clipboard.writeText(text)
        toast.success('Receipt copied to clipboard!')
      }
    } catch {
      // cancelled
    }
  }

  const handleCopyRef = async () => {
    await navigator.clipboard.writeText(reference)
    toast.success('Reference copied!')
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/transactions">
            <button className="rounded-full p-3 hover:bg-gray-100 transition">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Receipt</h1>
        </div>
        <SkeletonCard lines={8} />
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/transactions">
            <button className="rounded-full p-3 hover:bg-gray-100 transition">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Receipt</h1>
        </div>
        <div className="rounded-2xl bg-white p-10 text-center border border-gray-100">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="font-semibold text-gray-700">Receipt not found</p>
          <p className="text-sm text-gray-400 mt-1 font-mono">{reference}</p>
        </div>
      </div>
    )
  }

  const icon = getCategoryIcon(receipt.category)
  const label = getCategoryLabel(receipt.category)

  const rows: Array<{ label: string; value: string; mono?: boolean; copiable?: boolean }> = [
    receipt.recipient && { label: 'Recipient', value: receipt.recipient },
    receipt.meterNumber && { label: 'Meter No.', value: receipt.meterNumber, mono: true },
    receipt.customerName && { label: 'Customer', value: receipt.customerName },
    receipt.customerAddress && { label: 'Address', value: receipt.customerAddress },
    receipt.token && { label: 'Token', value: receipt.token, mono: true, copiable: true },
    receipt.smartCardNumber && { label: 'Smart Card', value: receipt.smartCardNumber, mono: true },
    receipt.serviceId && { label: 'Provider', value: receipt.serviceId },
    { label: 'Reference', value: reference, mono: true, copiable: true },
  ].filter(Boolean) as Array<{ label: string; value: string; mono?: boolean; copiable?: boolean }>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/transactions">
            <button className="rounded-full p-3 hover:bg-gray-100 transition">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Receipt</h1>
        </div>
        <button
          onClick={handleShare}
          className="rounded-full p-3 hover:bg-gray-100 transition"
          title="Share receipt"
        >
          <Share2 className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
        {/* Status Hero */}
        <div className="px-6 pt-8 pb-6 text-center border-b border-gray-50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-4xl">
            {icon}
          </div>
          <div className="mb-3">
            <StatusChip status={receipt.status} size="md" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {formatAmountFromNaira(receipt.amount)}
          </p>
          <p className="text-sm text-gray-500 mt-1.5">
            {label}{receipt.serviceName ? ` · ${receipt.serviceName}` : ''}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(receipt.createdAt)}</p>
        </div>

        {/* Details */}
        {rows.length > 0 && (
          <div className="divide-y divide-gray-50">
            {rows.map(({ label, value, mono, copiable }) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <p className="text-sm text-gray-400 shrink-0">{label}</p>
                <div className="flex items-center gap-2 min-w-0">
                  <p
                    className={`text-sm font-semibold text-gray-900 text-right break-all leading-snug ${
                      mono ? 'font-mono' : ''
                    }`}
                  >
                    {value}
                  </p>
                  {copiable && (
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(value)
                        toast.success('Copied!')
                      }}
                      className="shrink-0 rounded-lg p-1 hover:bg-gray-100 transition"
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Commission */}
        {receipt.commission > 0 && (
          <div className="mx-5 mb-5 mt-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">Commission Earned</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">You earned</p>
              <p className="text-lg font-bold text-green-700">{formatAmountFromNaira(receipt.commission)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleShare}
          className="bg-[#6C3CE1] hover:bg-[#5B32C7]"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
        <Button
          variant="outline"
          className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
          onClick={() => toast('Contact support@billspayy.com', { icon: '📧' })}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Report Issue
        </Button>
      </div>
    </div>
  )
}
