import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import type { DonorWrite } from '../types'

const empty: DonorWrite = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
}

export default function DonorFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<DonorWrite>(empty)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .donor(Number(id))
      .then((donor) =>
        setForm({
          fullName: donor.fullName,
          email: donor.email,
          phone: donor.phone,
          address: donor.address,
          city: donor.city,
          state: donor.state,
          pincode: donor.pincode,
        }),
      )
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  function update(field: keyof DonorWrite, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEdit && id) {
        await api.updateDonor(Number(id), form)
      } else {
        await api.createDonor(form)
      }
      navigate('/donors')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-[#7a5a4a]">Loading donor…</p>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl text-[#6b1d12]">
        {isEdit ? 'Update donor' : 'Donor registration'}
      </h1>
      <p className="mt-1 text-[#7a5a4a]">
        Capture contact details before recording chanda against this person.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="mt-5 space-y-4 rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-5"
      >
        <Field label="Full name" required>
          <input
            required
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" required>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Phone" required>
            <input
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Address">
          <input
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City">
            <input
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="State">
            <input
              value={form.state}
              onChange={(e) => update('state', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="PIN code">
            <input
              value={form.pincode}
              onChange={(e) => update('pincode', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#6b1d12] px-5 py-2 font-semibold text-[#fff8ea] disabled:opacity-60"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Register donor'}
          </button>
          <Link to="/donors" className="rounded-full px-5 py-2 text-[#6b1d12] no-underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

const inputClass =
  'mt-1 w-full rounded-xl border border-[#edd8b8] bg-white px-3 py-2 outline-none focus:border-[#e07a2f]'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block text-sm font-semibold text-[#6b1d12]">
      {label}
      {required ? ' *' : ''}
      {children}
    </label>
  )
}
