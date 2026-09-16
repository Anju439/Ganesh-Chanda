import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import FaceCapture from '../components/FaceCapture'

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'Chanda@2026', label: 'Committee secretary' },
  { username: 'clerk', password: 'Clerk@2026', label: 'Collection desk' },
] as const

export default function LoginPage() {
  const { staff, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Chanda@2026')
  const [showPassword, setShowPassword] = useState(true)
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (staff) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!faceImage) {
      setError('Capture or upload the face of the staff member who is signing in, then press Sign in.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await login(username.trim(), password.trim(), faceImage)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto grid min-h-svh max-w-5xl items-center gap-8 px-4 py-8 lg:grid-cols-2">
      <section className="rounded-3xl bg-[#6b1d12] p-8 text-[#fff8ea] shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-[#e8a317]">Authorized staff only</p>
        <h1 className="font-display mt-3 text-4xl">Ganesh Chanda desk</h1>
        <p className="mt-4 text-[#f3d9b0]">
          Use the committee username, not an email. The demo password is case-sensitive and includes
          the @ sign. Capture a face photo, then sign in.
        </p>
        <div className="mt-6 space-y-2 rounded-2xl bg-[#4d140c] p-4 text-sm text-[#f3d9b0]">
          <p className="font-semibold text-[#e8a317]">Working demo login</p>
          <p>
            Username <span className="font-mono text-[#fff8ea]">admin</span> · password{' '}
            <span className="font-mono text-[#fff8ea]">Chanda@2026</span>
          </p>
          <p>
            Username <span className="font-mono text-[#fff8ea]">clerk</span> · password{' '}
            <span className="font-mono text-[#fff8ea]">Clerk@2026</span>
          </p>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        autoComplete="off"
        className="space-y-4 rounded-3xl border border-[#edd8b8] bg-[#fffdf8] p-6 shadow-sm"
      >
        <h2 className="font-display text-2xl text-[#6b1d12]">Staff sign in</h2>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => {
                setUsername(account.username)
                setPassword(account.password)
                setError(null)
              }}
              className="rounded-full border border-[#edd8b8] px-3 py-1.5 text-sm font-semibold text-[#6b1d12]"
            >
              Fill {account.label}
            </button>
          ))}
        </div>
        <FaceCapture photo={faceImage} onCapture={(value) => setFaceImage(value || null)} />
        <label className="block text-sm font-semibold text-[#6b1d12]">
          Username
          <input
            required
            name="staff-username"
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
            name="staff-password"
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
          {saving ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
