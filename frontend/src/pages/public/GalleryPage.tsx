import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../../hooks/usePublicData'
import { GalleryItem } from '../../types'
import FilterChips from '../../components/ui/FilterChips'
import Lightbox, { LightboxItem } from '../../components/ui/Lightbox'
import FadeIn from '../../components/ui/FadeIn'
import PageMeta from '../../components/ui/PageMeta'

const SPACE_TYPES = [
  { key: '', label: 'gallery.filter_all' },
  { key: 'living_room', label: 'gallery.filter_living' },
  { key: 'bedroom', label: 'gallery.filter_bedroom' },
  { key: 'office', label: 'gallery.filter_office' },
  { key: 'hotel', label: 'gallery.filter_hotel' },
  { key: 'restaurant', label: 'gallery.filter_restaurant' },
  { key: 'bathroom', label: 'gallery.filter_bathroom' },
]

export default function GalleryPage() {
  const { t } = useTranslation()
  const [spaceType, setSpaceType] = useState('')
  const [lbIndex, setLbIndex] = useState<number | null>(null)

  const { data: items, loading } = usePublicData<GalleryItem[]>(
    '/api/gallery',
    spaceType ? { space_type: spaceType } : undefined
  )

  const lbItems: LightboxItem[] = (items || []).map((item) => ({
    src: item.image_url,
    caption: item.caption || undefined,
  }))

  const filterOptions = SPACE_TYPES.map((s) => ({ key: s.key, label: t(s.label) }))

  return (
    <div>
      <PageMeta title="Gallery" description="Explore real interiors featuring WallCraft 3D gypsum panels." url="/gallery" />
      <section className="pub-section">
        <FadeIn>
          <h1 className="pub-section-title">{t('gallery.title')}</h1>
          <p className="pub-section-subtitle">{t('gallery.subtitle')}</p>
          <FilterChips options={filterOptions} value={spaceType} onChange={setSpaceType} />
        </FadeIn>

        {loading ? (
          <div className="pub-masonry">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="pub-masonry__item">
                <div className="pub-skeleton" style={{ paddingTop: `${60 + (i % 3) * 25}%` }} />
              </div>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="pub-masonry">
            {items.map((item, idx) => (
              <div key={item.id} className="pub-masonry__item" onClick={() => setLbIndex(idx)}>
                <img
                  src={item.thumb_url || item.image_url}
                  alt={item.caption || ''}
                  loading="lazy"
                />
                <div className="pub-masonry__item-overlay">
                  <span className="pub-masonry__zoom-icon">🔍</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            No gallery images yet.
          </div>
        )}
      </section>

      {lbIndex !== null && (
        <Lightbox
          items={lbItems}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onChange={setLbIndex}
        />
      )}
    </div>
  )
}
