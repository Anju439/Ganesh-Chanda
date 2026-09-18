import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { PENDING_KEY } from '../api'
import { useAuth } from '../auth'

export default function LoginPage() {
  const { staff, startLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (staff) return <Navigate to={from} replace />

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const pending = await startLogin(username.trim(), password)
      if (pending.requiresFace) {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...pending, from }))
        navigate('/login/face')
      } else {
        sessionStorage.removeItem(PENDING_KEY)
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top,#fff5df_0%,#fffaf0_38%,#f8ead5_100%)] px-4 py-8">
      <div className="pointer-events-none absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#e07a2f]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-[#6b1d12]/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-md items-center">
        <form
          onSubmit={onSubmit}
          autoComplete="off"
          className="w-full overflow-hidden rounded-[2rem] border border-[#ead4b1] bg-[#fffdf9]/95 shadow-[0_24px_70px_rgba(107,29,18,0.12)] backdrop-blur"
        >
          <div className="bg-gradient-to-br from-[#6b1d12] to-[#8d2d1b] px-7 py-7 text-center text-white">
            <img
              src="/ganesh.png"
              alt="Lord Ganesha"
              className="mx-auto h-20 w-20 rounded-full border-2 border-[#f1b84b] bg-[#6b1d12] object-cover shadow-lg"
            />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffd98a]">
              Shri Ganeshaya Namah
            </p>
            <h1 className="font-display mt-1 text-3xl">Ganesh Chanda</h1>
            <p className="mt-2 text-sm text-[#f9e9df]">Authorized staff access</p>
          </div>

          <div className="space-y-5 p-7">
            <div className="flex items-start gap-3 rounded-2xl border border-[#f0dfc5] bg-[#fff8eb] p-3.5 text-sm text-[#755141]">
              <ShieldCheck className="mt-0.5 shrink-0 text-[#e07a2f]" size={19} />
              <p>Sign in with your assigned account. Staff accounts will be asked to capture a face photo; Main Admin signs in directly.</p>
            </div>

            <label className="block text-sm font-semibold text-[#6b1d12]">
              Username
              <div className="relative mt-1.5">
                <UserRound className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#a17a65]" size={18} />
                <input
                  required
                  autoFocus
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full rounded-xl border border-[#e7d4b8] bg-white py-3 pr-3 pl-11 outline-none transition focus:border-[#e07a2f] focus:ring-2 focus:ring-[#e07a2f]/10"
                />
              </div>
            </label>

            <label className="block text-sm font-semibold text-[#6b1d12]">
              Password
              <div className="relative mt-1.5">
                <LockKeyhole className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#a17a65]" size={18} />
                <input
                  required
                  autoComplete="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-[#e7d4b8] bg-white py-3 pr-12 pl-11 outline-none transition focus:border-[#e07a2f] focus:ring-2 focus:ring-[#e07a2f]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-[#8d6855] hover:bg-[#fff3df]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#e07a2f] py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#c96624] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Checking…' : 'Sign in & continue'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
