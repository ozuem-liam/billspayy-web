'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store'
import { userApi } from '@/lib/api'

export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, clearAuth } = useAppStore()

  const signOut = useCallback(() => {
    clearAuth()
    router.push('/login')
  }, [clearAuth, router])

  const loadProfile = useCallback(async () => {
    if (!token) return null
    try {
      const { data } = await userApi.getProfile()
      return data
    } catch {
      return null
    }
  }, [token])

  return {
    user,
    token,
    isAuthenticated,
    signOut,
    loadProfile,
  }
}
