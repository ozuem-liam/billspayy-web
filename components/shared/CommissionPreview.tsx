import { TrendingUp } from 'lucide-react'
import { formatAmountFromNaira } from '@/lib/utils'

interface CommissionPreviewProps {
  amount: number // in naira
  rate?: number // e.g. 0.006 for 0.6%
  commissionAmount?: number // override calculated amount (in naira)
  category?: string
}

// Default commission rates per category
const COMMISSION_RATES: Record<string, number> = {
  AIRTIME: 0.006,
  DATA: 0.006,
  ELECTRICITY: 0.006,
  CABLETV: 0.006,
}

export function CommissionPreview({
  amount,
  rate,
  commissionAmount,
  category = 'AIRTIME',
}: CommissionPreviewProps) {
  const effectiveRate = rate ?? COMMISSION_RATES[category.toUpperCase()] ?? 0.006
  const earned = commissionAmount ?? amount * effectiveRate

  if (!amount || amount <= 0) return null

  return (
    <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
        <TrendingUp className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-green-700">Commission earned</p>
        <p className="text-lg font-bold text-green-700">
          +{formatAmountFromNaira(earned)}
        </p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-xs text-green-600">{parseFloat((effectiveRate * 100).toFixed(1))}% back</p>
      </div>
    </div>
  )
}
