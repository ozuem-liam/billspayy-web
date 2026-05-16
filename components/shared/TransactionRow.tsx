'use client'

import { cn, formatAmountFromNaira, formatDate, getCategoryIcon, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { BillsPaymentTransaction } from '@/types'
import { StatusChip } from './StatusChip'

interface TransactionRowProps {
  transaction: BillsPaymentTransaction
  onClick?: () => void
  compact?: boolean
}

export function TransactionRow({ transaction, onClick, compact }: TransactionRowProps) {
  const icon = getCategoryIcon(transaction.category)
  const label = transaction.serviceName || transaction.category

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl p-3 transition-colors',
        onClick && 'cursor-pointer hover:bg-gray-50'
      )}
    >
      {/* Icon */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl">
        {icon}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{label}</p>
        {!compact && (
          <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
        )}
        {transaction.recipient && (
          <p className="text-xs text-gray-500">{transaction.recipient}</p>
        )}
      </div>

      {/* Amount + Status */}
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <p className="text-sm font-semibold text-gray-900">
          {formatAmountFromNaira(transaction.amount)}
        </p>
        <StatusChip status={transaction.status} size="sm" />
      </div>
    </div>
  )
}
