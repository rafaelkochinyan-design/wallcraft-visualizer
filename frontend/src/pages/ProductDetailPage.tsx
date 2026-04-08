import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import { Panel } from '../types'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [panel, setPanel] = useState<Panel | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)

  useEffect(() => {
    if (!id) return
    api
      .get(`/api/panels/${id}`)
      .then((r) => {
        setPanel(r.data.data)
        setActiveImg(0)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>{t('common.loading')}</div>
  if (!panel)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>Product not found</div>

  // Build image list: gallery images first, then fall back to thumb/texture
  const galleryImages: string[] = [
    ...(panel.images || []).map((img) => img.url),
    ...(panel.thumb_url ? [panel.thumb_url] : []),
    ...(panel.texture_url && panel.texture_url !== panel.thumb_url ? [panel.texture_url] : []),
  ].filter(Boolean)

  const mainImage = galleryImages[activeImg] || null

  // Calculate area from dimensions
  const areaM2 =
    panel.width_mm && panel.height_mm
      ? ((panel.width_mm * panel.height_mm) / 1_000_000).toFixed(4)
      : null

  // Format price with thousands separator
  const priceFormatted = panel.price
    ? Math.round(panel.price).toLocaleString('ru-RU')
    : null

  const prevImage = () => setActiveImg((i) => (i - 1 + galleryImages.length) % galleryImages.length)
  const nextImage = () => setActiveImg((i) => (i + 1) % galleryImages.length)

  return (
    <div className="pub-section pub-detail-page-wrap">
      <Link
        to="/products"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 14,
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 32,
        }}
      >
        ← {t('common.back')}
      </Link>

      <div className="pub-detail-grid">
        {/* ── Gallery ─────────────────────────────────────── */}
        <div>
          {/* Main image */}
          <div className="pub-detail-img-wrap">
            {mainImage ? (
              <img
                src={mainImage}
                alt={panel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: 64 }}>🏛</span>
            )}

            {/* Prev / Next arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {galleryImages.length > 1 && (
            <div className="pub-detail-thumbs">
              {galleryImages.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(idx)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 10,
                    overflow: 'hidden',
                    padding: 0,
                    border: `2px solid ${activeImg === idx ? 'var(--accent)' : 'var(--ui-border)'}`,
                    cursor: 'pointer',
                    flexShrink: 0,
                    background: 'var(--ui-surface)',
                  }}
                >
                  <img
                    src={url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
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
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--accent)',
                marginBottom: 8,
              }}
            >
              {panel.category.name}
            </div>
          )}

          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {panel.name}
          </h1>

          {panel.sku && (
            <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 14 }}>
              {t('products.sku')}: {panel.sku}
            </p>
          )}

          {/* Price */}
          {priceFormatted && (
            <div
              style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 28 }}
            >
              {priceFormatted} {t('products.price_per_m2')}
            </div>
          )}

          {/* Specs table */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              marginBottom: 28,
              border: '1px solid var(--ui-border)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {[
              {
                label: t('products.dimensions'),
                value:
                  panel.width_mm && panel.height_mm && panel.depth_mm
                    ? `${panel.width_mm} × ${panel.height_mm} × ${panel.depth_mm} mm`
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
            ]
              .filter((row) => row.value)
              .map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--ui-border)' : 'none',
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
                </div>
              ))}
          </div>

          {/* Description */}
          {panel.description && (
            <div className={`pub-detail-desc${descExpanded ? ' pub-detail-desc--expanded' : ''}`}>
              <p
                style={{
                  fontSize: 15,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: 8,
                }}
              >
                {panel.description}
              </p>
              <button
                className="pub-detail-desc__toggle"
                onClick={() => setDescExpanded((v) => !v)}
              >
                {descExpanded ? t('common.show_less') : t('common.read_more')}
              </button>
            </div>
          )}

          {/* Download buttons — desktop */}
          <div className="pub-detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {panel.model_url && (
              <a
                href={panel.model_url}
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '13px 24px',
                  background: 'var(--text-primary)',
                  color: 'var(--ui-bg)',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
              >
                ↓ {t('products.download_3d')}
              </a>
            )}
            {panel.catalog_url && (
              <a
                href={panel.catalog_url}
                download
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '13px 24px',
                  background: 'var(--ui-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--ui-border)',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
              >
                ↓ {t('products.download_catalog')}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky CTA bar (mobile only) ─────────────────── */}
      {(panel.model_url || panel.catalog_url) && (
        <div className="pub-detail-sticky-cta">
          {panel.model_url && (
            <a
              href={panel.model_url}
              download
              className="pub-detail-sticky-cta__btn pub-detail-sticky-cta__btn--primary"
            >
              ↓ {t('products.download_3d')}
            </a>
          )}
          {panel.catalog_url && (
            <a
              href={panel.catalog_url}
              download
              target="_blank"
              rel="noreferrer"
              className="pub-detail-sticky-cta__btn pub-detail-sticky-cta__btn--secondary"
            >
              ↓ {t('products.download_catalog')}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
