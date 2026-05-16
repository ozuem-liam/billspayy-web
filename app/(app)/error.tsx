'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log to your error reporting service here (e.g. Sentry)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-100">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-6">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-xl bg-[#6C3CE1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5B32C7] transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
