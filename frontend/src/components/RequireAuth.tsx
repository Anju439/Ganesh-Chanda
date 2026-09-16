import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'

export default function RequireAuth() {
  const { staff, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return <p className="p-8 text-[#7a5a4a]">Checking staff session…</p>
  }

  if (!staff) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
