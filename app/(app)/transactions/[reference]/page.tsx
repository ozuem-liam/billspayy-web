'use client'

import { use, useState } from 'react'
import { ArrowLeft, Share2, AlertTriangle, Copy, Download } from 'lucide-react'
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

// Map Creditswitch service IDs to human-readable provider names
const SERVICE_ID_NAMES: Record<string, string> = {
  // Airtime
  A04E: 'MTN',
  A03E: 'Glo',
  A01E: 'Airtel',
  A02E: '9mobile',
  // Electricity
  'ikeja-electric': 'Ikeja Electric (IKEDC)',
  'eko-electric': 'Eko Electric (EKEDC)',
  'abuja-electric': 'Abuja Electric (AEDC)',
  'portharcourt-electric': 'Port Harcourt Electric (PHED)',
  'ibadan-electric': 'Ibadan Electric (IBEDC)',
  'enugu-electric': 'Enugu Electric (EEDC)',
  'kaduna-electric': 'Kaduna Electric (KAEDCO)',
  'kano-electric': 'Kano Electric (KEDC)',
  'jos-electric': 'Jos Electric (JED)',
  'benin-electric': 'Benin Electric (BEDC)',
  'aba-electric': 'Aba Electric (ABEDC)',
  'yola-electric': 'Yola Electric (YEDC)',
  // Cable TV
  DSTV: 'DStv',
  GOTV: 'GOtv',
  STARTIMES: 'StarTimes',
  SHOWMAX: 'Showmax',
}

function getProviderName(serviceId: string | null | undefined): string | null {
  if (!serviceId) return null
  return SERVICE_ID_NAMES[serviceId] ?? SERVICE_ID_NAMES[serviceId.toUpperCase()] ?? serviceId
}

export default function ReceiptPage({ params }: ReceiptPageProps) {
  const { reference } = use(params)
  const { data: receipt, isLoading, error } = useReceipt(reference)
  const [downloading, setDownloading] = useState(false)

  const handleShare = async () => {
    const lines = [
      `BillsPayy Receipt`,
      `─────────────────────`,
      `${getCategoryLabel(receipt?.category || '')}${receipt?.serviceName ? ` · ${receipt.serviceName}` : ''}`,
      `Amount: ${formatAmountFromNaira(receipt?.amount || 0)}`,
      `Status: ${receipt?.status || ''}`,
      receipt?.recipient ? `Recipient: ${receipt.recipient}` : null,
      receipt?.meterNumber ? `Meter No.: ${receipt.meterNumber}` : null,
      receipt?.customerName ? `Customer: ${receipt.customerName}` : null,
      receipt?.token ? `Token: ${receipt.token}` : null,
      receipt?.smartCardNumber ? `Smart Card: ${receipt.smartCardNumber}` : null,
      `Ref: ${reference}`,
      `Date: ${formatDate(receipt?.createdAt || '')}`,
    ].filter(Boolean).join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ text: lines, title: 'BillsPayy Receipt' })
      } else {
        await navigator.clipboard.writeText(lines)
        toast.success('Receipt copied to clipboard!')
      }
    } catch {
      // cancelled
    }
  }

  const handleDownload = async () => {
    if (!receipt) return
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      const margin = 60
      let y = 60

      doc.setFont('courier', 'normal')
      doc.setTextColor('#111827')

      const row = (label: string, value: string) => {
        doc.setFontSize(11)
        doc.text(`${label.padEnd(12)}: ${value}`, margin, y)
        y += 18
      }

      const divider = (char = '-', len = 42) => {
        doc.setFontSize(11)
        doc.text(char.repeat(len), margin, y)
        y += 18
      }

      // Title
      doc.setFontSize(13)
      doc.setFont('courier', 'bold')
      doc.text('BILLSPAYY RECEIPT', margin, y)
      y += 18
      divider('=')
      y += 6

      // Main fields
      row('Service', `${getCategoryLabel(receipt.category || '')}${receipt.serviceName ? ' · ' + receipt.serviceName : ''}`)
      row('Amount', formatAmountFromNaira(receipt.amount))
      row('Status', receipt.status ?? '')
      row('Date', formatDate(receipt.createdAt))

      y += 6

      if (receipt.recipient)       row('Recipient', receipt.recipient)
      if (receipt.meterNumber)     row('Meter No.', receipt.meterNumber)
      if (receipt.customerName)    row('Customer', receipt.customerName)
      if (receipt.customerAddress) row('Address', receipt.customerAddress)
      if (receipt.token)           row('Token', receipt.token)
      if (receipt.smartCardNumber) row('Smart Card', receipt.smartCardNumber)
      if (providerName)            row('Provider', providerName)

      y += 6
      row('Reference', reference)
      if (receipt.commission > 0)  row('Commission', `${formatAmountFromNaira(receipt.commission)} earned`)

      y += 12
      divider('-')
      doc.setFont('courier', 'normal')
      doc.setFontSize(10)
      doc.setTextColor('#6B7280')
      doc.text('Powered by BillsPayy · billspayy.com', margin, y)

      doc.save(`billspayy-receipt-${reference}.pdf`)
      toast.success('Receipt downloaded!')
    } catch (err) {
      console.error('PDF error:', err)
      toast.error('Could not generate PDF')
    } finally {
      setDownloading(false)
    }
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
  const providerName = getProviderName(receipt.serviceId)

  const rows: Array<{ label: string; value: string; mono?: boolean; copiable?: boolean; highlight?: boolean }> = [
    receipt.recipient && { label: 'Recipient', value: receipt.recipient },
    receipt.meterNumber && { label: 'Meter No.', value: receipt.meterNumber, mono: true },
    receipt.customerName && { label: 'Customer', value: receipt.customerName },
    receipt.customerAddress && { label: 'Address', value: receipt.customerAddress },
    receipt.token && { label: 'Token', value: receipt.token, mono: true, copiable: true, highlight: true },
    receipt.smartCardNumber && { label: 'Smart Card', value: receipt.smartCardNumber, mono: true },
    providerName && { label: 'Provider', value: providerName },
    { label: 'Reference', value: reference, mono: true, copiable: true },
  ].filter(Boolean) as Array<{ label: string; value: string; mono?: boolean; copiable?: boolean; highlight?: boolean }>

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
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="rounded-full p-3 hover:bg-gray-100 transition disabled:opacity-50"
            title="Download receipt"
          >
            <Download className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={handleShare}
            className="rounded-full p-3 hover:bg-gray-100 transition"
            title="Share receipt"
          >
            <Share2 className="h-5 w-5 text-gray-500" />
          </button>
        </div>
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
            {rows.map(({ label, value, mono, copiable, highlight }) => (
              <div
                key={label}
                className={`flex items-center justify-between gap-4 px-5 py-3.5 ${highlight ? 'bg-amber-50/60' : ''}`}
              >
                <p className={`text-sm shrink-0 ${highlight ? 'font-semibold text-amber-700' : 'text-gray-400'}`}>
                  {label}
                </p>
                <div className="flex items-center gap-2 min-w-0">
                  <p
                    className={`text-sm font-semibold text-right break-all leading-snug ${
                      highlight ? 'text-amber-900 text-base' : 'text-gray-900'
                    } ${mono ? 'font-mono' : ''}`}
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
                      <Copy className={`h-3.5 w-3.5 ${highlight ? 'text-amber-500' : 'text-gray-400'}`} />
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
      <div className="space-y-3">
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7] disabled:opacity-60"
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? 'Generating…' : 'Download Receipt'}
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
            onClick={() => toast('Contact support@billspayy.com', { icon: '📧' })}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report
          </Button>
        </div>
      </div>
    </div>
  )
}
