'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Smartphone,
  Wallet,
  TrendingUp,
  Users,
  Trophy,
  User,
  LogOut,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/store'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pay', label: 'Pay Bills', icon: Smartphone },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/earnings/commission', label: 'Earnings', icon: TrendingUp },
  { href: '/referrals', label: 'Referrals', icon: Users },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const user = useAppStore((s) => s.user)

  return (
    <aside className="flex h-full w-64 flex-col bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] shadow-sm">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">BillsPayy</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href))

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[#6C3CE1] text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive ? 'text-white' : 'text-gray-400')} style={{ width: 18, height: 18 }} />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + Sign out */}
      <div className="border-t border-gray-100 p-3 space-y-1">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src={user?.picture} />
            <AvatarFallback className="bg-[#6C3CE1] text-white text-xs font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900 leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="truncate text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
