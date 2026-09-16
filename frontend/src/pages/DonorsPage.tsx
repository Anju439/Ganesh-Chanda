import { Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { formatRupees } from '../format'
import type { Donor } from '../types'

export default function DonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load(term = search) {
    setError(null)
    const rows = await api.donors(term)
    setDonors(rows)
  }

  useEffect(() => {
    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function onSearch(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      await load(search)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function remove(id: number) {
    if (!confirm('Remove this donor from the register?')) return
    setBusyId(id)
    try {
      await api.deleteDonor(id)
      await load()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#6b1d12]">Donor register</h1>
          <p className="text-[#7a5a4a]">People who have pledged or given chanda to the mandal.</p>
        </div>
        <Link
          to="/donors/new"
          className="rounded-full bg-[#6b1d12] px-4 py-2 text-center text-sm font-semibold text-[#fff8ea] no-underline"
        >
          New registration
        </Link>
      </div>

      <form onSubmit={onSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-[#7a5a4a]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or city"
            className="w-full rounded-xl border border-[#edd8b8] bg-[#fffdf8] py-2.5 pr-3 pl-10 outline-none focus:border-[#e07a2f]"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-[#e07a2f] px-4 py-2 font-semibold text-white"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>
      )}

      {loading ? (
        <p className="text-[#7a5a4a]">Loading donors…</p>
      ) : donors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#edd8b8] bg-[#fffdf8] p-8 text-center">
          <p className="font-display text-xl text-[#6b1d12]">No donors match this search</p>
          <p className="mt-1 text-[#7a5a4a]">Register the first donor to start the collection.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-[#edd8b8] bg-[#fffdf8] md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6e6c8] text-[#6b1d12]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Donor</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Gifts</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor.id} className="border-t border-[#f0e2cb]">
                    <td className="px-4 py-3 font-semibold">{donor.fullName}</td>
                    <td className="px-4 py-3">
                      <div>{donor.email}</div>
                      <div className="text-[#7a5a4a]">{donor.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {donor.city}
                      {donor.state ? `, ${donor.state}` : ''}
                    </td>
                    <td className="px-4 py-3">{donor.donationCount}</td>
                    <td className="px-4 py-3 font-semibold">{formatRupees(donor.totalDonated)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/donors/${donor.id}/edit`}
                        className="mr-3 text-[#e07a2f] no-underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === donor.id}
                        onClick={() => remove(donor.id)}
                        className="text-red-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {donors.map((donor) => (
              <article
                key={donor.id}
                className="rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-4"
              >
                <p className="font-semibold">{donor.fullName}</p>
                <p className="text-sm text-[#7a5a4a]">{donor.email}</p>
                <p className="text-sm text-[#7a5a4a]">{donor.phone}</p>
                <p className="mt-2 text-sm">
                  {donor.donationCount} gifts · {formatRupees(donor.totalDonated)}
                </p>
                <div className="mt-3 flex gap-3">
                  <Link to={`/donors/${donor.id}/edit`} className="text-[#e07a2f] no-underline">
                    Edit
                  </Link>
                  <button type="button" onClick={() => remove(donor.id)} className="text-red-700">
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
