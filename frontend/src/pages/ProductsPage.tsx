import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVisualizerStore } from '../store/visualizer'
import { useTenant } from '../hooks/useTenant'
import { Panel } from '../types'

export default function ProductsPage() {
  const { t } = useTranslation()
  const { availablePanels } = useVisualizerStore()
  const { loading } = useTenant()
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>(() => searchParams.get('category') || 'all')

  // Sync with URL param changes (e.g. clicking category from navbar)
  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) setActiveCategory(cat)
  }, [searchParams])

  const categories = [
    { id: 'all', name: t('products.all') },
    ...Array.from(
      new Map(
        availablePanels.filter((p) => p.category).map((p) => [p.category!.id, p.category!])
      ).values()
    ),
  ]

  const filtered =
    activeCategory === 'all'
      ? availablePanels
      : availablePanels.filter((p) => p.category?.id === activeCategory)

  return (
    <div>
      <section className="pub-section">
        <h1 className="pub-section-title">{t('products.title')}</h1>
        <p className="pub-section-subtitle">{t('products.subtitle')}</p>

        <div className="pub-filter-chips">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`pub-filter-chip${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pub-product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ borderRadius: 16, overflow: 'hidden' }}>
                <div className="pub-skeleton" style={{ paddingTop: '100%' }} />
                <div style={{ padding: 16 }}>
                  <div className="pub-skeleton" style={{ height: 16, marginBottom: 8 }} />
                  <div className="pub-skeleton" style={{ height: 12, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="pub-product-grid">
            {filtered.map((panel) => (
              <Link key={panel.id} to={`/products/${panel.id}`} className="pub-product-card">
                <div className="pub-product-card__img">
                  <img
                    src={panel.thumb_url || panel.texture_url || ''}
                    alt={panel.name}
                    loading="lazy"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.opacity = '0'
                    }}
                  />
                </div>
                <div className="pub-product-card__body">
                  <div className="pub-product-card__name">{panel.name}</div>
                  {panel.sku && <div className="pub-product-card__sku">SKU: {panel.sku}</div>}
                  {panel.price ? (
                    <div className="pub-product-card__footer">
                      <span className="pub-product-card__price">
                        {Math.round(panel.price).toLocaleString('ru-RU')} AMD
                      </span>
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
