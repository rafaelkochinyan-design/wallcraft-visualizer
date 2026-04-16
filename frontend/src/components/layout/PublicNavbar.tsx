import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVisualizerStore } from '../../store/visualizer'
import { useThemeStore } from '../../store/theme'
import api from '../../lib/api'
import { PanelCategory } from '../../types'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'am', label: 'AM' },
  { code: 'ru', label: 'RU' },
]

export default function PublicNavbar() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { tenant } = useVisualizerStore()
  const { theme, toggle } = useThemeStore()
  const [scrolled, setScrolled] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  const [open, setOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [categories, setCategories] = useState<PanelCategory[]>([])
  const productsRef = useRef<HTMLLIElement>(null)
  const infoRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 10)
      // Auto-hide on mobile only (< 768px) when scrolling down past 80px
      if (window.innerWidth < 768) {
        setNavHidden(y > 80 && y > lastScrollY.current)
      } else {
        setNavHidden(false)
      }
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setProductsOpen(false)
    setInfoOpen(false)
  }, [location.pathname])

  // Fetch panel categories for dropdown
  useEffect(() => {
    api
      .get('/api/panel-categories')
      .then((r) => setCategories(r.data.data || []))
      .catch(() => {})
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setProductsOpen(false)
      }
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const changeLang = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('wc-lang', code)
  }

  const infoLinks = [
    { to: '/installation', label: t('nav_info.installation') },
    { to: '/partners', label: t('nav_info.collaboration') },
    { to: '/gallery', label: t('nav_info.wallcraft_walls') },
  ]

  return (
    <>
      <motion.nav
        className={`pub-navbar${scrolled ? ' scrolled' : ''}`}
        animate={{ y: navHidden ? -80 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Mobile burger — before logo */}
        <button
          className={`pub-navbar__burger${open ? ' open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>

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
          {/* Products dropdown */}
          <li ref={productsRef} style={{ position: 'relative' }}>
            <button
              className={`pub-navbar__link pub-navbar__dropdown-trigger${productsOpen ? ' active' : ''}`}
              onClick={() => { setProductsOpen((o) => !o); setInfoOpen(false) }}
            >
              {t('nav.products')} <span style={{ fontSize: 10, marginLeft: 3 }}>▾</span>
            </button>
            {productsOpen && (
              <div className="pub-navbar__dropdown">
                <Link
                  to="/products"
                  className="pub-navbar__dropdown-item"
                  onClick={() => setProductsOpen(false)}
                >
                  {t('products.all')}
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category_id=${cat.id}`}
                    className="pub-navbar__dropdown-item"
                    onClick={() => setProductsOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </li>

          <li>
            <NavLink to="/projects" className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`}>
              {t('nav.projects')}
            </NavLink>
          </li>

          <li>
            <NavLink to="/gallery" className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`}>
              {t('nav.gallery')}
            </NavLink>
          </li>

          <li>
            <NavLink to="/about" className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`}>
              {t('nav.about')}
            </NavLink>
          </li>

          {/* Information dropdown */}
          <li ref={infoRef} style={{ position: 'relative' }}>
            <button
              className={`pub-navbar__link pub-navbar__dropdown-trigger${infoOpen ? ' active' : ''}`}
              onClick={() => { setInfoOpen((o) => !o); setProductsOpen(false) }}
            >
              {t('nav.information')} <span style={{ fontSize: 10, marginLeft: 3 }}>▾</span>
            </button>
            {infoOpen && (
              <div className="pub-navbar__dropdown">
                {infoLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="pub-navbar__dropdown-item"
                    onClick={() => setInfoOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Right controls */}
        <div className="pub-navbar__right">
          {/* Language switcher */}
          <div className="pub-navbar__lang">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                className={`pub-navbar__lang-btn${i18n.language.slice(0, 2) === code ? ' active' : ''}`}
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

        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <div className={`pub-navbar__drawer${open ? ' open' : ''}`}>
        {/* Products section */}
        <div style={{ borderBottom: '1px solid var(--ui-border)', paddingBottom: 8, marginBottom: 8 }}>
          <NavLink
            to="/products"
            className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {t('nav.products')}
          </NavLink>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category_id=${cat.id}`}
              className="pub-navbar__link"
              style={{ paddingLeft: 24, fontSize: 13, opacity: 0.7, display: 'block', width: '100%' }}
              onClick={() => setOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <NavLink to="/projects" className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
          {t('nav.projects')}
        </NavLink>
        <NavLink to="/gallery" className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
          {t('nav.gallery')}
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
          {t('nav.about')}
        </NavLink>

        {/* Information section */}
        <div style={{ borderTop: '1px solid var(--ui-border)', paddingTop: 8, marginTop: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '4px 0 8px' }}>
            {t('nav.information')}
          </div>
          {infoLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `pub-navbar__link${isActive ? ' active' : ''}`}
              style={{ display: 'block', width: '100%' }}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="pub-navbar__drawer-footer">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              className={`pub-navbar__lang-btn${i18n.language.slice(0, 2) === code ? ' active' : ''}`}
              onClick={() => changeLang(code)}
            >
              {label}
            </button>
          ))}
          <button className="pub-navbar__theme-btn" onClick={toggle}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </>
  )
}
