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
  const [showPriceRange, setShowPriceRange] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.q)
  const [priceMin, setPriceMin] = useState(filters.min_price)
  const [priceMax, setPriceMax] = useState(filters.max_price)

  // View toggle: grid | list (persisted)
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('wc-product-view') as 'grid' | 'list') || 'grid'
    } catch {
      return 'grid'
    }
  })

  const { data: categoriesRaw } = usePublicData<PanelCategory[]>('/api/panel-categories')
  const categories = categoriesRaw ?? []

  const { data: collectionsRaw } = usePublicData<Collection[]>('/api/collections')
  const collections = collectionsRaw ?? []

  // ── Backward compat: ?category=ID → ?category_id=ID ──────────
  useEffect(() => {
    const oldCat = searchParams.get('category')
    if (oldCat) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('category_id', oldCat)
          next.delete('category')
          return next
        },
        { replace: true }
      )
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync inputs when filters reset externally ────────────────
  useEffect(() => { setSearchInput(filters.q) }, [filters.q])
  useEffect(() => { setPriceMin(filters.min_price) }, [filters.min_price])
  useEffect(() => { setPriceMax(filters.max_price) }, [filters.max_price])

  // ── Debounce search input → URL ───────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter('q', searchInput)
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch panels when filters change ─────────────────────────
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

    api
      .get(`/api/panels?${params}`)
      .then((res) => {
        if (cancelled) return
        // Handle both shapes: { data: Panel[] } (flat) and { data: { data: Panel[], meta } } (paginated)
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
      .finally(() => {
        if (!cancelled) setFetching(false)
      })

    return () => {
      cancelled = true
    }
  }, [filters.q, filters.category_id, filters.collection_id, filters.sort, filters.min_price, filters.max_price, filters.page])

  function handlePageChange(p: number) {
    setFilter('page', p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleView(v: 'grid' | 'list') {
    setView(v)
    try {
      localStorage.setItem('wc-product-view', v)
    } catch {}
  }

  return (
    <div>
      <PageMeta
        title="Products"
        description="Browse our full collection of handcrafted 3D gypsum wall panels."
        url="/products"
      />

      <section className="pub-section">
        {/* ── Page Header ──────────────────────────────────────── */}
        <FadeIn>
          <h1 className="pub-section-title">{t('products.title')}</h1>
          <p className="pub-section-subtitle">{t('products.subtitle')}</p>
        </FadeIn>

        {/* ── Filter Bar (mobile-first: 3 rows → 1 row on desktop) ── */}
        <FadeIn delay={0.08}>
          <div className="pub-products-filter-bar">
            {/* Row 1: Search — full width on mobile */}
            <div className="pub-products-filter-bar__row">
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
            </div>

            {/* Row 2: Category chips — horizontal scroll */}
            <div className="pub-products-filter-bar__row pub-products-filter-bar__row--chips">
              <button
                className={`pub-filter-chip${filters.category_id === '' ? ' active' : ''}`}
                onClick={() => setFilter('category_id', '')}
                type="button"
              >
                {t('products.all')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`pub-filter-chip${filters.category_id === cat.id ? ' active' : ''}`}
                  onClick={() => setFilter('category_id', cat.id)}
                  type="button"
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Row 3: Collection chips — only shown when collections exist */}
            {collections.length > 0 && (
              <div className="pub-products-filter-bar__row pub-products-filter-bar__row--chips">
                <button
                  className={`pub-filter-chip${filters.collection_id === '' ? ' active' : ''}`}
                  onClick={() => setFilter('collection_id', '')}
                  type="button"
                >
                  {t('products.all')}
                </button>
                {collections.map((col) => (
                  <button
                    key={col.id}
                    className={`pub-filter-chip${filters.collection_id === col.id ? ' active' : ''}`}
                    onClick={() => setFilter('collection_id', col.id)}
                    type="button"
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}

            {/* Row 4: Controls — sort / price / view toggle */}
            <div className="pub-products-filter-bar__row pub-products-filter-bar__row--controls">
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

              <button
                className={`pub-products-price-btn${showPriceRange ? ' active' : ''}`}
                onClick={() => setShowPriceRange((o) => !o)}
                type="button"
              >
                <Icon name="filter" size={14} />
                {t('products.price')}
              </button>

              <div className="pub-products-view-toggle">
                <button
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => toggleView('grid')}
                  aria-label="Grid view"
                  type="button"
                >
                  <Icon name="grid" size={16} />
                </button>
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => toggleView('list')}
                  aria-label="List view"
                  type="button"
                >
                  <Icon name="list" size={16} />
                </button>
              </div>
            </div>

            {/* Price range — collapsible */}
            {showPriceRange && (
              <div className="pub-products-price-range">
                <input
                  type="number"
                  placeholder="Min AMD"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  onBlur={(e) => setFilter('min_price', e.target.value)}
                />
                <span className="pub-products-price-range__sep">—</span>
                <input
                  type="number"
                  placeholder="Max AMD"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  onBlur={(e) => setFilter('max_price', e.target.value)}
                />
              </div>
            )}

            {/* Results count + reset */}
            {(meta.total > 0 || activeCount > 0) && (
              <div className="pub-products-results">
                <span>
                  {meta.total} {t('products.results_count')}
                </span>
                {activeCount > 0 && (
                  <button
                    className="pub-products-results__reset"
                    onClick={resetFilters}
                    type="button"
                  >
                    × {t('products.reset_filters')}
                  </button>
                )}
              </div>
            )}
          </div>
        </FadeIn>

        {/* ── Product Grid / List ───────────────────────────────── */}
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
              <button
                onClick={resetFilters}
                className="pub-filter-chip active"
                style={{ cursor: 'pointer' }}
                type="button"
              >
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

        {/* ── Pagination ───────────────────────────────────────── */}
        {!fetching && meta.totalPages > 1 && (
          <Pagination
            page={filters.page}
            pages={meta.totalPages}
            onChange={handlePageChange}
          />
        )}
      </section>
    </div>
  )
}
