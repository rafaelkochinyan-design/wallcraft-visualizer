import { useTranslation } from 'react-i18next'
import { usePublicData } from '../../hooks/usePublicData'
import { useLocalized } from '../../hooks/useLocalized'
import { TeamMember, PageContent } from '../../types'
import FadeIn, { StaggerChildren } from '../../components/ui/FadeIn'
import PageMeta from '../../components/ui/PageMeta'

export default function AboutPage() {
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data: team, loading: teamLoading } = usePublicData<TeamMember[]>('/api/team')
  const { data: page, loading: pageLoading } = usePublicData<PageContent>('/api/pages/about')
  const loading = teamLoading || pageLoading

  const values = [
    {
      icon: '👥',
      title: t('about.value_people'),
      desc: page?.content?.people
        ? localize(page.content.people)
        : t('about.value_people_desc'),
    },
    {
      icon: '🌿',
      title: t('about.value_ecology'),
      desc: page?.content?.ecology
        ? localize(page.content.ecology)
        : t('about.value_ecology_desc'),
    },
    {
      icon: '✨',
      title: t('about.value_expression'),
      desc: page?.content?.self_expression
        ? localize(page.content.self_expression)
        : t('about.value_expression_desc'),
    },
    {
      icon: '🎨',
      title: t('about.value_aesthetics'),
      desc: page?.content?.aesthetics
        ? localize(page.content.aesthetics)
        : t('about.value_aesthetics_desc'),
    },
    {
      icon: '🤝',
      title: t('about.value_responsibility'),
      desc: page?.content?.responsibility
        ? localize(page.content.responsibility)
        : t('about.value_responsibility_desc'),
    },
  ]

  if (loading)
    return (
      <div className="pub-section">
        <div className="pub-skeleton" style={{ height: 48, width: '40%', marginBottom: 16 }} />
        <div className="pub-skeleton" style={{ height: 24, width: '60%', marginBottom: 48 }} />
        <div className="pub-grid-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="pub-skeleton" style={{ height: 160, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    )

  return (
    <div>
      <PageMeta title="About" description="Learn about WallCraft — our story, values, and team." url="/about" />
      <div className="pub-section">
        <FadeIn>
          <h1 className="pub-section-title">{t('about.title')}</h1>
          <p className="pub-section-subtitle">{t('about.subtitle')}</p>
        {page?.content?.story && (
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              maxWidth: 720,
              marginBottom: 48,
            }}
          >
            {localize(page.content.story)}
          </p>
        )}
        </FadeIn>
      </div>

      {/* Values */}
      <div style={{ background: 'var(--ui-surface)', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <FadeIn>
            <h2 className="pub-section-title">{t('about.values_title')}</h2>
          </FadeIn>
          <StaggerChildren className="pub-grid-3" style={{ marginTop: 40 }} baseDelay={0.1}>
            {values.map((v, i) => (
              <div key={i} style={{ background: 'var(--ui-bg)', borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{v.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{v.title}</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </div>

      {/* Team */}
      {team && team.length > 0 && (
        <div className="pub-section">
          <FadeIn>
            <h2 className="pub-section-title">{t('about.team_title')}</h2>
          </FadeIn>
          <StaggerChildren className="pub-grid-4" style={{ marginTop: 32 }} baseDelay={0.1}>
            {team.map((m) => (
              <div key={m.id} style={{ textAlign: 'center' }}>
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: 12,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'var(--ui-surface)',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 36,
                    }}
                  >
                    👤
                  </div>
                )}
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{localize(m.role)}</div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      )}
    </div>
  )
}
