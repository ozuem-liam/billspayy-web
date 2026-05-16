'use client'

import { useState, useCallback } from 'react'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PinInputProps {
  onComplete: (pin: string) => void
  onChange?: (pin: string) => void
  label?: string
  error?: string
  disabled?: boolean
  length?: number
}

const NUMPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
]

export function PinInput({
  onComplete,
  onChange,
  label = 'Enter PIN',
  error,
  disabled,
  length = 4,
}: PinInputProps) {
  const [pin, setPin] = useState('')

  const handleKey = useCallback(
    (key: string) => {
      if (disabled) return

      if (key === 'del') {
        const newPin = pin.slice(0, -1)
        setPin(newPin)
        onChange?.(newPin)
        return
      }

      if (pin.length >= length) return

      const newPin = pin + key
      setPin(newPin)
      onChange?.(newPin)

      if (newPin.length === length) {
        onComplete(newPin)
        // Reset after a brief delay
        setTimeout(() => {
          setPin('')
          onChange?.('')
        }, 300)
      }
    },
    [pin, length, onComplete, onChange, disabled]
  )

  return (
    <div className="flex flex-col items-center gap-6">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}

      {/* PIN dots */}
      <div className="flex gap-4">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 w-4 rounded-full border-2 transition-all duration-200',
              i < pin.length
                ? 'border-[#6C3CE1] bg-[#6C3CE1] scale-110'
                : 'border-gray-300 bg-transparent'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {NUMPAD.flat().map((key, idx) => {
          if (!key) return <div key={idx} />
          return (
            <button
              key={idx}
              onClick={() => handleKey(key)}
              disabled={disabled}
              className={cn(
                'flex items-center justify-center h-14 rounded-xl text-lg font-semibold transition-all',
                key === 'del'
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-900 hover:bg-gray-100 active:scale-95',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {key === 'del' ? <Delete className="h-5 w-5" /> : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
