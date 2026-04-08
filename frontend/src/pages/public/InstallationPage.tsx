import { useTranslation } from 'react-i18next'
import { usePublicData } from '../../hooks/usePublicData'
import { useLocalized } from '../../hooks/useLocalized'
import { PageContent } from '../../types'
import FadeIn from '../../components/ui/FadeIn'
import PageMeta from '../../components/ui/PageMeta'

interface InstallationStep {
  num: string
  title: { ru: string; en: string; am: string }
  text: { ru: string; en: string; am: string }
}

interface InstallationContent {
  intro: { ru: string; en: string; am: string }
  steps: InstallationStep[]
}

export default function InstallationPage() {
  const { t } = useTranslation()
  const localize = useLocalized()
  const { data: page } = usePublicData<PageContent>('/api/pages/installation')

  const content = page?.content as unknown as InstallationContent | undefined
  const steps: InstallationStep[] = content?.steps ?? []

  return (
    <div className="pub-section" style={{ maxWidth: 800, margin: '0 auto' }}>
      <PageMeta title="Installation" description="Step-by-step guide for installing WallCraft 3D gypsum panels." url="/installation" />
      <FadeIn>
        <h1 className="pub-section-title">{t('installation.title')}</h1>
        <p className="pub-section-subtitle">{t('installation.subtitle')}</p>
        {content?.intro && (
          <p style={{ marginTop: 24, fontSize: 16, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {localize(content.intro)}
          </p>
        )}
      </FadeIn>

      {steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 48 }}>
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 0.07} direction="left">
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {localize(step.title)}
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    {localize(step.text)}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  )
}
