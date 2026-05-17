import Link from 'next/link'
import { Zap, TrendingUp, Users, FileText, CheckCircle, Shield, CreditCard, ArrowRight, Smartphone, Gift, Receipt, Wifi, Tv } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Smartphone,
    iconColor: 'text-[#6C3CE1]',
    iconBg: 'bg-purple-50',
    title: 'Pay Any Bill',
    description: 'Airtime, data, electricity, cable TV — all in one place. Never miss a payment.',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-50',
    title: 'Earn Commission',
    description: 'Get 0.6% cash back on every bill you pay. The more you pay, the more you earn.',
  },
  {
    icon: Gift,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    title: 'Refer & Earn',
    description: 'Share your referral code. Earn rewards every time a friend pays a bill.',
  },
  {
    icon: Receipt,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    title: 'Instant Receipts',
    description: 'Digital receipts delivered instantly. Share or download anytime.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Create Account',
    description: 'Sign up with Google in seconds. No lengthy forms.',
  },
  {
    number: '02',
    title: 'Fund Wallet',
    description: 'Add money via card or bank transfer through Paystack.',
  },
  {
    number: '03',
    title: 'Pay & Earn',
    description: 'Pay your bills and watch your commission balance grow.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0]">
              <Zap className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-base font-bold tracking-tight text-gray-900">BillsPayy</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-gray-600 font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-[#6C3CE1] text-white hover:bg-[#5B32C7] font-semibold">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-100 px-3.5 py-1.5 text-sm font-medium text-[#6C3CE1]">
              <CheckCircle className="h-3.5 w-3.5" />
              Trusted by 10,000+ Nigerians
            </div>
            <h1 className="mb-5 text-4xl font-bold leading-[1.15] tracking-tight text-gray-900 lg:text-5xl">
              Pay bills.{' '}
              <span className="bg-gradient-to-r from-[#6C3CE1] to-[#F97316] bg-clip-text text-transparent">
                Earn rewards.
              </span>{' '}
              Every time.
            </h1>
            <p className="mb-8 text-lg text-gray-500 leading-relaxed">
              BillsPayy lets you pay every household and mobile bill in one place — and earn 0.6% cash back on every single transaction.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="w-full bg-[#6C3CE1] text-white hover:bg-[#5B32C7] font-semibold h-12 px-7 sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full border-gray-200 font-semibold h-12 sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-5 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-green-500" />
                256-bit encryption
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-green-500" />
                Secured by Paystack
              </div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="h-[500px] w-[275px] overflow-hidden rounded-[3rem] border-[7px] border-gray-900 bg-gradient-to-b from-[#6C3CE1] to-[#4A2BA0] shadow-2xl shadow-purple-300/40">
                <div className="h-full w-full p-5 pt-7">
                  {/* Wallet */}
                  <div className="mb-4 rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                    <p className="text-xs font-medium text-purple-200">Main Wallet</p>
                    <p className="mt-0.5 text-2xl font-bold text-white tracking-tight">₦12,500.00</p>
                    <p className="text-xs text-purple-300 mt-0.5">Available balance</p>
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 rounded-xl bg-white py-2 text-center text-xs font-bold text-[#6C3CE1]">
                        Fund
                      </div>
                      <div className="flex-1 rounded-xl border border-white/25 py-2 text-center text-xs font-semibold text-white">
                        History
                      </div>
                    </div>
                  </div>
                  {/* Earnings */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs text-purple-300">Commission</p>
                      <p className="mt-0.5 text-sm font-bold text-white">₦3,450</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs text-purple-300">Rewards</p>
                      <p className="mt-0.5 text-sm font-bold text-white">₦1,200</p>
                    </div>
                  </div>
                  {/* Quick Pay */}
                  <p className="mb-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">Quick Pay</p>
                  <div className="mb-5 grid grid-cols-4 gap-1.5">
                    {[Smartphone, Wifi, Zap, Tv].map((Icon, i) => (
                      <div
                        key={i}
                        className="flex h-11 w-full items-center justify-center rounded-xl bg-white/10"
                      >
                        <Icon className="h-4 w-4 text-white/80" />
                      </div>
                    ))}
                  </div>
                  {/* Recent */}
                  <p className="mb-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">Recent</p>
                  {[
                    { Icon: Zap, name: 'IKEDC', amt: '₦5,000' },
                    { Icon: Smartphone, name: 'MTN', amt: '₦500' },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="mb-1.5 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <tx.Icon className="h-3.5 w-3.5 text-white/80" />
                        <span className="text-xs font-medium text-white">{tx.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{tx.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -right-5 top-16 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-gray-200/80">
                <p className="text-xs text-gray-400 font-medium">You earned</p>
                <p className="text-lg font-bold text-green-500">+₦100.00</p>
              </div>
              {/* Second badge */}
              <div className="absolute -left-5 bottom-24 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl shadow-gray-200/80">
                <p className="text-xs text-gray-400">Commission rate</p>
                <p className="text-base font-bold text-[#6C3CE1]">0.6% back</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
              Everything you need in one app
            </h2>
            <p className="text-gray-500 text-lg">
              BillsPayy makes bill payments rewarding, not just routine.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className="rounded-2xl border border-gray-100 bg-[#F8F7FF] p-6 hover:border-purple-100 hover:shadow-sm transition"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feat.iconBg} shadow-sm`}>
                  <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
                </div>
                <h3 className="mb-2 text-base font-bold text-gray-900">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">
              Get started in 3 simple steps
            </h2>
            <p className="text-gray-500 text-lg">Simple to start, rewarding from day one.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="relative text-center">
                {idx < STEPS.length - 1 && (
                  <div className="absolute left-[calc(50%+2.5rem)] top-8 hidden h-0.5 w-[calc(100%-5rem)] bg-gradient-to-r from-[#6C3CE1]/30 to-[#F97316]/30 md:block" />
                )}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] text-xl font-bold text-white shadow-lg shadow-purple-200">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mx-4">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-5 mb-16 overflow-hidden rounded-3xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0]">
        <div className="relative px-8 py-16 text-center">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <h2 className="mb-3 text-3xl font-bold text-white tracking-tight">
              Start earning on your bills today
            </h2>
            <p className="mb-8 text-purple-200 text-base leading-relaxed max-w-md mx-auto">
              Join thousands of Nigerians already earning commission on their everyday bill payments.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-[#6C3CE1] hover:bg-gray-50 font-bold h-12 px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-5">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0]">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">BillsPayy</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-700 transition">Terms</a>
              <a href="#" className="hover:text-gray-700 transition">Privacy</a>
              <a href="#" className="hover:text-gray-700 transition">Contact</a>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">
            &copy; 2026 BillsPayy. All rights reserved. Secured by Paystack.
          </p>
        </div>
      </footer>
    </div>
  )
}
