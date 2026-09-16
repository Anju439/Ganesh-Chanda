import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { formatDate, formatRupees } from '../format'
import type { Donation } from '../types'

export default function DonationsPage() {
  const [rows, setRows] = useState<Donation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await api.donations()
    setRows(data)
  }

  useEffect(() => {
    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function remove(id: number) {
    if (!confirm('Delete this donation receipt?')) return
    try {
      await api.deleteDonation(id)
      await load()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#6b1d12]">Donations</h1>
          <p className="text-[#7a5a4a]">Every chanda entry with a generated receipt number.</p>
        </div>
        <Link
          to="/donations/new"
          className="rounded-full bg-[#6b1d12] px-4 py-2 text-center text-sm font-semibold text-[#fff8ea] no-underline"
        >
          Record donation
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>
      )}

      {loading ? (
        <p className="text-[#7a5a4a]">Loading donations…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#edd8b8] bg-[#fffdf8] p-8 text-center">
          <p className="font-display text-xl text-[#6b1d12]">The ledger is empty</p>
          <p className="mt-1 text-[#7a5a4a]">Record the first gift after registering a donor.</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-[#edd8b8] bg-[#fffdf8] md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6e6c8] text-[#6b1d12]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Receipt</th>
                  <th className="px-4 py-3 font-semibold">Donor</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Purpose</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-[#f0e2cb]">
                    <td className="px-4 py-3 font-mono text-xs">{row.receiptNumber}</td>
                    <td className="px-4 py-3 font-semibold">{row.donorName}</td>
                    <td className="px-4 py-3">{formatRupees(row.amount)}</td>
                    <td className="px-4 py-3">{formatDate(row.donationDate)}</td>
                    <td className="px-4 py-3">{row.paymentMethod}</td>
                    <td className="px-4 py-3">{row.purpose}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => remove(row.id)} className="text-red-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {rows.map((row) => (
              <article key={row.id} className="rounded-2xl border border-[#edd8b8] bg-[#fffdf8] p-4">
                <p className="font-mono text-xs text-[#7a5a4a]">{row.receiptNumber}</p>
                <p className="font-semibold">{row.donorName}</p>
                <p className="text-[#6b1d12]">{formatRupees(row.amount)}</p>
                <p className="text-sm text-[#7a5a4a]">
                  {formatDate(row.donationDate)} · {row.paymentMethod} · {row.purpose}
                </p>
                {row.notes ? <p className="mt-1 text-sm">{row.notes}</p> : null}
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="mt-2 text-sm text-red-700"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
