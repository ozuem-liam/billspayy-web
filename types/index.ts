export interface User {
  id: string
  email: string
  name?: string
  picture?: string
  isIdentityVerified: boolean
  identityType?: string | null
  hasPin: boolean
  isAdmin?: boolean
  referralCode?: string
  phone?: string
  tier?: string
  createdAt?: string
}

export interface Wallet {
  id: string
  balance: number // in kobo
  currency: string
  type: 'MAIN' | 'COMMISSION' | 'REWARD'
}

export interface WalletTransaction {
  id: string
  type: 'CREDIT' | 'DEBIT'
  amount: number // in kobo
  description: string
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  reference?: string
  createdAt: string
  meta?: Record<string, unknown>
}

export interface BillsPaymentTransaction {
  id: string
  reference: string
  requestId?: string
  category: 'AIRTIME' | 'DATA' | 'ELECTRICITY' | 'CABLETV' | 'LOGICAL_PINS' | 'ESIM' | 'VERIFICATION'
  serviceId?: string
  serviceName?: string
  amount: number // in kobo
  recipient?: string
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING' | 'QUEUED' | 'REFUNDED'
  commission?: number // in kobo
  token?: string
  customerName?: string
  customerAddress?: string
  meterNumber?: string
  smartCardNumber?: string
  createdAt: string
  meta?: Record<string, unknown>
}

export interface CommissionWallet {
  id: string
  type: 'COMMISSION' | 'REWARD'
  balance: number // in kobo
  currency: string
}

export interface LedgerEntry {
  id: string
  type: 'CREDIT' | 'DEBIT'
  amount: number // in kobo
  balance: number // running balance in kobo
  description: string
  category?: string
  createdAt: string
  meta?: Record<string, unknown>
}

export interface Referral {
  id: string
  referredEmail: string
  referredName?: string
  status: 'PENDING' | 'ACTIVE'
  rewardAmount?: number // in kobo
  joinedAt: string
}

export interface ReferralStats {
  referralCode: string
  totalReferrals: number
  totalEarned: number // in kobo
  currentBalance: number // in kobo
  referrals: Referral[]
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  maskedName?: string
  totalSpend: number // in kobo
  transactionCount: number
  tier: string
  isCurrentUser?: boolean
}

export interface TierInfo {
  currentTier: string
  nextTier: string | null
  currentSpend: number // in kobo
  nextThreshold: number | null // in kobo
  progress: number // 0-100
  remainingAmount: number | null // in kobo
}

export interface DataPlan {
  id: string
  productId?: string
  name: string
  size: string
  validity: string
  amount: number // in naira
  network?: string
}

export interface ElectricityService {
  id: string
  serviceId: string
  name: string
  logoUrl?: string
}

export interface CableTvProduct {
  id: string
  productCode: string
  name: string
  validity?: string
  amount: number // in naira
  description?: string
}

export interface ElectricityValidation {
  customerName: string
  customerAddress: string
  customerAccountId: string
  meterNumber?: string
  mdEnabled?: boolean
  mdCapValueKobo?: number
}

export interface CableTvValidation {
  customerName: string
  customerNo: string
  currentPackage?: string
}

export interface FundWalletResponse {
  authorizationUrl: string
  reference: string
  accessCode?: string
}

export interface PaymentResult {
  success: boolean
  reference?: string
  requestId?: string
  message?: string
  token?: string
  commission?: number
  status?: string
}

export interface ApiError {
  message: string
  statusCode?: number
  error?: string
}

export type NetworkProvider = 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE'
export type CableProvider = 'DSTV' | 'GOTV' | 'STARTIMES' | 'SHOWMAX'
export type TierName = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'
