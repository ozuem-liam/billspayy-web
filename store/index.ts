import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

const SESSION_DURATION_MS = 60 * 60 * 1000 // 1 hour

interface AppStore {
  // Auth
  user: User | null
  token: string | null
  isAuthenticated: boolean
  tokenExpiry: number | null // epoch ms

  // Wallet
  walletBalance: number | null // in kobo

  // Preferences
  lastNetworkUsed: string | null
  lastMeterNumber: string | null
  lastPhoneNumber: string | null

  // Actions
  setAuth: (user: User, token: string) => void
  setWalletBalance: (kobo: number) => void
  clearAuth: () => void
  setLastNetwork: (network: string) => void
  setLastMeterNumber: (meter: string) => void
  setLastPhoneNumber: (phone: string) => void
  updateUser: (updates: Partial<User>) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      tokenExpiry: null,
      walletBalance: null,
      lastNetworkUsed: null,
      lastMeterNumber: null,
      lastPhoneNumber: null,

      setAuth: (user: User, token: string) =>
        set({ user, token, isAuthenticated: true, tokenExpiry: Date.now() + SESSION_DURATION_MS }),

      setWalletBalance: (kobo: number) =>
        set({ walletBalance: kobo }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          tokenExpiry: null,
          walletBalance: null,
        }),

      setLastNetwork: (network: string) =>
        set({ lastNetworkUsed: network }),

      setLastMeterNumber: (meter: string) =>
        set({ lastMeterNumber: meter }),

      setLastPhoneNumber: (phone: string) =>
        set({ lastPhoneNumber: phone }),

      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'billspayy-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        tokenExpiry: state.tokenExpiry,
        lastNetworkUsed: state.lastNetworkUsed,
        lastMeterNumber: state.lastMeterNumber,
        lastPhoneNumber: state.lastPhoneNumber,
      }),
    }
  )
)
