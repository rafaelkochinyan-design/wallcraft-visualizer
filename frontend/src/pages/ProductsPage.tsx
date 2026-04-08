import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVisualizerStore } from '../store/visualizer'
import { useTenant } from '../hooks/useTenant'
import ProductCard from '../components/ui/ProductCard'
import FadeIn, { StaggerChildren } from '../components/ui/FadeIn'
import PageMeta from '../components/ui/PageMeta'

export default function ProductsPage() {
  const { t } = useTranslation()
  const { availablePanels } = useVisualizerStore()
  const { loading } = useTenant()
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState<string>(
    () => searchParams.get('category') || 'all'
  )

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
      <PageMeta
        title="Products"
        description="Browse our full collection of handcrafted 3D gypsum wall panels."
        url="/products"
      />
      <section className="pub-section">
        <FadeIn>
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
        </FadeIn>

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
          <StaggerChildren className="pub-product-grid" baseDelay={0.05}>
            {filtered.map((panel) => (
              <ProductCard key={panel.id} panel={panel} />
            ))}
          </StaggerChildren>
        )}
      </section>
    </div>
  )
}
