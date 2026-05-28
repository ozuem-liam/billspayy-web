'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AmountInput } from '@/components/shared/AmountInput'
import { useWithdrawToWallet } from '@/hooks/useEarnings'
import { formatAmountFromNaira } from '@/lib/utils'

interface WithdrawModalProps {
  open: boolean
  onClose: () => void
  type: 'COMMISSION' | 'REWARD'
  availableBalance: number
}

export function WithdrawModal({ open, onClose, type, availableBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState(0)
  const withdrawMutation = useWithdrawToWallet()

  const label = type === 'COMMISSION' ? 'commission' : 'reward'
  const maxAmount = Math.floor(availableBalance)

  const handleWithdraw = async () => {
    if (amount < 1) return
    await withdrawMutation.mutateAsync({ type, amount })
    setAmount(0)
    onClose()
  }

  const quickAmounts = [100, 500, 1000, 2000, 5000].filter((a) => a <= maxAmount)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { setAmount(0); onClose() } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw {type === 'COMMISSION' ? 'Commission' : 'Rewards'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex justify-between text-sm">
            <span className="text-gray-500">Available {label}</span>
            <span className="font-semibold text-gray-900">{formatAmountFromNaira(availableBalance)}</span>
          </div>

          <AmountInput
            label={`How much do you want to withdraw?`}
            value={amount}
            onChange={setAmount}
            min={1}
            max={maxAmount}
            quickAmounts={quickAmounts.length ? quickAmounts : undefined}
            error={amount > maxAmount ? `Maximum is ${formatAmountFromNaira(maxAmount)}` : undefined}
          />

          <p className="text-xs text-gray-500">
            Funds will be moved instantly to your main wallet.
          </p>

          <Button
            onClick={handleWithdraw}
            disabled={amount < 1 || amount > maxAmount || withdrawMutation.isPending}
            className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7]"
            size="lg"
          >
            {withdrawMutation.isPending
              ? 'Processing...'
              : `Withdraw ${amount > 0 ? formatAmountFromNaira(amount) : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
