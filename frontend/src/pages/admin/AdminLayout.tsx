import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import api, { tokenStore } from '../../lib/api'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  // Verify auth on mount — try refresh first (httpOnly cookie), then check /me
  useEffect(() => {
    api.post('/admin/auth/refresh')
      .then(res => {
        tokenStore.set(res.data.data.accessToken)
        return api.get('/admin/auth/me')
      })
      .then(() => setChecking(false))
      .catch(() => navigate('/admin/login'))
  }, [navigate])

  function handleLogout() {
    tokenStore.clear()
    navigate('/admin/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col p-4">
        <div className="mb-6">
          <h1 className="text-sm font-medium text-gray-900">Wallcraft Admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">Управление контентом</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLink to="/admin/panels" className={navClass}>Панели</NavLink>
          <NavLink to="/admin/accessories" className={navClass}>Аксессуары</NavLink>
          <NavLink to="/admin/settings" className={navClass}>Настройки магазина</NavLink>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto text-xs text-gray-400 hover:text-gray-600 transition-colors text-left px-3 py-2"
        >
          Выйти
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
