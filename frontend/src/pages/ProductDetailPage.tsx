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

  useEffect(() => {
    if (!id) return
    api
      .get(`/api/panels/${id}`)
      .then((r) => setPanel(r.data.data))
      .finally(() => setLoading(false))
  }, [id])

  if (loading)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>{t('common.loading')}</div>
  if (!panel)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>Product not found</div>

  return (
    <div className="pub-section">
      <Link
        to="/products"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 14,
          textDecoration: 'none',
          display: 'block',
          marginBottom: 24,
        }}
      >
        ← {t('common.back')}
      </Link>
      <div className="pub-grid-2" style={{ alignItems: 'start', gap: 48 }}>
        {/* Image */}
        <div
          style={{
            borderRadius: 20,
            overflow: 'hidden',
            background: 'var(--ui-surface)',
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {panel.thumb_url || panel.texture_url ? (
            <img
              src={panel.thumb_url || panel.texture_url || ''}
              alt={panel.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: 48 }}>🏛</span>
          )}
        </div>

        {/* Info */}
        <div>
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
            {panel.category?.name}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {panel.name}
          </h1>
          {panel.sku && (
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>SKU: {panel.sku}</p>
          )}

          {panel.price && (
            <div
              style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginBottom: 24 }}
            >
              {panel.price} ֏
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 32,
              fontSize: 14,
              color: 'var(--text-secondary)',
            }}
          >
            <div>
              {t('products.dimensions')}: {panel.width_mm} × {panel.height_mm} × {panel.depth_mm} мм
            </div>
            {panel.weight_kg && (
              <div>
                {t('products.weight')}: {panel.weight_kg} кг
              </div>
            )}
          </div>

          <Link
            to={`/visualizer?p0=${panel.sku || panel.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            ✦ {t('products.try_in_3d')}
          </Link>
        </div>
      </div>
    </div>
  )
}
