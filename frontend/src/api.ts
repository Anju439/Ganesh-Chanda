import type {
  Dashboard,
  Donation,
  DonationWrite,
  Donor,
  DonorWrite,
  DonorRegistration,
  InboxAlert,
  LoginAudit,
  LoginResult,
  PendingLogin,
  Staff,
} from './types'

const TOKEN_KEY = 'ganesh-chanda-token'
export const PENDING_KEY = 'ganesh-chanda-pending'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://ganesh-chanda-may4.onrender.com'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })

  if (response.status === 401 && !path.includes('/api/auth/login')) {
    setToken(null)
    window.location.assign('/login')
    throw new Error('Please sign in with an authorized staff account.')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { message?: string; title?: string }
      message = body.message ?? body.title ?? message
    } catch {
      /* keep default */
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  startLogin: (username: string, password: string) =>
    request<PendingLogin>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  completeFaceLogin: (pendingToken: string, faceImage: string) =>
    request<LoginResult>('/api/auth/login/face', {
      method: 'POST',
      body: JSON.stringify({ pendingToken, faceImage }),
    }),
  me: () => request<Staff>('/api/auth/me'),
  loginHistory: () => request<LoginAudit[]>('/api/auth/logins'),
  alerts: () => request<InboxAlert[]>('/api/auth/alerts'),
  markAlertRead: (id: number) =>
    request<void>(`/api/auth/alerts/${id}/read`, { method: 'POST' }),
  dashboard: () => request<Dashboard>('/api/dashboard'),
  donors: (search = '') =>
    request<Donor[]>(`/api/donors${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  donor: (id: number) => request<Donor>(`/api/donors/${id}`),
  createDonor: (payload: DonorWrite) =>
    request<Donor>('/api/donors', { method: 'POST', body: JSON.stringify(payload) }),
  registerDonorWithDonation: (payload: DonorRegistration) =>
    request<Donor>('/api/donors/register-with-donation', { method: 'POST', body: JSON.stringify(payload) }),
  updateDonor: (id: number, payload: DonorWrite) =>
    request<Donor>(`/api/donors/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDonor: (id: number) => request<void>(`/api/donors/${id}`, { method: 'DELETE' }),
  donations: (donorId?: number) =>
    request<Donation[]>(`/api/donations${donorId ? `?donorId=${donorId}` : ''}`),
  createDonation: (payload: DonationWrite) =>
    request<Donation>('/api/donations', { method: 'POST', body: JSON.stringify(payload) }),
  deleteDonation: (id: number) => request<void>(`/api/donations/${id}`, { method: 'DELETE' }),
}
