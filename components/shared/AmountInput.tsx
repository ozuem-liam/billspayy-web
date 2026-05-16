'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface AmountInputProps {
  label?: string
  value: number
  onChange: (naira: number) => void
  min?: number
  max?: number
  error?: string
  disabled?: boolean
  placeholder?: string
  quickAmounts?: number[]
}

export function AmountInput({
  label = 'Amount',
  value,
  onChange,
  min,
  max,
  error,
  disabled,
  placeholder = '0',
  quickAmounts = [500, 1000, 2000, 5000, 10000],
}: AmountInputProps) {
  const [raw, setRaw] = useState(value ? String(value) : '')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^0-9]/g, '')
      setRaw(val)
      const num = parseInt(val, 10)
      onChange(isNaN(num) ? 0 : num)
    },
    [onChange]
  )

  const handleQuick = useCallback(
    (amount: number) => {
      setRaw(String(amount))
      onChange(amount)
    },
    [onChange]
  )

  const formatted = raw
    ? Number(raw).toLocaleString('en-NG')
    : ''

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm font-medium">{label}</Label>}

      {/* Quick amount chips */}
      <div className="flex flex-wrap gap-2">
        {quickAmounts.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => handleQuick(amount)}
            disabled={disabled}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
              value === amount
                ? 'border-[#6C3CE1] bg-[#6C3CE1] text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#6C3CE1] hover:text-[#6C3CE1]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            ₦{amount.toLocaleString()}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-500">
          ₦
        </span>
        <Input
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'pl-8 text-lg font-semibold',
            error && 'border-red-500'
          )}
        />
      </div>

      {min && (
        <p className="text-xs text-gray-500">Minimum: ₦{min.toLocaleString()}</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
