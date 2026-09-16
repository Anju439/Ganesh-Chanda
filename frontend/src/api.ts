import type { Dashboard, Donation, DonationWrite, Donor, DonorWrite } from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })

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
  dashboard: () => request<Dashboard>('/api/dashboard'),
  donors: (search = '') =>
    request<Donor[]>(`/api/donors${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  donor: (id: number) => request<Donor>(`/api/donors/${id}`),
  createDonor: (payload: DonorWrite) =>
    request<Donor>('/api/donors', { method: 'POST', body: JSON.stringify(payload) }),
  updateDonor: (id: number, payload: DonorWrite) =>
    request<Donor>(`/api/donors/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteDonor: (id: number) => request<void>(`/api/donors/${id}`, { method: 'DELETE' }),
  donations: (donorId?: number) =>
    request<Donation[]>(
      `/api/donations${donorId ? `?donorId=${donorId}` : ''}`,
    ),
  createDonation: (payload: DonationWrite) =>
    request<Donation>('/api/donations', { method: 'POST', body: JSON.stringify(payload) }),
  deleteDonation: (id: number) => request<void>(`/api/donations/${id}`, { method: 'DELETE' }),
}
