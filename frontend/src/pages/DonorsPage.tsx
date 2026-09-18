import { Search } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { formatDate, formatRupees } from '../format'
import type { Donor } from '../types'
import { useAuth } from '../auth'

export default function DonorsPage() {
  const { staff } = useAuth()
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
          <p className="text-[#7a5a4a]">Excel-style donor ledger with collection totals and quick actions.</p>
        </div>
        {staff ? (
          <Link to="/donors/new" className="rounded-full bg-[#6b1d12] px-4 py-2 text-center text-sm font-semibold text-[#fff8ea] no-underline">Add donor & donation</Link>
        ) : (
          <span className="rounded-full bg-[#f6e6c8] px-4 py-2 text-sm font-semibold text-[#6b1d12]">Public read-only view</span>
        )}
      </div>

      <form onSubmit={onSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-[#7a5a4a]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={staff ? "Search by name, email, phone, or city" : "Search by donor name or city"}
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
        <div className="overflow-x-auto rounded-2xl border border-[#edd8b8] bg-[#fffdf8] shadow-sm">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#6b1d12] text-[#fff8ea]">
              <tr>
                <th className="px-4 py-3.5 font-semibold">Donor</th>
                <th className="px-4 py-3.5 font-semibold">Email</th>
                <th className="px-4 py-3.5 font-semibold">Phone</th>
                <th className="px-4 py-3.5 font-semibold">City / State</th>
                <th className="px-4 py-3.5 font-semibold">Last donation</th>
                <th className="px-4 py-3.5 text-center font-semibold">Donations</th>
                <th className="px-4 py-3.5 text-right font-semibold">Total donated</th>
                <th className="px-4 py-3.5 text-right font-semibold">{staff ? 'Actions' : 'Access'}</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((donor, index) => (
                <tr
                  key={donor.id}
                  className={`border-t border-[#f0e2cb] transition hover:bg-[#fff6e7] ${index % 2 ? 'bg-[#fffaf1]' : 'bg-white'}`}
                >
                  <td className="px-4 py-3.5 font-semibold text-[#5e281d]">{donor.fullName}</td>
                  <td className="px-4 py-3.5 text-[#6f594d]">{donor.email || '—'}</td>
                  <td className="px-4 py-3.5 text-[#6f594d]">{donor.phone || '—'}</td>
                  <td className="px-4 py-3.5 text-[#6f594d]">
                    {[donor.city, donor.state].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-[#6f594d]">{donor.lastDonationDate ? formatDate(donor.lastDonationDate) : '—'}</td>
                  <td className="px-4 py-3.5 text-center">{donor.donationCount}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-[#6b1d12]">
                    {formatRupees(donor.totalDonated)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    {staff ? (
                      <>
                        <Link to={`/donations/new?donorId=${donor.id}`} className="mr-2 rounded-lg bg-[#fff0dc] px-2.5 py-1.5 font-semibold text-[#9a4b16] no-underline hover:bg-[#ffe3bd]">+ Donation</Link>
                        <Link to={`/donors/${donor.id}/edit`} className="mr-3 rounded-lg px-2.5 py-1.5 font-semibold text-[#d96d26] no-underline hover:bg-[#fff0dc]">Edit</Link>
                        <button type="button" disabled={busyId === donor.id} onClick={() => remove(donor.id)} className="rounded-lg px-2.5 py-1.5 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">{busyId === donor.id ? 'Removing…' : 'Remove'}</button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold text-[#7a5a4a]">Read only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
