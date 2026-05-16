'use client'

import { useAppStore } from '@/store'
import { useRouter } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

/**
 * Shows a dismissible banner prompting unverified users to verify their identity.
 * Children are always rendered — this is a soft prompt, not a hard block.
 */
export function IdentityGate({ children }: { children: React.ReactNode }) {
  const user = useAppStore((s) => s.user)
  const router = useRouter()

  const showBanner = user && !user.isIdentityVerified

  return (
    <>
      {showBanner && (
        <div className="mx-4 mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 space-y-1.5">
          {/* Row 1: icon + title + button */}
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0 text-orange-500" />
            <p className="flex-1 text-sm font-semibold text-orange-800 leading-tight">
              Identity Verification Required
            </p>
            <button
              onClick={() => router.push('/profile/verify')}
              className="shrink-0 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Verify Now
            </button>
          </div>
          {/* Row 2: description */}
          <p className="text-xs text-orange-600 leading-relaxed pl-6">
            Your limit is ₦5,000 / ₦20,000 daily. Verify NIN or BVN to unlock ₦100,000 / ₦500,000.
          </p>
        </div>
      )}
      {children}
    </>
  )
}
