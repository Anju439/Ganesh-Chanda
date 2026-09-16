import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PENDING_KEY } from '../api'
import { useAuth } from '../auth'

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'Chanda@2026', label: 'Main admin' },
  { username: 'admin1', password: 'Admin1@2026', label: 'Admin 1' },
  { username: 'admin2', password: 'Admin2@2026', label: 'Admin 2' },
  { username: 'admin3', password: 'Admin3@2026', label: 'Admin 3' },
  { username: 'admin4', password: 'Admin4@2026', label: 'Admin 4' },
  { username: 'admin5', password: 'Admin5@2026', label: 'Admin 5' },
] as const

export default function LoginPage() {
  const { staff, startLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Chanda@2026')
  const [showPassword, setShowPassword] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (staff) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const pending = await startLogin(username.trim(), password.trim())
      sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...pending, from }))
      navigate('/login/face')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-8">
      <form
        onSubmit={onSubmit}
        autoComplete="off"
        className="space-y-4 rounded-3xl border border-[#edd8b8] bg-[#fffdf8] p-6 shadow-sm"
      >
        <div className="flex flex-col items-center text-center">
          <img
            src="/ganesh.png"
            alt="Lord Ganesha"
            className="h-20 w-20 rounded-full border-2 border-[#e8a317] object-cover bg-[#6b1d12]"
          />
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-[#e07a2f]">Shri Ganeshaya Namah</p>
          <h1 className="font-display mt-1 text-3xl text-[#6b1d12]">Ganesh Chanda</h1>
          <p className="mt-2 text-sm text-[#7a5a4a]">
            Only Main Admin and Admin 1–5 can sign in. After password check, a face photo is
            required. Photos from Admin 1–5 are sent to Main Admin.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => {
                setUsername(account.username)
                setPassword(account.password)
                setError(null)
              }}
              className="rounded-full border border-[#edd8b8] px-3 py-1 text-xs font-semibold text-[#6b1d12]"
            >
              {account.label}
            </button>
          ))}
        </div>
        <label className="block text-sm font-semibold text-[#6b1d12]">
          Username
          <input
            required
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#edd8b8] bg-white px-3 py-2 font-mono outline-none focus:border-[#e07a2f]"
          />
        </label>
        <label className="block text-sm font-semibold text-[#6b1d12]">
          Password
          <input
            required
            autoComplete="off"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#edd8b8] bg-white px-3 py-2 font-mono outline-none focus:border-[#e07a2f]"
          />
        </label>
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="text-sm font-semibold text-[#e07a2f]"
        >
          {showPassword ? 'Hide password' : 'Show password'}
        </button>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-[#e07a2f] py-3 font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Checking…' : 'Continue to face capture'}
        </button>
      </form>
    </div>
  )
}
