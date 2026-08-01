import Link from 'next/link'
import { Smartphone, Wifi, Zap, Tv, Plane, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react'

const SERVICES = [
  { href: '/pay/airtime', title: 'Airtime', description: 'Top up any supported mobile network', icon: Smartphone, color: 'bg-amber-50 text-amber-600' },
  { href: '/pay/data', title: 'Mobile Data', description: 'Browse and purchase network data plans', icon: Wifi, color: 'bg-blue-50 text-blue-600' },
  { href: '/pay/electricity', title: 'Electricity', description: 'Pay prepaid and postpaid electricity bills', icon: Zap, color: 'bg-orange-50 text-orange-600' },
  { href: '/pay/cable', title: 'TV & Streaming', description: 'DStv, GOtv, StarTimes and Showmax', icon: Tv, color: 'bg-purple-50 text-purple-600' },
  { href: '/pay/esim', title: 'Travel eSIM', description: 'Purchase or top up international eSIM plans', icon: Plane, color: 'bg-cyan-50 text-cyan-600' },
  { href: '/pay/education', title: 'Education PINs', description: 'Exam, registration and result-checking products', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
  { href: '/pay/verification', title: 'Verification', description: 'Secure identity and document lookup services', icon: ShieldCheck, color: 'bg-indigo-50 text-indigo-600' },
]

export default function PayServicesPage() {
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-medium text-[#6C3CE1]">Services</p><h1 className="mt-1 text-2xl font-bold text-gray-900">What would you like to pay for?</h1><p className="mt-1 text-sm text-gray-500">Choose a service to continue.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SERVICES.map(({ href, title, description, icon: Icon, color }) => (
          <Link key={href} href={href} className="group flex min-h-24 cursor-pointer items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:border-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C3CE1]">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}><Icon className="h-6 w-6" /></div>
            <div className="min-w-0 flex-1"><h2 className="font-semibold text-gray-900">{title}</h2><p className="mt-1 text-sm leading-5 text-gray-500">{description}</p></div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-[#6C3CE1]" />
          </Link>
        ))}
      </div>
    </div>
  )
}
