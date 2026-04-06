import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVisualizerStore } from '../../store/visualizer'
import { useThemeStore } from '../../store/theme'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'am', label: 'AM' },
  { code: 'ru', label: 'RU' },
]

export default function PublicNavbar() {
  const { t, i18n } = useTranslation()
  const { tenant } = useVisualizerStore()
  const { theme, toggle } = useThemeStore()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [])

  const changeLang = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('wc-lang', code)
  }

  const navLinks = [
    { to: '/products', label: t('nav.products') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/designers', label: t('nav.designers') },
    { to: '/dealers', label: t('nav.dealers') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <>
      <nav className={`pub-navbar${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <Link to="/" className="pub-navbar__logo">
          {tenant?.logo_url ? (
            <img src={tenant.logo_url} alt={tenant.name} />
          ) : (
            <span className="pub-navbar__logo-text">{tenant?.name || 'WallCraft'}</span>
          )}
        </Link>

        {/* Center links */}
        <ul className="pub-navbar__links">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="pub-navbar__right">
          {/* Language switcher */}
          <div className="pub-navbar__lang">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                className={`pub-navbar__lang-btn${i18n.language === code ? ' active' : ''}`}
                onClick={() => changeLang(code)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Dark mode toggle */}
          <button className="pub-navbar__theme-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* 3D CTA */}
          <Link to="/visualizer" className="pub-navbar__cta">
            ✦ {t('nav.try3d')}
          </Link>

          {/* Mobile burger */}
          <button
            className={`pub-navbar__burger${open ? ' open' : ''}`}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`pub-navbar__drawer${open ? ' open' : ''}`}>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {label}
          </NavLink>
        ))}
        <div className="pub-navbar__drawer-footer">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              className={`pub-navbar__lang-btn${i18n.language === code ? ' active' : ''}`}
              onClick={() => changeLang(code)}
            >
              {label}
            </button>
          ))}
          <button className="pub-navbar__theme-btn" onClick={toggle}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link to="/visualizer" className="pub-navbar__cta" onClick={() => setOpen(false)}>
            ✦ {t('nav.try3d')}
          </Link>
        </div>
      </div>
    </>
  )
}
