import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import FaceCapture from '../components/FaceCapture'

export default function LoginPage() {
  const { staff, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (staff) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!faceImage) {
      setError('Capture the face of the staff member who is signing in.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await login(username.trim(), password, faceImage)
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
          Public visitors cannot open the donor register. Sign in with a committee account, and
          capture a photo of the person at the desk so the mandal knows who entered the ledger.
        </p>
        <div className="mt-6 rounded-2xl bg-[#4d140c] p-4 text-sm text-[#f3d9b0]">
          <p className="font-semibold text-[#e8a317]">Seeded staff accounts</p>
          <p className="mt-2">admin / Chanda@2026 — Committee Secretary</p>
          <p>clerk / Clerk@2026 — Collection Desk</p>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border border-[#edd8b8] bg-[#fffdf8] p-6 shadow-sm"
      >
        <h2 className="font-display text-2xl text-[#6b1d12]">Staff sign in</h2>
        <FaceCapture photo={faceImage} onCapture={(value) => setFaceImage(value || null)} />
        <label className="block text-sm font-semibold text-[#6b1d12]">
          Username
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#edd8b8] bg-white px-3 py-2 outline-none focus:border-[#e07a2f]"
            autoComplete="username"
          />
        </label>
        <label className="block text-sm font-semibold text-[#6b1d12]">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#edd8b8] bg-white px-3 py-2 outline-none focus:border-[#e07a2f]"
            autoComplete="current-password"
          />
        </label>
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
