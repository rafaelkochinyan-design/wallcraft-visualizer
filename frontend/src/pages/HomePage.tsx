import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVisualizerStore } from '../store/visualizer'
import { useTenant } from '../hooks/useTenant'
import { usePublicData } from '../hooks/usePublicData'
import { HeroSlide, Partner, Panel } from '../types'
import HeroCarousel from '../components/ui/HeroCarousel'
import ProductCard from '../components/ui/ProductCard'

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'en' | 'ru' | 'am'
  const { availablePanels } = useVisualizerStore()
  const { loading: tenantLoading } = useTenant()

  const { data: slides } = usePublicData<HeroSlide[]>('/api/hero-slides')
  const { data: partners } = usePublicData<Partner[]>('/api/partners')

  // Group panels by category (max 4 per category)
  const panelsByCategory = availablePanels.reduce<
    Record<string, { name: string; panels: Panel[] }>
  >((acc, panel) => {
    const catId = panel.category?.id || 'uncategorized'
    const catName = panel.category?.name || 'Products'
    if (!acc[catId]) acc[catId] = { name: catName, panels: [] }
    if (acc[catId].panels.length < 4) acc[catId].panels.push(panel)
    return acc
  }, {})

  const heroFallback = {
    eyebrow: 'WallCraft — Sculpting Emotions',
    title:
      lang === 'ru'
        ? 'Декоративные стеновые панели для вашего интерьера'
        : lang === 'am'
          ? 'Դեկորատիվ պատի վահանակներ ձեր ինտերիերի համար'
          : 'Decorative Wall Panels for Your Interior',
    subtitle:
      lang === 'ru'
        ? 'Гипсовые 3D панели ручной работы. Уникальный дизайн для каждого пространства.'
        : lang === 'am'
          ? 'Ձեռագործ գիպսե 3D վահանակներ: Յուրահատուկ դիզայն յուրաքանչյուր տարածության համար:'
          : 'Handcrafted gypsum 3D panels. Unique design for every space.',
  }

  return (
    <div>
      {/* ── Hero Carousel ────────────────────────────────────── */}
      <HeroCarousel slides={slides || []} fallback={heroFallback} />

      {/* ── Product Category Sections ─────────────────────── */}
      {Object.entries(panelsByCategory).map(([catId, { name, panels }]) => (
        <section key={catId} className="pub-section">
          <div className="pub-section-header">
            <div>
              <h2 className="pub-section-title">{name}</h2>
              <p className="pub-section-subtitle" style={{ margin: 0 }}>
                {t('products.subtitle')}
              </p>
            </div>
            <Link to="/products" className="pub-view-all">
              {t('home.view_all')} →
            </Link>
          </div>
          <div className="pub-product-grid">
            {panels.map((panel) => (
              <ProductCard key={panel.id} panel={panel} />
            ))}
          </div>
        </section>
      ))}

      {/* Fallback when no panels loaded */}
      {!tenantLoading && availablePanels.length === 0 && (
        <section className="pub-section" style={{ textAlign: 'center', padding: '80px 32px' }}>
          <h2 className="pub-section-title">{t('products.title')}</h2>
          <p className="pub-section-subtitle">{t('products.subtitle')}</p>
          <Link
            to="/products"
            className="pub-hero__cta"
            style={{ display: 'inline-flex', marginTop: 24 }}
          >
            {t('home.view_all')}
          </Link>
        </section>
      )}

      {/* ── 3D Visualizer CTA ────────────────────────────── */}
      <div className="pub-visualizer-cta">
        <div className="pub-visualizer-cta__inner">
          <h2 className="pub-visualizer-cta__title">{t('home.visualizer_title')}</h2>
          <p className="pub-visualizer-cta__subtitle">{t('home.visualizer_subtitle')}</p>
          <Link to="/visualizer" className="pub-visualizer-cta__btn">
            ✦ {t('home.visualizer_cta')}
          </Link>
        </div>
      </div>

      {/* ── Partner Logos ─────────────────────────────────── */}
      {partners && partners.length > 0 && (
        <section className="pub-section" style={{ textAlign: 'center' }}>
          <p className="pub-section-subtitle" style={{ marginBottom: 24 }}>
            {t('home.partners_title')}
          </p>
          <div className="pub-partners-strip" style={{ justifyContent: 'center' }}>
            {partners.map((p) => (
              <a key={p.id} href={p.website || '#'} target="_blank" rel="noreferrer">
                <img src={p.logo_url} alt={p.name} />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Contact CTA ───────────────────────────────────── */}
      <section
        style={{ background: 'var(--ui-surface)', padding: '64px 32px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="pub-section-title">{t('contact.title')}</h2>
          <p className="pub-section-subtitle">{t('contact.subtitle')}</p>
          <Link
            to="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '13px 28px',
              background: 'var(--accent)',
              color: '#fff',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
            }}
          >
            {t('nav.contact')} →
          </Link>
        </div>
      </section>
    </div>
  )
}
