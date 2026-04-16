import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../../hooks/usePublicData'
import { Project } from '../../types'
import Lightbox, { LightboxItem } from '../../components/ui/Lightbox'
import FadeIn, { StaggerChildren } from '../../components/ui/FadeIn'

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const { data: project, loading } = usePublicData<Project>(`/api/projects/${slug}`)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (loading)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>{t('common.loading')}</div>
  if (!project)
    return (
      <div className="pub-section" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🏗</p>
        <h2 className="pub-section-title">{t('not_found.title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{t('not_found.project')}</p>
        <Link to="/projects" className="pub-filter-chip active" style={{ textDecoration: 'none' }}>
          ← {t('projects.title')}
        </Link>
      </div>
    )

  const images = project.images || []

  const lbItems: LightboxItem[] = images.map((img) => ({
    src: img.url,
    caption: img.caption || undefined,
  }))

  return (
    <div className="pub-section">
      <FadeIn direction="up" delay={0}>
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
      </FadeIn>

      {images.length > 0 && (
        <StaggerChildren className="pub-masonry" baseDelay={0.05} style={{ marginTop: 40 }}>
          {images.map((img, i) => (
            <div key={i} className="pub-masonry__item" onClick={() => setLightboxIdx(i)}>
              <img src={img.url} alt={img.caption || ''} loading="lazy" />
              <div className="pub-masonry__item-overlay">
                <span className="pub-masonry__zoom-icon">🔍</span>
              </div>
            </div>
          ))}
        </StaggerChildren>
      )}

      {lightboxIdx !== null && (
        <Lightbox
          items={lbItems}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onChange={setLightboxIdx}
        />
      )}
    </div>
  )
}
