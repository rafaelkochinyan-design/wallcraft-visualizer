import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../../hooks/usePublicData'
import { useLocalized } from '../../hooks/useLocalized'
import FadeIn, { StaggerChildren } from '../../components/ui/FadeIn'
import { Designer } from '../../types'

export default function DesignerDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data: designer, loading } = usePublicData<Designer>(`/api/designers/${slug}`)

  if (loading)
    return <div style={{ padding: '80px 32px', textAlign: 'center' }}>{t('common.loading')}</div>
  if (!designer)
    return (
      <div className="pub-section" style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>👤</p>
        <h2 className="pub-section-title">{t('not_found.title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>{t('not_found.designer')}</p>
        <Link to="/designers" className="pub-filter-chip active" style={{ textDecoration: 'none' }}>
          ← {t('designers.title')}
        </Link>
      </div>
    )

  return (
    <div className="pub-section">
      <FadeIn direction="up" delay={0}>
        <Link
          to="/designers"
          style={{
            color: 'var(--text-secondary)',
            fontSize: 14,
            textDecoration: 'none',
            display: 'block',
            marginBottom: 32,
          }}
        >
          ← {t('common.back')}
        </Link>
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'flex-start',
            marginBottom: 48,
            flexWrap: 'wrap',
          }}
        >
          {designer.photo_url && (
            <img
              src={designer.photo_url}
              alt={designer.name}
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          )}
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{designer.name}</h1>
            {designer.specialty && (
              <p style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: 16 }}>
                {designer.specialty}
              </p>
            )}
            {designer.bio && (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600 }}>
                {localize(designer.bio)}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {designer.instagram && (
                <a
                  href={`https://instagram.com/${designer.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  Instagram
                </a>
              )}
              {designer.website && (
                <a
                  href={designer.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
      {designer.portfolio.length > 0 && (
        <StaggerChildren className="pub-masonry" baseDelay={0.05}>
          {designer.portfolio.map((url, i) => (
            <div key={i} className="pub-masonry__item">
              <img src={url} alt="" loading="lazy" />
            </div>
          ))}
        </StaggerChildren>
      )}
    </div>
  )
}
