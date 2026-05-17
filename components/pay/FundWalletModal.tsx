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
import { useFundWallet, useVerifyWallet } from '@/hooks/useWallet'
import toast from 'react-hot-toast'
import { formatAmountFromNaira } from '@/lib/utils'

interface FundWalletModalProps {
  open: boolean
  onClose: () => void
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string
        email: string
        amount: number
        ref: string
        onSuccess: (response: { reference: string; trxref: string }) => void
        onCancel: () => void
      }) => { openIframe: () => void }
    }
  }
}

export function FundWalletModal({ open, onClose }: FundWalletModalProps) {
  const [amount, setAmount] = useState(0)
  const fundMutation = useFundWallet()
  const verifyMutation = useVerifyWallet()

  const handleFund = async () => {
    if (amount < 100) {
      toast.error('Minimum funding amount is ₦100')
      return
    }

    try {
      const { data } = await fundMutation.mutateAsync({
        amount, // naira — backend converts to kobo internally
        paymentMethod: 'PAYSTACK',
      })

      const authUrl: string = data?.authorizationUrl || data?.data?.authorizationUrl
      const reference: string = data?.reference || data?.data?.reference

      if (authUrl) {
        // Open Paystack checkout in new tab
        const popup = window.open(authUrl, '_blank')
        if (!popup) {
          toast.error('Please allow popups for payment')
          return
        }

        // Poll for window close
        const interval = setInterval(async () => {
          if (popup.closed) {
            clearInterval(interval)
            // Verify payment
            if (reference) {
              try {
                await verifyMutation.mutateAsync({ reference, paymentMethod: 'PAYSTACK' })
                onClose()
              } catch {
                toast('Payment not confirmed. Check your wallet balance.')
              }
            }
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Fund error:', error)
      toast.error('Failed to initiate funding. Please try again.')
    }
  }

  const isLoading = fundMutation.isPending || verifyMutation.isPending

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
