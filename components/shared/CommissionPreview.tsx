import { TrendingUp } from 'lucide-react'
import { formatAmountFromNaira } from '@/lib/utils'

interface CommissionPreviewProps {
  amount: number // in naira
  rate?: number // e.g. 0.006 for 0.6%
  commissionAmount?: number // override calculated amount (in naira)
  category?: string
  provider?: string // e.g. "MTN", "EKEDC" — used to pick provider-specific rate
}

// Default fallback commission rates per category (platform minimum)
const COMMISSION_RATES: Record<string, number> = {
  AIRTIME: 0.025,
  DATA: 0.025,
  ELECTRICITY: 0.005,
  CABLETV: 0.01,
  SHOWMAX: 0.01,
}

// Provider-specific rates from Creditswitch schedule
const PROVIDER_RATES: Record<string, number> = {
  // Airtime / Data
  MTN: 0.025, AIRTEL: 0.025, GLO: 0.04, '9MOBILE': 0.05,
  // Cable TV
  DSTV: 0.01, GOTV: 0.01, STARTIMES: 0.01, SHOWMAX: 0.01,
  // Electricity
  AEDC: 0.01, EKEDC: 0.005, ENUGU: 0.01, IBEDC: 0.005,
  IKEDC: 0.005, JED: 0.01, BEDC: 0.01, KAEDCO: 0.01,
  APLE: 0.01, KEDCO: 0.01, PHED: 0.01, YEDC: 0.01,
}

export function CommissionPreview({
  amount,
  rate,
  commissionAmount,
  category = 'AIRTIME',
  provider,
}: CommissionPreviewProps) {
  const effectiveRate =
    rate ??
    (provider ? PROVIDER_RATES[provider.toUpperCase()] : undefined) ??
    COMMISSION_RATES[category.toUpperCase()] ??
    0.006
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
