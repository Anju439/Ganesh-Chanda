import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import DonationFormPage from './pages/DonationFormPage'
import DonationsPage from './pages/DonationsPage'
import DonorFormPage from './pages/DonorFormPage'
import DonorsPage from './pages/DonorsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="donors" element={<DonorsPage />} />
        <Route path="donors/new" element={<DonorFormPage />} />
        <Route path="donors/:id/edit" element={<DonorFormPage />} />
        <Route path="donations" element={<DonationsPage />} />
        <Route path="donations/new" element={<DonationFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
