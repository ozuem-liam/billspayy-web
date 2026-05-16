'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { useAppStore } from '@/store'

const Spinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF]">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
  </div>
)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, token, tokenExpiry, clearAuth } = useAppStore()
  const [hydrated, setHydrated] = useState(false)

  // Wait for Zustand persist to hydrate from localStorage before checking auth
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true))
    // If already hydrated (persist finishes synchronously in some envs), set immediately
    if (useAppStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (tokenExpiry && Date.now() > tokenExpiry) {
      clearAuth()
      router.replace('/login')
      return
    }
    if (!isAuthenticated || !token) {
      router.replace('/login')
    }
  }, [hydrated, isAuthenticated, token, tokenExpiry, clearAuth, router])

  if (!hydrated || !isAuthenticated || !token) {
    return <Spinner />
  }

  return <AppShell>{children}</AppShell>
}
