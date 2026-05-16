'use client'

import { cn } from '@/lib/utils'
import type { NetworkProvider } from '@/types'

const NETWORKS: Array<{
  id: NetworkProvider
  label: string
  logo: string
  borderColor: string
  selectedBg: string
}> = [
  {
    id: 'MTN',
    label: 'MTN',
    logo: 'https://vtpass.com/resources/products/200X200/MTN-Airtime-VTU.jpg',
    borderColor: 'border-yellow-400',
    selectedBg: 'bg-yellow-50',
  },
  {
    id: 'GLO',
    label: 'Glo',
    logo: 'https://vtpass.com/resources/products/200X200/GLO-Airtime.jpg',
    borderColor: 'border-green-600',
    selectedBg: 'bg-green-50',
  },
  {
    id: 'AIRTEL',
    label: 'Airtel',
    logo: 'https://vtpass.com/resources/products/200X200/Airtel-Airtime-VTU.jpg',
    borderColor: 'border-red-500',
    selectedBg: 'bg-red-50',
  },
  {
    id: '9MOBILE',
    label: '9mobile',
    logo: 'https://vtpass.com/resources/products/200X200/9mobile-Airtime.jpg',
    borderColor: 'border-teal-500',
    selectedBg: 'bg-teal-50',
  },
]

interface NetworkSelectorProps {
  value: NetworkProvider | null
  onChange: (network: NetworkProvider) => void
  disabled?: boolean
}

export function NetworkSelector({ value, onChange, disabled }: NetworkSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {NETWORKS.map((net) => (
        <button
          key={net.id}
          type="button"
          onClick={() => onChange(net.id)}
          disabled={disabled}
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all',
            value === net.id
              ? `${net.borderColor} ${net.selectedBg}`
              : 'border-gray-200 bg-white hover:border-gray-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="h-10 w-10 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={net.logo} alt={net.label} className="h-full w-full object-cover" />
          </div>
          <span className="text-xs font-medium text-gray-700">{net.label}</span>
        </button>
      ))}
    </div>
  )
}
