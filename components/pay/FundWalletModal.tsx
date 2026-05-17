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
import { useFundWallet } from '@/hooks/useWallet'
import { useAppStore } from '@/store'
import toast from 'react-hot-toast'
import { formatAmountFromNaira } from '@/lib/utils'

interface FundWalletModalProps {
  open: boolean
  onClose: () => void
}

export function FundWalletModal({ open, onClose }: FundWalletModalProps) {
  const [amount, setAmount] = useState(0)
  const fundMutation = useFundWallet()
  const user = useAppStore((s) => s.user)

  const handleFund = async () => {
    if (amount < 100) {
      toast.error('Minimum funding amount is ₦100')
      return
    }

    try {
      const callbackUrl = `${window.location.origin}/wallet`
      const result = await fundMutation.mutateAsync({
        amount,
        paymentMethod: 'paystack',
        userEmail: user?.email,
        callbackUrl,
      })

      const authUrl: string = result?.authorizationUrl || result?.data?.authorizationUrl

      if (authUrl) {
        // Redirect in same tab — Paystack will return to callbackUrl with ?reference=xxx
        window.location.href = authUrl
      } else {
        toast.error('Could not get payment link. Please try again.')
      }
    } catch (error) {
      console.error('Fund error:', error)
      toast.error('Failed to initiate funding. Please try again.')
    }
  }

  const isLoading = fundMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fund Wallet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <AmountInput
            label="How much do you want to add?"
            value={amount}
            onChange={setAmount}
            min={100}
            quickAmounts={[500, 1000, 2000, 5000, 10000]}
          />

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              You will be redirected to Paystack to complete your payment securely.
            </p>
          </div>

          <Button
            onClick={handleFund}
            disabled={amount < 100 || isLoading}
            className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7]"
            size="lg"
          >
            {isLoading
              ? 'Processing...'
              : `Fund ${amount > 0 ? formatAmountFromNaira(amount) : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
