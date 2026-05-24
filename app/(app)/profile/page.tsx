'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Copy,
  LogOut,
  Shield,
  ChevronRight,
  Bell,
  Lock,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PinInput } from '@/components/shared/PinInput'
import { TierBadge } from '@/components/shared/TierBadge'
import { useAppStore } from '@/store'
import { useAuth } from '@/hooks/useAuth'
import { userApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const identitySchema = z.object({
  type: z.enum(['NIN', 'BVN']),
  value: z.string().length(11, 'Must be exactly 11 digits').regex(/^\d+$/, 'Numbers only'),
})
type IdentityForm = z.infer<typeof identitySchema>

export default function ProfilePage() {
  const user = useAppStore((s) => s.user)
  const updateUser = useAppStore((s) => s.updateUser)
  const { signOut } = useAuth()

  const [showChangePinModal, setShowChangePinModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [pinStep, setPinStep] = useState<'old' | 'new' | 'confirm'>('old')
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [identityType, setIdentityType] = useState<'NIN' | 'BVN'>('NIN')
  const [identityLoading, setIdentityLoading] = useState(false)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordMode, setPasswordMode] = useState<'set' | 'update'>('set')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const identityForm = useForm<IdentityForm>({
    resolver: zodResolver(identitySchema),
    defaultValues: { type: 'NIN', value: '' },
  })

  const handleCopyReferral = async () => {
    if (user?.referralCode) {
      await navigator.clipboard.writeText(user.referralCode)
      toast.success('Referral code copied!')
    }
  }

  const handlePinChange = async (pin: string) => {
    if (pinStep === 'old') {
      setOldPin(pin)
      setPinStep('new')
      setPinError('')
    } else if (pinStep === 'new') {
      setNewPin(pin)
      setPinStep('confirm')
      setPinError('')
    } else {
      if (pin !== newPin) {
        setPinError('PINs do not match. Try again.')
        setPinStep('new')
        setNewPin('')
        return
      }
      setPinLoading(true)
      try {
        await userApi.updatePin(oldPin, newPin)
        toast.success('PIN changed successfully!')
        setShowChangePinModal(false)
        setPinStep('old')
        setOldPin('')
        setNewPin('')
        setPinError('')
      } catch (error: any) {
        const msg = error?.response?.data?.message || 'Failed to change PIN.'
        if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('wrong')) {
          setPinError('Current PIN is incorrect.')
          setPinStep('old')
          setOldPin('')
          setNewPin('')
        } else {
          toast.error(msg)
        }
      } finally {
        setPinLoading(false)
      }
    }
  }

  const handleIdentityVerify = async (data: IdentityForm) => {
    setIdentityLoading(true)
    try {
      await userApi.verifyIdentity(data.type, data.value)
      updateUser({ isIdentityVerified: true })
      toast.success('Identity verified!')
      setShowVerifyModal(false)
    } catch {
      toast.error('Verification failed. Please check your details.')
    } finally {
      setIdentityLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (passwordMode === 'set') {
      if (!newPassword || newPassword.length < 6) {
        toast.error('Password must be at least 6 characters')
        return
      }
      if (newPassword !== confirmNewPassword) {
        toast.error('Passwords do not match')
        return
      }
      setPasswordLoading(true)
      try {
        await userApi.setPassword(newPassword)
        toast.success('Password set! You can now log in with email and password.')
        setShowPasswordModal(false)
        setNewPassword('')
        setConfirmNewPassword('')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to set password')
      } finally {
        setPasswordLoading(false)
      }
    } else {
      if (!oldPassword || !newPassword || newPassword.length < 6) {
        toast.error('Please fill in all fields (min 6 characters)')
        return
      }
      if (newPassword !== confirmNewPassword) {
        toast.error('Passwords do not match')
        return
      }
      setPasswordLoading(true)
      try {
        await userApi.updatePassword(oldPassword, newPassword)
        toast.success('Password updated!')
        setShowPasswordModal(false)
        setOldPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to update password')
      } finally {
        setPasswordLoading(false)
      }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <button className="rounded-full p-3 hover:bg-gray-100 transition">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
        {/* Purple header strip */}
        <div className="h-20 bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0]" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <Avatar className="h-16 w-16 ring-4 ring-white">
              <AvatarImage src={user?.picture} />
              <AvatarFallback className="bg-gradient-to-br from-[#6C3CE1] to-[#4A2BA0] text-2xl text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {user?.isIdentityVerified && (
              <div className="mb-1 flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-2.5 py-1">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs font-medium text-green-700">Verified</span>
              </div>
            )}
          </div>
          <p className="text-xl font-bold text-gray-900">{user?.name || 'User'}</p>
          <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          {user?.tier && (
            <div className="mt-2.5">
              <TierBadge tier={user.tier} size="sm" />
            </div>
          )}
        </div>

        {/* Referral Code */}
        {user?.referralCode && (
          <div className="mx-6 mb-6 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Your referral code</p>
              <p className="text-sm font-mono font-bold text-gray-900 tracking-wider">{user.referralCode}</p>
            </div>
            <button
              onClick={handleCopyReferral}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Account Settings */}
      <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Account Settings
        </p>

        {/* Identity Verification */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
              <Shield className="h-4.5 w-4.5 text-gray-500" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Identity Verification</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user?.isIdentityVerified ? 'Your identity is verified' : 'Required for transactions'}
              </p>
            </div>
          </div>
          {user?.isIdentityVerified ? (
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          ) : (
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
            >
              <AlertTriangle className="h-3 w-3" />
              Verify now
            </button>
          )}
        </div>

        {/* Change PIN */}
        <button
          onClick={() => {
            setShowChangePinModal(true)
            setPinStep('old')
            setOldPin('')
            setNewPin('')
            setPinError('')
          }}
          className="flex w-full items-center justify-between px-5 py-3.5 border-t border-gray-50 hover:bg-gray-50/60 transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
              <Lock className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">Change PIN</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        </button>

        {/* Set / Change Password */}
        <button
          onClick={() => {
            setPasswordMode('set') // Will be overridden below if password already exists
            setShowPasswordModal(true)
            setOldPassword('')
            setNewPassword('')
            setConfirmNewPassword('')
          }}
          className="flex w-full items-center justify-between px-5 py-3.5 border-t border-gray-50 hover:bg-gray-50/60 transition"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
              <Lock className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">Set Password</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        </button>

        {/* Referrals shortcut */}
        <Link href="/referrals" className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50 hover:bg-gray-50/60 transition">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
              <Users className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900">Referrals</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        </Link>

        {/* SMS Notifications */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50">
              <Bell className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">{smsNotifications ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>
          <button
            onClick={() => setSmsNotifications(!smsNotifications)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              smsNotifications ? 'bg-[#6C3CE1]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                smsNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Transaction Limits */}
      <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
        <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Transaction Limits
        </p>
        <div className="px-5 py-3 border-t border-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Daily limit</p>
            <p className="text-sm font-semibold text-gray-900">
              {user?.isIdentityVerified ? '₦500,000' : '₦50,000'}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">Per transaction</p>
            <p className="text-sm font-semibold text-gray-900">
              {user?.isIdentityVerified ? '₦100,000' : '₦20,000'}
            </p>
          </div>
          {!user?.isIdentityVerified && (
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 mt-2">
              <p className="text-xs text-amber-700 font-medium">
                Verify your identity to unlock 10× higher limits
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>

      {/* Change PIN Modal */}
      <Dialog open={showChangePinModal} onOpenChange={setShowChangePinModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change PIN</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {pinLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6C3CE1] border-t-transparent" />
                <p className="text-sm text-gray-500">Updating PIN…</p>
              </div>
            ) : (
              <PinInput
                onComplete={handlePinChange}
                label={
                  pinStep === 'old'
                    ? 'Enter current PIN'
                    : pinStep === 'new'
                    ? 'Enter new PIN'
                    : 'Confirm new PIN'
                }
                error={pinError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Set / Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{passwordMode === 'set' ? 'Set Password' : 'Change Password'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {passwordMode === 'update' && (
              <div>
                <Label className="text-sm text-gray-600">Current Password</Label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1.5"
                />
              </div>
            )}
            <div>
              <Label className="text-sm text-gray-600">
                {passwordMode === 'set' ? 'Password' : 'New Password'}
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-600">Confirm Password</Label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1.5"
              />
            </div>
            <p className="text-xs text-gray-400">
              This lets you sign in with your email and password in addition to Google.
            </p>
            <Button
              onClick={handlePasswordSubmit}
              disabled={passwordLoading}
              className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7]"
            >
              {passwordLoading ? 'Saving...' : passwordMode === 'set' ? 'Set Password' : 'Update Password'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verify Identity Modal */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Verify Identity</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={identityForm.handleSubmit(handleIdentityVerify)}
            className="space-y-4 py-2"
          >
            <div className="flex rounded-xl border border-gray-200 p-1">
              {(['NIN', 'BVN'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setIdentityType(type)
                    identityForm.setValue('type', type)
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
                {...identityForm.register('value')}
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="Enter 11-digit number"
                className="mt-1.5"
              />
              {identityForm.formState.errors.value && (
                <p className="mt-1 text-xs text-red-500">
                  {identityForm.formState.errors.value.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={identityLoading}
              className="w-full bg-[#6C3CE1] hover:bg-[#5B32C7]"
            >
              {identityLoading ? 'Verifying…' : 'Verify Identity'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
