import { TrendingUp } from 'lucide-react'
import { formatAmountFromNaira } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { commissionApi, type CommissionPreviewResponse } from '@/lib/api'

interface CommissionPreviewProps {
  amount: number // in naira
  category?: string
  provider?: string
}

export function CommissionPreview({
  amount,
  category = 'AIRTIME',
  provider,
}: CommissionPreviewProps) {
  if (!amount || amount <= 0) return null

  return <CommissionPreviewContent amount={amount} category={category} provider={provider} />
}

function CommissionPreviewContent({
  amount,
  category,
  provider,
}: {
  amount: number
  category: string
  provider?: string
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['commission-preview', category, provider ?? null, amount],
    queryFn: async () => {
      const response = await commissionApi.preview({
        serviceId: category,
        provider,
        amountNaira: amount,
      })
      return (response.data?.data ?? response.data) as CommissionPreviewResponse
    },
    staleTime: 30_000,
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="h-[78px] animate-pulse rounded-xl border border-gray-200 bg-gray-50" aria-label="Calculating cashback" />
    )
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800" role="status">
        Cashback preview is temporarily unavailable. Your payment can still continue.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
        <TrendingUp className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-green-700">Commission earned</p>
        <p className="text-lg font-bold text-green-700">
          +{formatAmountFromNaira(data.customerCommissionNaira)}
        </p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-xs text-green-700">{parseFloat((data.customerRateBps / 100).toFixed(2))}% back</p>
      </div>
    </div>
  )
}
