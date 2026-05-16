'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { walletApi } from '@/lib/api'
import { useAppStore } from '@/store'
import toast from 'react-hot-toast'

export function useWalletBalance() {
  const setWalletBalance = useAppStore((s) => s.setWalletBalance)

  return useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => {
      const { data } = await walletApi.getBalance()
      const balance = data?.balance ?? data?.data?.balance ?? 0
      setWalletBalance(balance)
      return balance as number
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}

export function useWalletTransactions(limit = 20) {
  return useQuery({
    queryKey: ['wallet-transactions', limit],
    queryFn: async () => {
      const { data } = await walletApi.getTransactions(limit)
      return data?.transactions || data?.data?.transactions || (Array.isArray(data?.data) ? data.data : [])
    },
  })
}

export function useFundWallet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      amount,
      paymentMethod,
    }: {
      amount: number
      paymentMethod: string
    }) => {
      const { data } = await walletApi.fund(amount, paymentMethod)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
    },
  })
}

export function useVerifyWallet() {
  const queryClient = useQueryClient()
  const setWalletBalance = useAppStore((s) => s.setWalletBalance)

  return useMutation({
    mutationFn: async ({
      reference,
      trxref,
      paymentMethod,
    }: {
      reference: string
      trxref?: string
      paymentMethod?: string
    }) => {
      const { data } = await walletApi.verify(reference, trxref, paymentMethod)
      return data
    },
    onSuccess: (data) => {
      const newBalance = data?.balance ?? data?.data?.balance
      if (newBalance !== undefined) {
        setWalletBalance(newBalance)
      }
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] })
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] })
      toast.success('Wallet funded successfully!')
    },
    onError: () => {
      toast.error('Failed to verify payment. Please contact support.')
    },
  })
}
