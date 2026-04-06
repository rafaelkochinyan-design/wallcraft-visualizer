import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { Project } from '../types'

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { data: projects, loading } = usePublicData<Project[]>('/api/projects')

  return (
    <div className="pub-section">
      <h1 className="pub-section-title">{t('projects.title')}</h1>
      <p className="pub-section-subtitle">{t('projects.subtitle')}</p>
      {loading ? (
        <div className="pub-grid-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="pub-card">
              <div className="pub-skeleton" style={{ paddingTop: '75%' }} />
              <div style={{ padding: 20 }}>
                <div className="pub-skeleton" style={{ height: 18, marginBottom: 8 }} />
                <div className="pub-skeleton" style={{ height: 14, width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="pub-grid-3">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.slug}`} style={{ textDecoration: 'none' }}>
              <div className="pub-card">
                {p.cover_url ? (
                  <img src={p.cover_url} alt={p.title} className="pub-card__img" loading="lazy" />
                ) : (
                  <div
                    className="pub-card__img"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <span style={{ color: 'var(--text-muted)', fontSize: 40 }}>🏛</span>
                  </div>
                )}
                <div className="pub-card__body">
                  {p.space_type && <span className="pub-card__tag">{p.space_type}</span>}
                  <div className="pub-card__title">{p.title}</div>
                  {p.description && <p className="pub-card__excerpt">{p.description}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          No projects yet.
        </div>
      )}
    </div>
  )
}
