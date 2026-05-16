'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { background: '#1A1A2E', color: '#fff', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
