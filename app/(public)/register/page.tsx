'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PinInput } from '@/components/shared/PinInput'
import { useAppStore } from '@/store'
import { authApi, userApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { ChevronRight, ShieldCheck, Check, Zap } from 'lucide-react'

interface GoogleOnboardData {
  idToken: string
  sub: string
  email: string
  name: string
  picture: string
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  referralCode: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const STEPS = [
  { label: 'Profile', description: 'Your details' },
  { label: 'Identity', description: 'Verify identity' },
  { label: 'PIN', description: 'Secure your account' },
]

function RegisterPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [googleData, setGoogleData] = useState<GoogleOnboardData | null>(null)
  const [step, setStep] = useState(0)

  const [identityType, setIdentityType] = useState<'NIN' | 'BVN'>('NIN')
  const [identityValue, setIdentityValue] = useState('')
  const [identityError, setIdentityError] = useState('')

  const [pin, setPin] = useState('')
  const [pinStep, setPinStep] = useState<'set' | 'confirm'>('set')
  const [pinError, setPinError] = useState('')
  const [loading, setLoading] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', referralCode: '' },
  })

  useEffect(() => {
    const pendingToken = searchParams.get('pending')
    if (pendingToken) {
      try {
        const payload = JSON.parse(atob(pendingToken.split('.')[1]))
        const data: GoogleOnboardData = {
          idToken: pendingToken,
          sub: payload.sub,
          email: payload.email,
          name: payload.name || '',
          picture: payload.picture || '',
        }
        sessionStorage.setItem('google_onboard', JSON.stringify(data))
        setGoogleData(data)
        profileForm.setValue('name', data.name)
        return
      } catch {
        router.replace('/login')
        return
      }
    }

    const raw = sessionStorage.getItem('google_onboard')
    if (!raw) {
      router.replace('/login')
      return
    }
    try {
      const data: GoogleOnboardData = JSON.parse(raw)
      setGoogleData(data)
      profileForm.setValue('name', data.name)
    } catch {
      router.replace('/login')
    }
  }, [router, profileForm, searchParams])

  const handleProfileNext = (data: ProfileForm) => {
    profileForm.setValue('name', data.name)
    setStep(1)
  }

  const handleIdentityNext = () => {
    if (!/^\d{11}$/.test(identityValue)) {
      setIdentityError('Must be exactly 11 digits (numbers only).')
      return
    }
    setIdentityError('')
    setStep(2)
  }

  const handlePinEntry = async (enteredPin: string) => {
    if (pinStep === 'set') {
      setPin(enteredPin)
      setPinStep('confirm')
      setPinError('')
      return
    }

    if (enteredPin !== pin) {
      setPinError('PINs do not match. Try again.')
      setPinStep('set')
      setPin('')
      return
    }

    if (!googleData) return
    setLoading(true)
    try {
      const profileData = profileForm.getValues()

      const res = await authApi.register({
        userId: googleData.sub,
        userEmail: googleData.email,
        name: profileData.name,
        picture: googleData.picture,
        nin: identityType === 'NIN' ? identityValue : undefined,
        bvn: identityType === 'BVN' ? identityValue : undefined,
        referralCode: profileData.referralCode || undefined,
      })

      const { user, accessToken } = res.data
      await userApi.setPin(enteredPin)
      useAppStore.getState().setAuth(user, accessToken)
      sessionStorage.removeItem('google_onboard')

      toast.success('Welcome to BillsPayy!')
      router.push('/dashboard')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
      setPinStep('set')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  if (!googleData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0]">
            <Zap className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <span className="font-bold text-gray-900">BillsPayy</span>
        </div>

        {/* Step Indicators */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      i < step
                        ? 'bg-green-500 text-white'
                        : i === step
                        ? 'bg-[#6C3CE1] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${i <= step ? 'text-gray-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px flex-1 transition-colors ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Step {step + 1} of {STEPS.length} — {STEPS[step].description}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-7">
          {/* Step 1: Profile */}
          {step === 0 && (
            <form onSubmit={profileForm.handleSubmit(handleProfileNext)} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Set up your profile</h2>
                <p className="mt-1 text-sm text-gray-500">Confirm your details to continue</p>
              </div>

              <div className="flex justify-center">
                <Avatar className="h-20 w-20 ring-4 ring-gray-50">
                  <AvatarImage src={googleData.picture} />
                  <AvatarFallback className="bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] text-2xl text-white font-bold">
                    {googleData.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Email</Label>
                  <Input
                    value={googleData.email}
                    disabled
                    className="mt-1.5 bg-gray-50 text-gray-400"
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Display Name</Label>
                  <Input
                    {...profileForm.register('name')}
                    placeholder="Your name"
                    className="mt-1.5"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Referral Code <span className="text-gray-400">(optional)</span></Label>
                  <Input
                    {...profileForm.register('referralCode')}
                    placeholder="BP-XXXXXX"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7] h-11" size="lg">
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Step 2: Identity */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-[#6C3CE1]" />
                  <h2 className="text-xl font-bold text-gray-900">Verify your identity</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Required to enable bill payments. Enter your NIN or BVN (11 digits).
                </p>
              </div>

              <div className="flex rounded-xl border border-gray-200 p-1">
                {(['NIN', 'BVN'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setIdentityType(type)
                      setIdentityValue('')
                      setIdentityError('')
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                      identityType === type
                        ? 'bg-[#6C3CE1] text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <Label className="text-sm text-gray-600">{identityType} Number</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={identityValue}
                  onChange={(e) => {
                    setIdentityValue(e.target.value.replace(/\D/g, '').slice(0, 11))
                    setIdentityError('')
                  }}
                  placeholder="Enter 11-digit number"
                  className="mt-1.5"
                />
                {identityError && (
                  <p className="mt-1 text-xs text-red-500">{identityError}</p>
                )}
                <p className="mt-1.5 text-xs text-amber-600 font-medium">
                  Required to fund your wallet and pay bills
                </p>
              </div>

              <Button
                type="button"
                onClick={handleIdentityNext}
                disabled={identityValue.length !== 11}
                className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7] disabled:opacity-40 h-11"
                size="lg"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 3: PIN */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Secure your account</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {pinStep === 'set'
                    ? 'Create a 4-digit PIN to authorise every transaction'
                    : 'Re-enter your PIN to confirm'}
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
                  <p className="text-sm text-gray-500">Creating your account…</p>
                </div>
              ) : (
                <PinInput
                  onComplete={handlePinEntry}
                  label={pinStep === 'set' ? 'Enter 4-digit PIN' : 'Confirm your PIN'}
                  error={pinError}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
      </div>
    }>
      <RegisterPageInner />
    </Suspense>
  )
}
