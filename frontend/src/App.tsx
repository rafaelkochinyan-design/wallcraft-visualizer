import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import VisualizerPage from './pages/VisualizerPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import PanelsPage from './pages/admin/PanelsPage'
import AccessoriesPage from './pages/admin/AccessoriesPage'
import StoreSettingsPage from './pages/admin/StoreSettingsPage'
import LeadsPage from './pages/admin/LeadsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        theme="dark"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font)',
            fontSize: 'var(--text-sm)',
          }
        }}
      />
      <Routes>
        {/* Visualizer (public) */}
        <Route path="/" element={<VisualizerPage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/panels" replace />} />
          <Route path="panels" element={<PanelsPage />} />
          <Route path="accessories" element={<AccessoriesPage />} />
          <Route path="settings" element={<StoreSettingsPage />} />
          <Route path="leads" element={<LeadsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
