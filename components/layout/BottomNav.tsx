'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Smartphone,
  Wallet,
  TrendingUp,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/pay/airtime', label: 'Pay', icon: Smartphone },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/earnings/commission', label: 'Earn', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe lg:hidden">
      <div className="flex items-center justify-around px-1 pt-1 pb-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 min-w-[56px] py-1 px-2"
            >
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl transition-all',
                  isActive ? 'bg-[#6C3CE1]/10' : ''
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-[#6C3CE1]' : 'text-gray-400'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive ? 'text-[#6C3CE1]' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
