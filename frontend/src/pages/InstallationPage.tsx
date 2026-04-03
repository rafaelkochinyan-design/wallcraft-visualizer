import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { useLocalized } from '../hooks/useLocalized'
import { PageContent } from '../types'

export default function InstallationPage() {
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data: page } = usePublicData<PageContent>('/api/pages/installation')

  const steps = page?.content
    ? Object.entries(page.content).map(([key, val]) => ({ key, text: localize(val) }))
    : []

  return (
    <div className="pub-section" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1 className="pub-section-title">{t('installation.title')}</h1>
      <p className="pub-section-subtitle">{t('installation.subtitle')}</p>
      {steps.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 48 }}>
          {steps.map((step, i) => (
            <div key={step.key} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)', paddingTop: 10 }}>
                {step.text}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 48, fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <p>Installation guide content coming soon. Contact us for installation support.</p>
        </div>
      )}
    </div>
  )
}
