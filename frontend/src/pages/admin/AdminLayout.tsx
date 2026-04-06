import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import api, { tokenStore } from '../../lib/api'
import '../../styles/admin.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Verify auth on mount.
  // If we already have an in-memory token (e.g. right after login, or Safari
  // which blocks cross-domain cookies), use it directly.
  // Otherwise try cookie-based refresh (desktop Chrome/Firefox).
  useEffect(() => {
    const existingToken = tokenStore.get()
    if (existingToken) {
      api
        .get('/admin/auth/me')
        .then(() => setChecking(false))
        .catch(() => navigate('/admin/login'))
    } else {
      api
        .post('/admin/auth/refresh')
        .then((res) => {
          tokenStore.set(res.data.data.accessToken)
          return api.get('/admin/auth/me')
        })
        .then(() => setChecking(false))
        .catch(() => navigate('/admin/login'))
    }
  }, [navigate])

  function handleLogout() {
    tokenStore.clear()
    navigate('/admin/login')
  }

  if (checking) {
    return (
      <div className="admin-root min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-gray-900 text-white font-medium'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  const sidebar = (
    <aside
      className="bg-white border-r border-gray-100 flex flex-col p-5 h-full overflow-y-auto"
      style={{ minWidth: 240, width: 240 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900" style={{ fontSize: 16 }}>
            Wallcraft Admin
          </h1>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: 12 }}>
            Управление контентом
          </p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-gray-700 p-1 rounded"
          aria-label="Закрыть меню"
        >
          ✕
        </button>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        <p
          className="text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1"
          style={{ fontSize: 11 }}
        >
          Заявки
        </p>
        <NavLink to="/admin/leads" className={navClass}>
          Заявки
        </NavLink>

        <p
          className="text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1"
          style={{ fontSize: 11 }}
        >
          Продукты
        </p>
        <NavLink to="/admin/panels" className={navClass}>
          Панели
        </NavLink>

        <p
          className="text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1"
          style={{ fontSize: 11 }}
        >
          Сайт
        </p>
        <NavLink to="/admin/hero-slides" className={navClass}>
          Главная (слайды)
        </NavLink>
        <NavLink to="/admin/projects" className={navClass}>
          Проекты
        </NavLink>
        <NavLink to="/admin/gallery" className={navClass}>
          Галерея
        </NavLink>
        <NavLink to="/admin/blog" className={navClass}>
          Блог
        </NavLink>
        <NavLink to="/admin/designers" className={navClass}>
          Дизайнеры
        </NavLink>
        <NavLink to="/admin/dealers" className={navClass}>
          Дилеры
        </NavLink>
        <NavLink to="/admin/partners" className={navClass}>
          Партнёры
        </NavLink>
        <NavLink to="/admin/team" className={navClass}>
          Команда
        </NavLink>
        <NavLink to="/admin/pages" className={navClass}>
          Страницы (CMS)
        </NavLink>

        <p
          className="text-gray-400 uppercase tracking-wider px-3 pt-4 pb-1"
          style={{ fontSize: 11 }}
        >
          Настройки
        </p>
        <NavLink to="/admin/settings" className={navClass}>
          Настройки магазина
        </NavLink>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 text-gray-400 hover:text-gray-700 transition-colors text-left px-3 py-2 rounded-lg hover:bg-gray-100"
        style={{ fontSize: 14 }}
      >
        Выйти
      </button>
    </aside>
  )

  return (
    <div className="admin-root min-h-screen bg-gray-50 flex" style={{ fontSize: 15 }}>
      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <div className="hidden lg:flex flex-col" style={{ width: 240, minWidth: 240, flexShrink: 0 }}>
        {sidebar}
      </div>

      {/* ── Mobile sidebar (drawer overlay) ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-10 flex flex-col h-full shadow-xl" style={{ width: 260 }}>
            {sidebar}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100"
          style={{ minHeight: 56 }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Открыть меню"
          >
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="19" y2="6" />
              <line x1="3" y1="12" x2="19" y2="12" />
              <line x1="3" y1="18" x2="19" y2="18" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900" style={{ fontSize: 15 }}>
            Wallcraft Admin
          </span>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
