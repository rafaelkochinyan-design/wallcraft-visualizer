import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { Project } from '../types'

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const { data: project, loading } = usePublicData<Project>(`/api/projects/${slug}`)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (loading)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>{t('common.loading')}</div>
  if (!project)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>Project not found</div>

  const images = project.images || []

  return (
    <div className="pub-section">
      <Link
        to="/projects"
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
      {project.space_type && (
        <div className="pub-card__tag" style={{ marginBottom: 8 }}>
          {project.space_type}
        </div>
      )}
      <h1 className="pub-section-title">{project.title}</h1>
      {project.description && <p className="pub-section-subtitle">{project.description}</p>}

      {images.length > 0 && (
        <div className="pub-masonry" style={{ marginTop: 40 }}>
          {images.map((img, i) => (
            <div key={i} className="pub-masonry__item" onClick={() => setLightboxIdx(i)}>
              <img src={img.url} alt={img.caption || ''} loading="lazy" />
              <div className="pub-masonry__item-overlay">
                <span className="pub-masonry__zoom-icon">🔍</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <div className="pub-lightbox" onClick={() => setLightboxIdx(null)}>
          <button className="pub-lightbox__close" onClick={() => setLightboxIdx(null)}>
            ✕
          </button>
          <button
            className="pub-lightbox__nav pub-lightbox__nav--prev"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : 0))
            }}
          >
            ‹
          </button>
          <img
            src={images[lightboxIdx].url}
            alt=""
            className="pub-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="pub-lightbox__nav pub-lightbox__nav--next"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : 0))
            }}
          >
            ›
          </button>
          {images[lightboxIdx].caption && (
            <p className="pub-lightbox__caption">{images[lightboxIdx].caption}</p>
          )}
        </div>
      )}
    </div>
  )
}
