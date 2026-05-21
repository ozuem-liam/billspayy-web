import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmount(kobo: number): string {
  const naira = kobo / 100
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira)
}

export function formatAmountFromNaira(naira: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(naira)
}

export function formatDate(iso: string): string {
  try {
    const date = new Date(iso as any)
    if (isNaN(date.getTime())) return typeof iso === 'string' ? iso : ''
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  } catch {
    return typeof iso === 'string' ? iso : ''
  }
}

export function formatDateShort(iso: string): string {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  } catch {
    return iso
  }
}

export function formatMonthYear(iso: string): string {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-NG', {
      month: 'long',
      year: 'numeric',
    }).format(date)
  } catch {
    return iso
  }
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    AIRTIME: '📱',
    DATA: '📶',
    ELECTRICITY: '⚡',
    CABLETV: '📺',
    CABLE: '📺',
    WALLET_FUNDING: '💰',
    BILL_PAYMENT: '💳',
  }
  return map[category?.toUpperCase()] || '💳'
}

export function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    AIRTIME: 'Airtime',
    DATA: 'Data',
    ELECTRICITY: 'Electricity',
    CABLETV: 'Cable TV',
    CABLE: 'Cable TV',
  }
  return map[category?.toUpperCase()] || category
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    SUCCESS: 'text-green-600 bg-green-50',
    FAILED: 'text-red-600 bg-red-50',
    PROCESSING: 'text-amber-600 bg-amber-50',
    QUEUED: 'text-amber-600 bg-amber-50',
    PENDING: 'text-amber-600 bg-amber-50',
    REFUNDED: 'text-blue-600 bg-blue-50',
    REVERSED: 'text-orange-600 bg-orange-50',
  }
  return map[status?.toUpperCase()] || 'text-gray-600 bg-gray-50'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    SUCCESS: 'Successful',
    FAILED: 'Failed',
    PROCESSING: 'Processing',
    QUEUED: 'Processing',
    PENDING: 'Pending',
    REFUNDED: 'Refunded',
    REVERSED: 'Reversed',
  }
  return map[status?.toUpperCase()] || status
}

export function getTierBadge(tier: string): string {
  const map: Record<string, string> = {
    BRONZE: '🥉',
    SILVER: '🥈',
    GOLD: '🥇',
    PLATINUM: '🏆',
    DIAMOND: '💎',
  }
  return map[tier?.toUpperCase()] || '🥉'
}

export function getTierColor(tier: string): string {
  const map: Record<string, string> = {
    BRONZE: 'text-amber-700 bg-amber-100',
    SILVER: 'text-gray-600 bg-gray-100',
    GOLD: 'text-yellow-600 bg-yellow-100',
    PLATINUM: 'text-purple-600 bg-purple-100',
    DIAMOND: 'text-blue-600 bg-blue-100',
  }
  return map[tier?.toUpperCase()] || 'text-amber-700 bg-amber-100'
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  const masked = local.charAt(0) + '***'
  return `${masked}@${domain}`
}

export function maskName(name: string): string {
  const parts = name.split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 3) + '***'
  }
  return parts[0].substring(0, 3) + '*** ' + parts[parts.length - 1].charAt(0) + '.'
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100)
}

export function koboToNaira(kobo: number): number {
  return kobo / 100
}

export function getNetworkColor(network: string): string {
  const map: Record<string, string> = {
    MTN: 'bg-yellow-400 text-yellow-900',
    GLO: 'bg-green-600 text-white',
    AIRTEL: 'bg-red-600 text-white',
    '9MOBILE': 'bg-teal-600 text-white',
  }
  return map[network?.toUpperCase()] || 'bg-gray-200 text-gray-800'
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}
