import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { PENDING_KEY } from '../api'
import { useAuth } from '../auth'
import FaceCapture from '../components/FaceCapture'
import type { PendingLogin } from '../types'

function readPending(): (PendingLogin & { from?: string }) | null {
  const raw = sessionStorage.getItem(PENDING_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PendingLogin & { from?: string }
  } catch {
    return null
  }
}

export default function LoginFacePage() {
  const { staff, completeFace } = useAuth()
  const navigate = useNavigate()
  const pending = readPending()
  const [faceImage, setFaceImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sentNote, setSentNote] = useState<string | null>(null)

  if (staff) {
    return <Navigate to={pending?.from || '/'} replace />
  }

  if (!pending) {
    return <Navigate to="/login" replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!pending) return
    if (!faceImage) {
      setError('Capture or upload the face of the person who is signing in.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const result = await completeFace(pending.pendingToken, faceImage)
      sessionStorage.removeItem(PENDING_KEY)
      if (result.sentToMainAdmin) {
        setSentNote('Face photo sent to Main Admin (admin). Opening the desk…')
        window.setTimeout(() => navigate(pending.from || '/'), 900)
      } else {
        navigate(pending.from || '/')
      }
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
        className="space-y-4 rounded-3xl border border-[#edd8b8] bg-[#fffdf8] p-6 shadow-sm"
      >
        <div className="flex flex-col items-center text-center">
          <img src="/ganesh.png" alt="Lord Ganesha" className="h-16 w-16 rounded-full object-cover" />
          <h1 className="font-display mt-2 text-2xl text-[#6b1d12]">Capture face</h1>
          <p className="mt-1 text-sm text-[#7a5a4a]">
            Signed in as <span className="font-semibold">{pending.staff.fullName}</span> (
            {pending.staff.username}).
            {pending.notifyMainAdmin
              ? ' This photo will be sent to Main Admin.'
              : ' Main Admin photos stay on the sign-in log only.'}
          </p>
        </div>
        <FaceCapture photo={faceImage} onCapture={(value) => setFaceImage(value || null)} />
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>
        )}
        {sentNote && (
          <div className="rounded-xl border border-[#edd8b8] bg-[#fff8ea] p-3 text-[#6b1d12]">
            {sentNote}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-[#6b1d12] py-3 font-semibold text-[#fff8ea] disabled:opacity-60"
        >
          {saving ? 'Sending…' : 'Finish sign in'}
        </button>
        <Link to="/login" className="block text-center text-sm text-[#e07a2f]">
          Back to password
        </Link>
      </form>
    </div>
  )
}
