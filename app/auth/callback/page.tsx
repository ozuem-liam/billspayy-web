'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Zap } from 'lucide-react'
import { useAppStore } from '@/store'
import toast from 'react-hot-toast'

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (error || !token) {
      toast.error('Sign in failed. Please try again.')
      router.replace('/login')
      return
    }

    try {
      const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null
      if (!user) throw new Error('No user data')
      useAppStore.getState().setAuth(user, token)
      router.replace('/dashboard')
    } catch {
      toast.error('Failed to complete sign in.')
      router.replace('/login')
    }
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F7FF]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6C3CE1] shadow-lg">
        <Zap className="h-9 w-9 text-white" />
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
      <p className="text-sm text-gray-500">Signing you in…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F8F7FF]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  )
}
