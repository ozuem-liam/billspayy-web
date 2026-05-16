'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page is no longer used — Google OAuth is now handled client-side.
// Redirect any stale links to the login page.
export default function AuthCompletePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
    </div>
  )
}
