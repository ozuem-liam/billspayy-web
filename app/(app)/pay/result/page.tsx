'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, Home, RotateCcw, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatAmountFromNaira, getCategoryLabel } from '@/lib/utils'

interface ResultPageProps {
  searchParams: Promise<{
    reference?: string
    status?: string
    amount?: string
    category?: string
    recipient?: string
    network?: string
  }>
}

export default function ResultPage({ searchParams }: ResultPageProps) {
  const params = use(searchParams)
  const router = useRouter()

  const reference = params.reference || ''
  const status = params.status || 'QUEUED'
  const amount = parseInt(params.amount || '0', 10)
  const category = params.category || 'AIRTIME'
  const recipient = params.recipient || ''
  const network = params.network || ''

  const isSuccess = status === 'SUCCESS' || status === 'SUCCESSFUL'
  const isFailed = status === 'FAILED'
  const isPending = !isSuccess && !isFailed

  const label = getCategoryLabel(category)
  const subtitle = [label, network, recipient].filter(Boolean).join(' · ')
  // amount from URL is in kobo, convert to naira for display
  const amountNaira = amount / 100

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">

          {/* Status area */}
          <div className="px-8 pt-10 pb-8 text-center">
            {isPending && (
              <>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                  <Clock className="h-10 w-10 text-blue-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Payment submitted</h1>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Your payment has been received and is being processed. Check your transactions to confirm the status.
                </p>
              </>
            )}

            {isSuccess && (
              <>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle className="h-11 w-11 text-green-500" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Payment successful</h1>
                <p className="mt-3 text-3xl font-bold text-gray-900 tracking-tight">
                  {formatAmountFromNaira(amountNaira)}
                </p>
                {subtitle && <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>}
              </>
            )}

            {isFailed && (
              <>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                  <XCircle className="h-11 w-11 text-red-400" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Payment failed</h1>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  Your wallet has been refunded {formatAmountFromNaira(amountNaira)}.
                </p>
              </>
            )}
          </div>

          {/* Reference */}
          {reference && reference !== 'ref' && (
            <div className="mx-5 mb-5 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-400 mb-0.5">Reference</p>
              <p className="text-xs font-mono font-semibold text-gray-700 break-all leading-relaxed">{reference}</p>
            </div>
          )}

          {/* Actions */}
          <div className="px-5 pb-6 space-y-2.5">
            {(isSuccess || isPending) && reference && reference !== 'ref' && (
              <Link href={`/transactions/${reference}`} className="block">
                <Button className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7] h-11" size="lg">
                  <FileText className="mr-2 h-4 w-4" />
                  {isSuccess ? 'View Receipt' : 'View Transaction'}
                </Button>
              </Link>
            )}

            {(isSuccess || isFailed) && (
              <Button
                variant="outline"
                className="w-full h-11 border-gray-200"
                onClick={() => router.push(`/pay/${category.toLowerCase()}`)}
                size="lg"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {isFailed ? 'Try Again' : 'Pay Again'}
              </Button>
            )}

            {isPending && (
              <Link href="/transactions" className="block">
                <Button variant="outline" className="w-full h-11 border-gray-200" size="lg">
                  <FileText className="mr-2 h-4 w-4" />
                  My Transactions
                </Button>
              </Link>
            )}

            <Link href="/dashboard" className="block">
              <Button variant="ghost" className="w-full h-10 text-gray-500 hover:text-gray-700">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
