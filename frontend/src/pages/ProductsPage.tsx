import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import { usePublicData } from '../hooks/usePublicData'
import { useProductFilters } from '../hooks/useProductFilters'
import { Panel, PanelCategory } from '../types'
import ProductCard from '../components/ui/ProductCard'
import Pagination from '../components/ui/Pagination'
import FadeIn, { StaggerChildren } from '../components/ui/FadeIn'
import PageMeta from '../components/ui/PageMeta'

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

  const { data: categoriesRaw } = usePublicData<PanelCategory[]>('/api/panel-categories')
  const categories = categoriesRaw ?? []

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
    if (filters.q)           params.set('q', filters.q)
    if (filters.category_id) params.set('category_id', filters.category_id)
    if (filters.sort !== 'newest') params.set('sort', filters.sort)
    if (filters.min_price)   params.set('min_price', filters.min_price)
    if (filters.max_price)   params.set('max_price', filters.max_price)
    if (filters.page > 1)    params.set('page', String(filters.page))

    api
      .get(`/api/panels?${params}`)
      .then((res) => {
        if (cancelled) return
        const body = res.data?.data ?? res.data
        setPanels(body.data ?? [])
        setMeta(body.meta ?? { total: 0, page: 1, limit: 24, totalPages: 1 })
      })
      .catch(() => {
        if (!cancelled) { setPanels([]); setMeta({ total: 0, page: 1, limit: 24, totalPages: 1 }) }
      })
      .finally(() => {
        if (!cancelled) setFetching(false)
      })

    return () => { cancelled = true }
  }, [filters.q, filters.category_id, filters.sort, filters.min_price, filters.max_price, filters.page])

  function handlePageChange(p: number) {
    setFilter('page', p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

        {/* ── Filter Bar ───────────────────────────────────────── */}
        <FadeIn delay={0.08}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 8 }}>

            {/* Search */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                🔍
              </span>
              <input
                type="text"
                className="pub-form__input"
                style={{ paddingLeft: 36, paddingRight: searchInput ? 36 : 12, width: 240, height: 40, fontSize: 14 }}
                placeholder={t('products.search_placeholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1, padding: 0 }}
                >
                  ×
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

            {/* Sort + Price toggle */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <select
                className="pub-form__input"
                style={{ height: 40, fontSize: 13, padding: '0 12px', width: 'auto', cursor: 'pointer' }}
                value={filters.sort}
                onChange={(e) => setFilter('sort', e.target.value)}
              >
                <option value="newest">{t('sort.newest')}</option>
                <option value="price_asc">{t('sort.price_asc')}</option>
                <option value="price_desc">{t('sort.price_desc')}</option>
                <option value="name_asc">{t('sort.name_asc')}</option>
              </select>

              <button
                className={`pub-filter-chip${showPriceRange ? ' active' : ''}`}
                onClick={() => setShowPriceRange((v) => !v)}
                style={{ height: 40, flexShrink: 0 }}
              >
                💰 {t('products.price')}
              </button>
            </div>
          </div>

          {/* ── Price Range Row ─────────────────────────────────── */}
          {showPriceRange && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <input
                type="number"
                className="pub-form__input"
                style={{ width: 160, height: 40, fontSize: 13 }}
                placeholder={`${t('products.price')} from (AMD)`}
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                onBlur={() => setFilter('min_price', priceFrom)}
              />
              <span style={{ color: 'var(--text-muted)' }}>—</span>
              <input
                type="number"
                className="pub-form__input"
                style={{ width: 160, height: 40, fontSize: 13 }}
                placeholder={`${t('products.price')} to (AMD)`}
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                onBlur={() => setFilter('max_price', priceTo)}
              />
            </div>
          )}

          {/* ── Active Filters Summary ──────────────────────────── */}
          {(activeCount > 0 || !fetching) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, minHeight: 24 }}>
              {!fetching && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {meta.total} {t('products.results_count')}
                </span>
              )}
              {activeCount > 0 && (
                <button
                  onClick={resetFilters}
                  style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >
                  ✕ {t('products.reset_filters')}
                </button>
              )}
            </div>
          )}
        </FadeIn>

        {/* ── Product Grid ─────────────────────────────────────── */}
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ marginBottom: 16 }}>{t('products.no_results')}</p>
            {activeCount > 0 && (
              <button
                onClick={resetFilters}
                className="pub-filter-chip active"
                style={{ cursor: 'pointer' }}
              >
                {t('products.reset_filters')}
              </button>
            )}
          </div>
        ) : (
          <StaggerChildren className="pub-product-grid" baseDelay={0.04}>
            {panels.map((panel) => (
              <ProductCard key={panel.id} panel={panel} />
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
