import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../lib/api'
import { usePublicData } from '../../hooks/usePublicData'
import { useProductFilters } from '../../hooks/useProductFilters'
import { Panel, PanelCategory } from '../../types'
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
  const [priceFrom, setPriceFrom] = useState(filters.min_price)
  const [priceTo, setPriceTo] = useState(filters.max_price)
  const [searchInput, setSearchInput] = useState(filters.q)

  // Search expand state
  const [searchExpanded, setSearchExpanded] = useState(!!filters.q)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Sort dropdown state
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // View toggle: grid | list (persisted)
  const [view, setView] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('wc-product-view') as 'grid' | 'list') || 'grid'
    } catch {
      return 'grid'
    }
  })

  // Results count animation
  const prevCountRef = useRef(meta.total)
  const [countUpdating, setCountUpdating] = useState(false)

  const { data: categoriesRaw } = usePublicData<PanelCategory[]>('/api/panel-categories')
  const categories = categoriesRaw ?? []

  const sortOptions = [
    { value: 'newest', label: t('sort.newest') },
    { value: 'price_asc', label: t('sort.price_asc') },
    { value: 'price_desc', label: t('sort.price_desc') },
    { value: 'name_asc', label: t('sort.name_asc') },
  ]
  const currentSortLabel = sortOptions.find((o) => o.value === filters.sort)?.label ?? sortOptions[0].label

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

  // ── Sync searchInput when filters reset externally ────────────
  useEffect(() => {
    setSearchInput(filters.q)
    if (!filters.q) setSearchExpanded(false)
  }, [filters.q])

  // ── Sync price inputs when filters reset externally ───────────
  useEffect(() => {
    setPriceFrom(filters.min_price)
    setPriceTo(filters.max_price)
  }, [filters.min_price, filters.max_price])

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
    if (filters.sort !== 'newest') params.set('sort', filters.sort)
    if (filters.min_price) params.set('min_price', filters.min_price)
    if (filters.max_price) params.set('max_price', filters.max_price)
    if (filters.page > 1) params.set('page', String(filters.page))

    api
      .get(`/api/panels?${params}`)
      .then((res) => {
        if (cancelled) return
        const body = res.data?.data ?? res.data
        setPanels(body.data ?? [])
        setMeta(body.meta ?? { total: 0, page: 1, limit: 24, totalPages: 1 })
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
  }, [filters.q, filters.category_id, filters.sort, filters.min_price, filters.max_price, filters.page])

  // ── Results count animation ───────────────────────────────────
  useEffect(() => {
    if (meta.total !== prevCountRef.current) {
      setCountUpdating(true)
      const t = setTimeout(() => setCountUpdating(false), 200)
      prevCountRef.current = meta.total
      return () => clearTimeout(t)
    }
  }, [meta.total])

  // ── Close sort on outside click ───────────────────────────────
  useEffect(() => {
    if (!sortOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [sortOpen])

  function handlePageChange(p: number) {
    setFilter('page', p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSearchIconClick() {
    setSearchExpanded(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  function handleSearchBlur() {
    if (!searchInput) setSearchExpanded(false)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setSearchInput('')
      setSearchExpanded(false)
      searchInputRef.current?.blur()
    }
  }

  function toggleView(v: 'grid' | 'list') {
    setView(v)
    try {
      localStorage.setItem('wc-product-view', v)
    } catch {}
  }

  const priceChanged = priceFrom !== filters.min_price || priceTo !== filters.max_price

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

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <FadeIn delay={0.08}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 8 }}>

            {/* Expandable Search */}
            <div className={`pub-search-wrap${searchExpanded ? ' expanded' : ''}`}>
              <button
                className="pub-search-icon-btn"
                onClick={handleSearchIconClick}
                aria-label="Search"
                type="button"
              >
                <Icon name="search" size={18} />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                className="pub-search-wrap__input"
                placeholder={t('products.search_placeholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onBlur={handleSearchBlur}
                onKeyDown={handleSearchKeyDown}
              />
              {searchInput && (
                <button
                  className="pub-search-clear"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  type="button"
                >
                  <Icon name="close" size={14} />
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="pub-filter-chips" style={{ flex: 1, minWidth: 0, margin: 0 }}>
              <button
                className={`pub-filter-chip${filters.category_id === '' ? ' active' : ''}`}
                onClick={() => setFilter('category_id', '')}
              >
                {t('products.all')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`pub-filter-chip${filters.category_id === cat.id ? ' active' : ''}`}
                  onClick={() => setFilter('category_id', cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Sort dropdown + price toggle + view toggle */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>

              {/* Custom sort dropdown */}
              <div ref={sortRef} className="pub-sort-dropdown">
                <button
                  className="pub-sort-trigger"
                  onClick={() => setSortOpen((v) => !v)}
                  type="button"
                >
                  {currentSortLabel}
                  <span className={`pub-sort-trigger__chevron${sortOpen ? ' open' : ''}`}>
                    <Icon name="chevron-down" size={16} />
                  </span>
                </button>
                <div className={`pub-sort-panel${sortOpen ? ' open' : ''}`}>
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className={`pub-sort-option${filters.sort === opt.value ? ' active' : ''}`}
                      onClick={() => {
                        setFilter('sort', opt.value)
                        setSortOpen(false)
                      }}
                      type="button"
                    >
                      {opt.label}
                      {filters.sort === opt.value && (
                        <span className="pub-sort-option__check">
                          <Icon name="check" size={14} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price toggle */}
              <button
                className={`pub-filter-chip${showPriceRange ? ' active' : ''}`}
                onClick={() => setShowPriceRange((v) => !v)}
                style={{ height: 40, gap: 6 }}
                type="button"
              >
                <Icon name="filter" size={14} />
                {t('products.price')}
              </button>

              {/* View toggle */}
              <div className="pub-view-toggle">
                <button
                  className={`pub-view-btn${view === 'grid' ? ' active' : ''}`}
                  onClick={() => toggleView('grid')}
                  aria-label="Grid view"
                  type="button"
                >
                  <Icon name="grid" size={16} />
                </button>
                <button
                  className={`pub-view-btn${view === 'list' ? ' active' : ''}`}
                  onClick={() => toggleView('list')}
                  aria-label="List view"
                  type="button"
                >
                  <Icon name="list" size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Price Range Row ─────────────────────────────────── */}
          {showPriceRange && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <div className="pub-price-input-wrap">
                <input
                  type="number"
                  className="pub-form__input"
                  style={{ width: 160, height: 40, fontSize: 13 }}
                  placeholder={`${t('products.price')} from`}
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                />
                <span className="pub-price-input-wrap__suffix">AMD</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <div className="pub-price-input-wrap">
                <input
                  type="number"
                  className="pub-form__input"
                  style={{ width: 160, height: 40, fontSize: 13 }}
                  placeholder={`${t('products.price')} to`}
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                />
                <span className="pub-price-input-wrap__suffix">AMD</span>
              </div>
              {priceChanged && (
                <button
                  className="pub-filter-chip active"
                  style={{ height: 40 }}
                  onClick={() => {
                    setFilter('min_price', priceFrom)
                    setFilter('max_price', priceTo)
                  }}
                  type="button"
                >
                  Apply
                </button>
              )}
            </div>
          )}

          {/* ── Active Filters Summary ──────────────────────────── */}
          {(activeCount > 0 || !fetching) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, minHeight: 24 }}>
              {!fetching && (
                <span className={`pub-results-count${countUpdating ? ' updating' : ''}`}>
                  {meta.total} {t('products.results_count')}
                </span>
              )}
              {activeCount > 0 && (
                <button
                  onClick={resetFilters}
                  style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                  type="button"
                >
                  <Icon name="reset" size={13} />
                  {t('products.reset_filters')}
                </button>
              )}
            </div>
          )}
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
