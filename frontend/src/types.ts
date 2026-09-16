export type Donor = {
  id: number
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  createdAt: string
  donationCount: number
  totalDonated: number
}

export type DonorWrite = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

export type Donation = {
  id: number
  donorId: number
  donorName: string
  amount: number
  donationDate: string
  paymentMethod: string
  purpose: string
  receiptNumber: string
  notes: string
  createdAt: string
}

export type DonationWrite = {
  donorId: number
  amount: number
  donationDate: string
  paymentMethod: string
  purpose: string
  notes: string
}

export type NamedTotal = {
  name: string
  total: number
  count: number
}

export type MonthlyTotal = {
  month: string
  total: number
}

export type TopDonor = {
  donorId: number
  fullName: string
  totalDonated: number
  giftCount: number
}

export type Dashboard = {
  totalRaised: number
  donorCount: number
  donationCount: number
  thisMonthTotal: number
  averageGift: number
  byPaymentMethod: NamedTotal[]
  byPurpose: NamedTotal[]
  monthlyTrend: MonthlyTotal[]
  recentDonations: Donation[]
  topDonors: TopDonor[]
}

export type Staff = {
  id: number
  username: string
  fullName: string
  role: string
  isMainAdmin: boolean
}

export type PendingLogin = {
  pendingToken: string
  requiresFace: boolean
  notifyMainAdmin: boolean
  staff: Staff
}

export type LoginResult = {
  token: string
  staff: Staff
  sentToMainAdmin: boolean
}

export type LoginAudit = {
  id: number
  staffMemberId: number
  fullName: string
  username: string
  loggedInAt: string
  faceImageUrl: string
}

export type InboxAlert = {
  id: number
  staffMemberId: number
  fullName: string
  username: string
  role: string
  kind: string
  details: string
  createdAt: string
  faceImageUrl: string
  isRead: boolean
}

export const PAYMENT_METHODS = ['UPI', 'Cash', 'Bank Transfer', 'Cheque', 'Card'] as const

export const PURPOSES = [
  'Ganesh Utsav',
  'Temple Maintenance',
  'Annadanam',
  'Cultural Programs',
  'General Fund',
] as const
