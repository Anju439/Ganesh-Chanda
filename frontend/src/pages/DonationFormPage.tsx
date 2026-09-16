import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { dateInputValue } from '../format'
import { PAYMENT_METHODS, PURPOSES, type DonationWrite, type Donor } from '../types'

const empty: DonationWrite = {
  donorId: 0,
  amount: 1100,
  donationDate: dateInputValue(),
  paymentMethod: 'UPI',
  purpose: 'Ganesh Utsav',
  notes: '',
}

export default function DonationFormPage() {
  const navigate = useNavigate()
  const [donors, setDonors] = useState<Donor[]>([])
  const [form, setForm] = useState<DonationWrite>(empty)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api
      .donors()
      .then((rows) => {
        setDonors(rows)
        if (rows[0]) {
          setForm((current) => ({ ...current, donorId: rows[0].id }))
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.donorId) {
      setError('Register a donor first, then record the gift.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.createDonation({
        ...form,
        amount: Number(form.amount),
        donationDate: new Date(form.donationDate).toISOString(),
      })
      navigate('/donations')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-[#7a5a4a]">Loading donors…</p>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-[#6b1d12]">Record a donation</h1>
      <p className="mt-1 text-[#7a5a4a]">
        Amounts are stored in rupees and a receipt number is assigned automatically.
      </p>

      {donors.length === 0 && (
        <div className="mt-4 rounded-xl border border-[#edd8b8] bg-[#fff8ea] p-4">
          No donors are registered yet.{' '}
          <Link to="/donors/new" className="font-semibold text-[#e07a2f]">
            Add a donor
          </Link>{' '}
          before recording chanda.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="mt-5 space-y-4 rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-5"
      >
        <label className="block text-sm font-semibold text-[#6b1d12]">
          Donor *
          <select
            required
            value={form.donorId || ''}
            onChange={(e) => setForm({ ...form, donorId: Number(e.target.value) })}
            className={inputClass}
          >
            <option value="" disabled>
              Select donor
            </option>
            {donors.map((donor) => (
              <option key={donor.id} value={donor.id}>
                {donor.fullName} — {donor.city || donor.email}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#6b1d12]">
            Amount (₹) *
            <input
              required
              type="number"
              min={1}
              step={1}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold text-[#6b1d12]">
            Date *
            <input
              required
              type="date"
              value={form.donationDate}
              onChange={(e) => setForm({ ...form, donationDate: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#6b1d12]">
            Payment method *
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className={inputClass}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-[#6b1d12]">
            Purpose *
            <select
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className={inputClass}
            >
              {PURPOSES.map((purpose) => (
                <option key={purpose}>{purpose}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold text-[#6b1d12]">
          Notes
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputClass}
          />
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || donors.length === 0}
            className="rounded-full bg-[#6b1d12] px-5 py-2 font-semibold text-[#fff8ea] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save donation'}
          </button>
          <Link to="/donations" className="rounded-full px-5 py-2 text-[#6b1d12] no-underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'mt-1 w-full rounded-xl border border-[#edd8b8] bg-white px-3 py-2 outline-none focus:border-[#e07a2f]'
