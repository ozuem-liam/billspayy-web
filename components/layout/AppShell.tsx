'use client'

import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen bg-[#F8F7FF]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 pb-24 lg:max-w-4xl lg:px-8 lg:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  )
}
