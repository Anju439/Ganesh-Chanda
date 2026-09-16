import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { formatDate } from '../format'
import type { InboxAlert } from '../types'

export default function AlertsPage() {
  const { staff } = useAuth()
  const [rows, setRows] = useState<InboxAlert[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const data = await api.alerts()
    setRows(data)
  }

  useEffect(() => {
    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (staff && !staff.isMainAdmin) {
    return <Navigate to="/" replace />
  }

  async function markRead(id: number) {
    await api.markAlertRead(id)
    await load()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-[#6b1d12]">Admin inbox</h1>
        <p className="text-[#7a5a4a]">
          Face photos and donor or donation entries from Admin 1–5 are delivered here. They are not
          sent to the other admin accounts.
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>
      )}
      {loading ? (
        <p className="text-[#7a5a4a]">Loading alerts…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#edd8b8] bg-[#fffdf8] p-8 text-center">
          <p className="font-display text-xl text-[#6b1d12]">No messages yet</p>
          <p className="mt-1 text-[#7a5a4a]">When Admin 1–5 sign in or register a donor, it appears here.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className={`flex flex-col gap-3 rounded-2xl border bg-[#fffdf8] p-4 sm:flex-row ${
                row.isRead ? 'border-[#edd8b8]' : 'border-[#e07a2f]'
              }`}
            >
              {row.faceImageUrl ? (
                <img
                  src={row.faceImageUrl}
                  alt={`Face of ${row.fullName}`}
                  className="h-28 w-full rounded-xl object-cover sm:h-28 sm:w-28"
                />
              ) : null}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#e07a2f]">
                  {row.kind === 'FaceLogin'
                    ? 'Face login'
                    : row.kind === 'DonorRegister'
                      ? 'Donor registration'
                      : 'Donation'}
                </p>
                <p className="font-semibold">{row.fullName}</p>
                <p className="text-sm text-[#7a5a4a]">
                  @{row.username} · {row.role}
                </p>
                <p className="mt-2 text-sm">{row.details}</p>
                <p className="mt-1 text-xs text-[#7a5a4a]">
                  {formatDate(row.createdAt)} {new Date(row.createdAt).toLocaleTimeString('en-IN')}
                </p>
                {!row.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(row.id)}
                    className="mt-2 text-sm font-semibold text-[#e07a2f]"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
