import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../lib/api'
import { Panel, PanelSize } from '../../types'
import { Icon } from '../../components/ui/Icon'
import OrderSheet from '../../components/products/OrderSheet'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const [orderOpen, setOrderOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    setLoading(true)
    setFetchError(false)
    api
      .get(`/api/panels/${id}`, { signal: controller.signal })
      .then((r) => {
        setPanel(r.data.data)
        setActiveImg(0)
      })
      .catch((err) => {
        if (!controller.signal.aborted) setFetchError(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id])

  // useMemo MUST be before any conditional returns (Rules of Hooks)
  const activeSize: PanelSize | null = useMemo(() => {
    if (!panel?.sizes || panel.sizes.length === 0) return null
    return panel.sizes.find((s) => s.id === selectedSizeId) ?? panel.sizes[0]
  }, [panel?.sizes, selectedSizeId])

  if (loading)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>{t('common.loading')}</div>
  if (fetchError)
    return (
      <div className="pub-section" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>⚠️</p>
        <h2 className="pub-section-title">{t('common.error')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{t('not_found.product')}</p>
        <Link to="/products" className="pub-filter-chip active" style={{ textDecoration: 'none' }}>
          ← {t('products.title')}
        </Link>
      </div>
    )
  if (!panel)
    return (
      <div className="pub-section" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🏛</p>
        <h2 className="pub-section-title">{t('not_found.title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{t('not_found.product')}</p>
        <Link to="/products" className="pub-filter-chip active" style={{ textDecoration: 'none' }}>
          ← {t('products.title')}
        </Link>
      </div>
    )

  const hasSizes = panel.sizes && panel.sizes.length > 0

  // Gallery images from PanelImage relation only
  const galleryImages: string[] = (panel.panelImages ?? []).map((img) => img.url).filter(Boolean)

  // Active dimensions — prefer selected size, fall back to panel defaults
  const activeWidth = activeSize ? activeSize.width_mm : panel.width_mm
  const activeHeight = activeSize ? activeSize.height_mm : panel.height_mm
  const activeDepth = activeSize ? activeSize.depth_mm : panel.depth_mm
  const activePrice = activeSize?.price ?? panel.price

  // Calculate area from dimensions
  const itemArea =
    activeWidth && activeHeight
      ? (activeWidth * activeHeight) / 1_000_000
      : null
  const areaM2 = itemArea ? itemArea.toFixed(4) : null

  // Format price with thousands separator
  const priceFormatted = activePrice
    ? Math.round(activePrice).toLocaleString(i18n.language)
    : null

  // Price per item = price (per m²) × item area
  const pricePerItem =
    activePrice && itemArea ? Math.round(activePrice * itemArea) : null

  const specRows = [
    {
      label: t('products.dimensions'),
      value:
        activeWidth && activeHeight && activeDepth
          ? `${activeWidth} × ${activeHeight} × ${activeDepth} mm`
          : null,
    },
    {
      label: t('products.area'),
      value: areaM2 ? `${t('products.item_area')} – ${areaM2} m²` : null,
    },
    {
      label: t('products.depth_relief'),
      value: panel.depth_relief_mm ? `${panel.depth_relief_mm} mm` : null,
    },
    {
      label: t('products.material'),
      value: panel.material || null,
    },
    {
      label: t('products.weight'),
      value: panel.weight_kg ? `${panel.weight_kg} kg` : null,
    },
  ].filter((row) => row.value)

  const prevImage = () => setActiveImg((i) => (i - 1 + galleryImages.length) % galleryImages.length)
  const nextImage = () => setActiveImg((i) => (i + 1) % galleryImages.length)

  return (
    <div className="pub-section pub-detail-page-wrap">
      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <nav className="pub-breadcrumb" aria-label="breadcrumb">
        <Link to="/">{t('nav.home')}</Link>
        <span className="pub-breadcrumb__sep">/</span>
        <Link to="/products">{t('products.title')}</Link>
        <span className="pub-breadcrumb__sep">/</span>
        <span className="pub-breadcrumb__current">{panel.name}</span>
      </nav>

      <Link
        to="/products"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 14,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 32,
        }}
      >
        <Icon name="chevron-left" size={16} />
        {t('common.back')}
      </Link>

      <div className="pub-detail-grid">
        {/* ── Gallery ─────────────────────────────────────── */}
        <div>
          <div className="pub-detail-img-wrap">
            {galleryImages.length > 0 ? (
              galleryImages.map((url, idx) => (
                <img
                  key={url}
                  src={url}
                  alt={idx === activeImg ? panel.name : ''}
                  className={`pub-gallery-img${idx === activeImg ? ' active' : ''}`}
                />
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: 64 }}>🏛</span>
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 3,
                  }}
                  aria-label="Previous image"
                >
                  <Icon name="chevron-left" size={18} />
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff',
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 3,
                  }}
                  aria-label="Next image"
                >
                  <Icon name="chevron-right" size={18} />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="pub-detail-thumbs">
              {galleryImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  className={`pub-detail-thumb-btn${activeImg === idx ? ' active' : ''}`}
                  style={{
                    width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                    padding: 0,
                    border: `2px solid ${activeImg === idx ? 'var(--accent)' : 'var(--ui-border)'}`,
                    cursor: 'pointer', flexShrink: 0, background: 'var(--ui-surface)',
                  }}
                  aria-label={`Image ${idx + 1}`}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Info ────────────────────────────────────────── */}
        <div className="pub-detail-info">
          {panel.category?.name && (
            <div
              style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--accent-purple)', marginBottom: 8,
              }}
            >
              {panel.category.name}
            </div>
          )}

          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 24 }}>
            {panel.name}
          </h1>

          {/* Size selector chips */}
          {hasSizes && panel.sizes && panel.sizes.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>
                {t('products.select_size')}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {panel.sizes.map((size) => {
                  const isActive = activeSize?.id === size.id
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSizeId(size.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 8,
                        border: `1.5px solid ${isActive ? 'var(--accent)' : 'var(--ui-border)'}`,
                        background: isActive ? 'var(--accent)' : 'var(--ui-surface)',
                        color: isActive ? '#fff' : 'var(--text-primary)',
                        fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {size.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price — observed for sticky bar */}
          {priceFormatted && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>
                {priceFormatted} {t('products.price_per_m2')}
              </div>
              {pricePerItem && itemArea && (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
                  {t('products.item_price')}: {pricePerItem.toLocaleString(i18n.language)} AMD
                  ({itemArea.toFixed(4)} m² {t('products.per_item')})
                </div>
              )}
            </div>
          )}

          {/* Specs table */}
          <div
            style={{
              display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28,
              border: '1px solid var(--ui-border)', borderRadius: 14, overflow: 'hidden',
            }}
          >
            {specRows.map((row, i) => (
              <div
                key={row.label}
                className="pub-specs-row"
                style={
                  {
                    '--row-index': i,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: i < specRows.length - 1 ? '1px solid var(--ui-border)' : 'none',
                    fontSize: 14,
                  } as React.CSSProperties
                }
              >
                <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          {panel.description && (
            <div className={`pub-detail-desc${descExpanded ? ' pub-detail-desc--expanded' : ''}`}>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                {panel.description}
              </p>
              <button className="pub-detail-desc__toggle" onClick={() => setDescExpanded((v) => !v)}>
                {descExpanded ? t('common.show_less') : t('common.read_more')}
              </button>
            </div>
          )}

          {/* ZIP download button */}
          {panel.zip_url && (
            <a
              href={panel.zip_url}
              download
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '14px 28px', background: 'var(--accent)', color: '#fff',
                borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none',
                width: '100%', marginTop: 16,
              }}
            >
              ↓ {t('products.download_zip')}
            </a>
          )}

          {/* Order Now button */}
          <button
            onClick={() => setOrderOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '14px 28px', background: 'var(--accent)', color: '#fff',
              borderRadius: 12, fontWeight: 700, fontSize: 15, width: '100%',
              border: 'none', cursor: 'pointer', marginTop: 12,
              fontFamily: 'inherit', transition: 'opacity 0.15s',
            }}
          >
            {t('products.order_now')}
          </button>
        </div>
      </div>

      {/* ── Order bottom sheet ──────────────────────────────── */}
      {orderOpen && (
        <OrderSheet
          panel={panel}
          priceFormatted={priceFormatted}
          activePrice={activePrice}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  )
}
