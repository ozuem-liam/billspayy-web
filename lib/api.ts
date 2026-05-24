import axios from 'axios'
import { useAppStore } from '@/store'
import { encryptPayload, decryptResponse } from './encryption'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add Authorization header + encrypt body
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const { token } = useAppStore.getState()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    if (config.data && typeof config.data === 'object') {
      config.data = await encryptPayload(config.data)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: decrypt body, then handle 401
api.interceptors.response.use(
  async (res) => {
    res.data = await decryptResponse(res.data)
    return res
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      useAppStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authApi = {
  googleLogin: (idToken: string) =>
    api.post('/auth/google/login', { idToken }),
  register: (data: {
    userId: string
    userEmail: string
    name?: string
    picture?: string
    nin?: string
    bvn?: string
    referralCode?: string
    passwordHash?: string
  }) => api.post('/auth/register', data),
  signup: (email: string, password: string, name: string) =>
    api.post('/auth/signup', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
}

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  setPin: (pin: string) => api.post('/user/set-pin', { pin }),
  updatePin: (oldPin: string, newPin: string) =>
    api.put('/user/update-pin', { oldPin, newPin }),
  verifyIdentity: (type: 'NIN' | 'BVN', value: string) =>
    api.post('/user/verify-identity', { type, value }),
  setPassword: (password: string) =>
    api.post('/user/set-password', { password }),
  updatePassword: (oldPassword: string, newPassword: string) =>
    api.put('/user/update-password', { oldPassword, newPassword }),
}

/** Generate a stable idempotency key for a mutating request.
 *  Callers should generate once and reuse on retry — do NOT call inside a retry loop. */
export function generateIdempotencyKey(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const walletApi = {
  fund: (amount: number, paymentMethod: string, userEmail?: string, callbackUrl?: string, idempotencyKey?: string) =>
    api.post('/wallet/fund', { amount, paymentMethod, userEmail, callbackUrl }, {
      headers: { 'Idempotency-Key': idempotencyKey ?? generateIdempotencyKey() },
    }),
  verify: (reference: string, trxref?: string, paymentMethod?: string) =>
    api.post('/wallet/verify', { reference, trxref, paymentMethod }),
  getBalance: () => api.post('/wallet/balance', {}),
  getTransactions: (limit?: number) =>
    api.post('/wallet/transactions', { limit }),
}

export const billsApi = {
  // Airtime
  purchaseAirtime: (data: {
    amount: number
    recipient: string
    serviceId?: string
    pin?: string
  }) => api.post('/airtime/purchase', data),
  getAirtimeCodes: () => api.post('/airtime/codes', {}),

  // Data
  getDataPlans: (network: string) =>
    api.get(`/data/plans?network=${network}`),
  purchaseData: (data: {
    amount: number
    recipient: string
    productId?: string
    network?: string
    pin?: string
  }) => api.post('/data/purchase', data),

  // Electricity
  validateElectricity: (customerAccountId: string, serviceId: string) =>
    api.post('/electricity/validate', { customerAccountId, serviceId }),
  purchaseElectricity: (data: {
    amount: number
    customerAccountId: string
    customerName: string
    customerAddress: string
    serviceId: string
    pin?: string
    mdEnabled?: boolean
  }) => api.post('/electricity/purchase', data),
  getElectricityCodes: () => api.post('/electricity/codes', {}),

  // Cable TV
  validateCableTv: (customerNo: string, serviceId: string) =>
    api.post('/cabletv/validate', { customerNo, serviceId }),
  purchaseCableTv: (data: {
    amount: number
    customerNo: string
    productCode?: string
    serviceId: string
    pin?: string
  }) => api.post('/cabletv/purchase', data),
  getMultichoiceProducts: (service: 'DSTV' | 'GOTV') =>
    api.get(`/cabletv/multichoice/products?service=${service}`),
  getStartimesProducts: () => api.get('/cabletv/startimes/products'),
  getShowmaxPlans: () => api.get('/cabletv/showmax/plans'),
  getCableTvCodes: () => api.post('/cabletv/codes', {}),
}

export const transactionsApi = {
  getBillsTransactions: (limit = 20, offset = 0) =>
    api.get(`/bills-payment/transactions?limit=${limit}&offset=${offset}`),
  getReceipt: (reference: string) =>
    api.get(`/bills-payment/v1/transactions/${reference}/receipt`),
  requery: (requestId: string) =>
    api.get(`/bills-payment/requery/${requestId}`),
}

export const earningsApi = {
  getWallets: () => api.get('/v1/wallets'),
  getLedger: (
    type: 'COMMISSION' | 'REWARD',
    params?: {
      from?: string
      to?: string
      cursor?: string
      limit?: number
    }
  ) => {
    const searchParams = new URLSearchParams()
    if (params?.from) searchParams.set('from', params.from)
    if (params?.to) searchParams.set('to', params.to)
    if (params?.cursor) searchParams.set('cursor', params.cursor)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const query = searchParams.toString()
    return api.get(`/v1/wallets/${type}/ledger${query ? `?${query}` : ''}`)
  },
}

export const referralsApi = {
  getReferrals: () => api.get('/v1/customers/me/referrals'),
}

export const analyticsApi = {
  getLeaderboard: (params?: {
    userId?: string
    timeRange?: string
    category?: string
    limit?: number
    page?: number
  }) => api.post('/analytics/leaderboard', params || {}),
  getTier: (userId: string) =>
    api.post('/analytics/tier', { userId }),
}
