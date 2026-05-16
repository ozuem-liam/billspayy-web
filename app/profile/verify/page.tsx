'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store'
import { userApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function VerifyIdentityPage() {
  const router = useRouter()
  const updateUser = useAppStore((s) => s.updateUser)

  const [identityType, setIdentityType] = useState<'NIN' | 'BVN'>('NIN')
  const [identityValue, setIdentityValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!/^\d{11}$/.test(identityValue)) {
      setError('Must be exactly 11 digits (numbers only).')
      return
    }
    setError('')
    setLoading(true)

    try {
      const { data } = await userApi.verifyIdentity(identityType, identityValue)
      if (data.success || data.isIdentityVerified) {
        updateUser({
          isIdentityVerified: true,
          identityType: data.identityType || identityType,
        })
        setSuccess(true)
        toast.success('Identity verified successfully!')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setError(data.message || 'Verification failed. Please check your details.')
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(
        axiosErr.response?.data?.message ||
          'Verification failed. Please check your details and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F7FF] px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {success ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Identity Verified!</h2>
              <p className="text-gray-600">
                Your identity has been verified. Redirecting to dashboard…
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-5 w-5 text-[#6C3CE1]" />
                  <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Enter your NIN or BVN to unlock transactions and wallet funding.
                </p>
              </div>

              {/* Toggle */}
              <div className="flex rounded-xl border border-gray-200 p-1">
                {(['NIN', 'BVN'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setIdentityType(type)
                      setIdentityValue('')
                      setError('')
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                      identityType === type
                        ? 'bg-[#6C3CE1] text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <Label>{identityType} Number *</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={identityValue}
                  onChange={(e) => {
                    setIdentityValue(e.target.value.replace(/\D/g, '').slice(0, 11))
                    setError('')
                  }}
                  placeholder="Enter 11-digit number"
                  className="mt-1"
                  disabled={loading}
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || identityValue.length !== 11}
                className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7] disabled:opacity-50"
                size="lg"
              >
                {loading ? 'Verifying…' : 'Verify Identity'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
