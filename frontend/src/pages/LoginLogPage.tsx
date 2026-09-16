import { useEffect, useState } from 'react'
import { api } from '../api'
import { formatDate } from '../format'
import type { LoginAudit } from '../types'

export default function LoginLogPage() {
  const [rows, setRows] = useState<LoginAudit[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .loginHistory()
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-[#6b1d12]">Who signed in</h1>
        <p className="text-[#7a5a4a]">
          Each successful login stores the staff account and a face photo of the person at the
          keyboard.
        </p>
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>
      )}
      {loading ? (
        <p className="text-[#7a5a4a]">Loading sign-in log…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#edd8b8] bg-[#fffdf8] p-8 text-center">
          <p className="font-display text-xl text-[#6b1d12]">No sign-ins recorded yet</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="overflow-hidden rounded-2xl border border-[#edd8b8] bg-[#fffdf8] shadow-sm"
            >
              <img
                src={row.faceImageUrl}
                alt={`Face captured for ${row.fullName}`}
                className="h-44 w-full object-cover bg-[#f6e6c8]"
              />
              <div className="p-4">
                <p className="font-semibold">{row.fullName}</p>
                <p className="text-sm text-[#7a5a4a]">@{row.username}</p>
                <p className="mt-2 text-sm">{formatDate(row.loggedInAt)}</p>
                <p className="text-xs text-[#7a5a4a]">
                  {new Date(row.loggedInAt).toLocaleTimeString('en-IN')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
