import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../lib/api'
import { usePublicData } from '../../hooks/usePublicData'
import { useProductFilters } from '../../hooks/useProductFilters'
import { Panel, PanelCategory, Collection } from '../../types'
import ProductCard from '../../components/products/ProductCard'
import Pagination from '../../components/ui/Pagination'
import FadeIn, { StaggerChildren } from '../../components/ui/FadeIn'
import PageMeta from '../../components/ui/PageMeta'
import { Icon } from '../../components/ui/Icon'

interface PanelMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ProductsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { filters, setFilter, resetFilters, activeCount } = useProductFilters()

  const [panels, setPanels] = useState<Panel[]>([])
  const [meta, setMeta] = useState<PanelMeta>({ total: 0, page: 1, limit: 24, totalPages: 1 })
  const [fetching, setFetching] = useState(true)
  const [searchInput, setSearchInput] = useState(filters.q)
  const [priceMin, setPriceMin] = useState(filters.min_price)
  const [priceMax, setPriceMax] = useState(filters.max_price)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [view, setView] = useState<'grid' | 'list'>(() => {
    try { return (localStorage.getItem('wc-product-view') as 'grid' | 'list') || 'grid' }
    catch { return 'grid' }
  })

  const { data: categoriesRaw } = usePublicData<PanelCategory[]>('/api/panel-categories')
  const categories = categoriesRaw ?? []

  const { data: collectionsRaw } = usePublicData<Collection[]>('/api/collections')
  const collections = collectionsRaw ?? []

  // ── Backward compat: ?category=ID → ?category_id=ID ──────────
  useEffect(() => {
    const oldCat = searchParams.get('category')
    if (oldCat) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('category_id', oldCat)
        next.delete('category')
        return next
      }, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync inputs when filters reset externally ────────────────
  useEffect(() => { setSearchInput(filters.q) }, [filters.q])
  useEffect(() => { setPriceMin(filters.min_price) }, [filters.min_price])
  useEffect(() => { setPriceMax(filters.max_price) }, [filters.max_price])

  // ── Debounce search → URL ─────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setFilter('q', searchInput), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch panels ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setFetching(true)

    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.category_id) params.set('category_id', filters.category_id)
    if (filters.collection_id) params.set('collection_id', filters.collection_id)
    if (filters.sort !== 'newest') params.set('sort', filters.sort)
    if (filters.min_price) params.set('min_price', filters.min_price)
    if (filters.max_price) params.set('max_price', filters.max_price)
    if (filters.page > 1) params.set('page', String(filters.page))

    api.get(`/api/panels?${params}`)
      .then((res) => {
        if (cancelled) return
        const payload = res.data?.data ?? res.data
        const panelArray: Panel[] = Array.isArray(payload) ? payload : (payload?.data ?? [])
        const metaData = Array.isArray(payload)
          ? { total: payload.length, page: 1, limit: payload.length, totalPages: 1 }
          : (payload?.meta ?? { total: 0, page: 1, limit: 24, totalPages: 1 })
        setPanels(panelArray)
        setMeta(metaData)
      })
      .catch(() => {
        if (!cancelled) {
          setPanels([])
          setMeta({ total: 0, page: 1, limit: 24, totalPages: 1 })
        }
      })
      .finally(() => { if (!cancelled) setFetching(false) })

    return () => { cancelled = true }
  }, [filters.q, filters.category_id, filters.collection_id, filters.sort, filters.min_price, filters.max_price, filters.page])

  function handlePageChange(p: number) {
    setFilter('page', p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleView(v: 'grid' | 'list') {
    setView(v)
    try { localStorage.setItem('wc-product-view', v) } catch {}
  }

  function applyPrice() {
    setFilter('min_price', priceMin)
    setFilter('max_price', priceMax)
  }

  // ── Sidebar filter panel (reused for desktop + mobile drawer) ─
  const SidebarContent = () => (
    <>
      {/* Category */}
      <div className="pub-sidebar-section">
        <h3 className="pub-sidebar-section__title">{t('products.category', 'Category')}</h3>
        <ul className="pub-sidebar-list">
          <li>
            <button
              className={`pub-sidebar-option${filters.category_id === '' ? ' active' : ''}`}
              onClick={() => setFilter('category_id', '')}
              type="button"
            >
              <span className="pub-sidebar-option__dot" />
              {t('products.all')}
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`pub-sidebar-option${filters.category_id === cat.id ? ' active' : ''}`}
                onClick={() => setFilter('category_id', cat.id)}
                type="button"
              >
                <span className="pub-sidebar-option__dot" />
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Collection */}
      {collections.length > 0 && (
        <div className="pub-sidebar-section">
          <h3 className="pub-sidebar-section__title">{t('products.collection', 'Collection')}</h3>
          <ul className="pub-sidebar-list">
            <li>
              <button
                className={`pub-sidebar-option${filters.collection_id === '' ? ' active' : ''}`}
                onClick={() => setFilter('collection_id', '')}
                type="button"
              >
                <span className="pub-sidebar-option__dot" />
                {t('products.all')}
              </button>
            </li>
            {collections.map((col) => (
              <li key={col.id}>
                <button
                  className={`pub-sidebar-option${filters.collection_id === col.id ? ' active' : ''}`}
                  onClick={() => setFilter('collection_id', col.id)}
                  type="button"
                >
                  <span className="pub-sidebar-option__dot" />
                  {col.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price range */}
      <div className="pub-sidebar-section">
        <h3 className="pub-sidebar-section__title">{t('products.price', 'Price')}</h3>
        <div className="pub-sidebar-price">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
        <button className="pub-sidebar-apply" onClick={applyPrice} type="button">
          {t('products.apply', 'Apply')}
        </button>
        {(filters.min_price || filters.max_price) && (
          <button
            className="pub-sidebar-clear"
            onClick={() => { setPriceMin(''); setPriceMax(''); setFilter('min_price', ''); setFilter('max_price', '') }}
            type="button"
          >
            × {t('products.clear', 'Clear')}
          </button>
        )}
      </div>

      {/* Reset all */}
      {activeCount > 0 && (
        <div className="pub-sidebar-section">
          <button className="pub-sidebar-reset" onClick={resetFilters} type="button">
            × {t('products.reset_filters')}
          </button>
        </div>
      )}
    </>
  )

  return (
    <div>
      <PageMeta
        title="Products"
        description="Browse our full collection of handcrafted 3D gypsum wall panels."
        url="/products"
      />

      <section className="pub-section">
        {/* ── Page Header ────────────────────────────────────── */}
        <FadeIn>
          <h1 className="pub-section-title">{t('products.title')}</h1>
          <p className="pub-section-subtitle">{t('products.subtitle')}</p>
        </FadeIn>

        {/* ── Top Bar: search + sort + view + results ─────────── */}
        <FadeIn delay={0.08}>
          <div className="pub-products-topbar">
            {/* Search */}
            <div className="pub-products-search">
              <span className="pub-products-search__icon">
                <Icon name="search" size={16} />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('products.search_placeholder')}
              />
              {searchInput && (
                <button
                  className="pub-products-search__clear"
                  onClick={() => setSearchInput('')}
                  type="button"
                  aria-label="Clear search"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              className="pub-products-sort"
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
            >
              <option value="newest">{t('sort.newest')}</option>
              <option value="price_asc">{t('sort.price_asc')}</option>
              <option value="price_desc">{t('sort.price_desc')}</option>
              <option value="name_asc">{t('sort.name_asc')}</option>
            </select>

            {/* View toggle */}
            <div className="pub-products-view-toggle">
              <button className={view === 'grid' ? 'active' : ''} onClick={() => toggleView('grid')} aria-label="Grid view" type="button">
                <Icon name="grid" size={16} />
              </button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => toggleView('list')} aria-label="List view" type="button">
                <Icon name="list" size={16} />
              </button>
            </div>

            {/* Results + reset — desktop */}
            <div className="pub-products-topbar__right">
              {meta.total > 0 && (
                <span className="pub-products-topbar__count">
                  {meta.total} {t('products.results_count')}
                </span>
              )}
              {activeCount > 0 && (
                <button className="pub-products-results__reset" onClick={resetFilters} type="button">
                  × {t('products.reset_filters')}
                </button>
              )}
            </div>

            {/* Mobile: Filters button */}
            <button
              className={`pub-products-filter-btn${activeCount > 0 ? ' has-active' : ''}`}
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Icon name="filter" size={15} />
              {t('products.filters', 'Filters')}
              {activeCount > 0 && <span className="pub-products-filter-btn__badge">{activeCount}</span>}
            </button>
          </div>
        </FadeIn>

        {/* ── Layout: sidebar + content ──────────────────────── */}
        <div className="pub-products-layout">

          {/* Desktop sidebar */}
          <aside className="pub-products-sidebar">
            <SidebarContent />
          </aside>

          {/* Product grid / list */}
          <div className="pub-products-content">
            {fetching ? (
              <div className="pub-product-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <div className="pub-skeleton" style={{ paddingTop: '100%' }} />
                    <div style={{ padding: 16 }}>
                      <div className="pub-skeleton" style={{ height: 16, marginBottom: 8 }} />
                      <div className="pub-skeleton" style={{ height: 12, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : panels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <Icon name="search" size={48} style={{ color: 'var(--text-disabled)' }} />
                </div>
                <p style={{ marginBottom: 16 }}>{t('products.no_results')}</p>
                {activeCount > 0 && (
                  <button onClick={resetFilters} className="pub-filter-chip active" style={{ cursor: 'pointer' }} type="button">
                    {t('products.reset_filters')}
                  </button>
                )}
              </div>
            ) : (
              <StaggerChildren
                className={view === 'list' ? 'pub-product-list' : 'pub-product-grid'}
                baseDelay={0.04}
              >
                {panels.map((panel, i) => (
                  <ProductCard key={panel.id} panel={panel} index={i} />
                ))}
              </StaggerChildren>
            )}

            {!fetching && meta.totalPages > 1 && (
              <Pagination page={filters.page} pages={meta.totalPages} onChange={handlePageChange} />
            )}
          </div>
        </div>

        {/* ── Mobile sidebar drawer ──────────────────────────── */}
        {sidebarOpen && (
          <>
            <div className="pub-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
            <div className="pub-sidebar-drawer">
              <div className="pub-sidebar-drawer__header">
                <span>{t('products.filters', 'Filters')}</span>
                <button onClick={() => setSidebarOpen(false)} type="button" aria-label="Close filters">
                  <Icon name="close" size={20} />
                </button>
              </div>
              <SidebarContent />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
