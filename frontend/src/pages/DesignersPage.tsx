import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { useLocalized } from '../hooks/useLocalized'
import { Designer } from '../types'
import FadeIn, { StaggerChildren } from '../components/ui/FadeIn'
import PageMeta from '../components/ui/PageMeta'

export default function DesignersPage() {
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data: designers, loading } = usePublicData<Designer[]>('/api/designers')

  return (
    <div className="pub-section">
      <PageMeta title="Designers" description="Meet the designers behind WallCraft's beautiful interiors." url="/designers" />
      <FadeIn>
        <h1 className="pub-section-title">{t('designers.title')}</h1>
        <p className="pub-section-subtitle">{t('designers.subtitle')}</p>
      </FadeIn>
      {loading ? (
        <div className="pub-grid-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div
                className="pub-skeleton"
                style={{ width: 120, height: 120, borderRadius: '50%', margin: '0 auto 16px' }}
              />
              <div
                className="pub-skeleton"
                style={{ height: 18, width: '60%', margin: '0 auto 8px' }}
              />
              <div
                className="pub-skeleton"
                style={{ height: 14, width: '40%', margin: '0 auto' }}
              />
            </div>
          ))}
        </div>
      ) : designers && designers.length > 0 ? (
        <StaggerChildren className="pub-grid-3" baseDelay={0.08}>
          {designers.map((d) => (
            <Link
              key={d.id}
              to={`/designers/${d.slug}`}
              style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
            >
              <div style={{ marginBottom: 16 }}>
                {d.photo_url ? (
                  <img
                    src={d.photo_url}
                    alt={d.name}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--ui-border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: 'var(--ui-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      fontSize: 40,
                    }}
                  >
                    👤
                  </div>
                )}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 4,
                  color: 'var(--text-primary)',
                }}
              >
                {d.name}
              </div>
              {d.specialty && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.specialty}</div>
              )}
            </Link>
          ))}
        </StaggerChildren>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          No designers yet.
        </div>
      )}
    </div>
  )
}
