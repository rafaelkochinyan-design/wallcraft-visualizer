import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { useLocalized } from '../hooks/useLocalized'
import { TeamMember, PageContent } from '../types'

export default function AboutPage() {
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data: team } = usePublicData<TeamMember[]>('/api/team')
  const { data: page } = usePublicData<PageContent>('/api/pages/about')

  const values = [
    {
      icon: '👥',
      title: t('common.loading') === 'Loading...' ? 'People' : 'Люди',
      desc: page?.content?.people
        ? localize(page.content.people)
        : 'Individual approach to every client',
    },
    {
      icon: '🌿',
      title: 'Ecology',
      desc: page?.content?.ecology
        ? localize(page.content.ecology)
        : 'Eco-friendly gypsum, no harmful substances',
    },
    {
      icon: '✨',
      title: 'Self-expression',
      desc: page?.content?.self_expression
        ? localize(page.content.self_expression)
        : 'You give an idea, we create it',
    },
    {
      icon: '🎨',
      title: 'Aesthetics',
      desc: page?.content?.aesthetics
        ? localize(page.content.aesthetics)
        : 'We value beauty, quality and innovation',
    },
    {
      icon: '🤝',
      title: 'Responsibility',
      desc: page?.content?.responsibility
        ? localize(page.content.responsibility)
        : 'Every team member cares about client satisfaction',
    },
  ]

  return (
    <div>
      <div className="pub-section">
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
      </div>

      {/* Values */}
      <div style={{ background: 'var(--ui-surface)', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 className="pub-section-title">{t('about.values_title')}</h2>
          <div className="pub-grid-3" style={{ marginTop: 40 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: 'var(--ui-bg)', borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{v.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{v.title}</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      {team && team.length > 0 && (
        <div className="pub-section">
          <h2 className="pub-section-title">{t('about.team_title')}</h2>
          <div className="pub-grid-4" style={{ marginTop: 32 }}>
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
          </div>
        </div>
      )}
    </div>
  )
}
