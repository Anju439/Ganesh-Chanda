import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import AlertsPage from './pages/AlertsPage'
import DashboardPage from './pages/DashboardPage'
import DonationFormPage from './pages/DonationFormPage'
import DonationsPage from './pages/DonationsPage'
import DonorFormPage from './pages/DonorFormPage'
import DonorsPage from './pages/DonorsPage'
import LoginFacePage from './pages/LoginFacePage'
import LoginLogPage from './pages/LoginLogPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/face" element={<LoginFacePage />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="donors" element={<DonorsPage />} />
          <Route path="donors/new" element={<DonorFormPage />} />
          <Route path="donors/:id/edit" element={<DonorFormPage />} />
          <Route path="donations" element={<DonationsPage />} />
          <Route path="donations/new" element={<DonationFormPage />} />
          <Route path="sign-ins" element={<LoginLogPage />} />
          <Route path="inbox" element={<AlertsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
