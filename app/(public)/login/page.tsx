'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Zap, Shield, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'

function LoginContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('error') === 'cancelled') {
      toast.error('Sign in was cancelled.')
    }
  }, [searchParams])

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
      <Button
        onClick={handleGoogleLogin}
        size="lg"
        variant="outline"
        className="w-full h-12 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium"
      >
        <svg className="mr-3 h-5 w-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </Button>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">Secure sign-in</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />
          <span className="text-xs text-gray-600">Encrypted</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
          <TrendingUp className="h-3.5 w-3.5 text-[#6C3CE1] shrink-0" />
          <span className="text-xs text-gray-600">Earn 0.6% back</span>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
        By continuing, you agree to our{' '}
        <a href="#" className="text-[#6C3CE1] hover:underline">Terms</a>
        {' '}and{' '}
        <a href="#" className="text-[#6C3CE1] hover:underline">Privacy Policy</a>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] shadow-lg shadow-purple-200">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500">Sign in to pay bills and earn rewards</p>
        </div>
        <Suspense fallback={<div className="rounded-2xl bg-white border border-gray-100 p-8 h-40" />}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  )
}
