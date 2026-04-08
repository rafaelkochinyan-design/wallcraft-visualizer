import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import api from '../../lib/api'
import { usePublicData } from '../../hooks/usePublicData'
import { Partner } from '../../types'
import FadeIn from '../../components/ui/FadeIn'
import PageMeta from '../../components/ui/PageMeta'

export default function PartnersPage() {
  const { t } = useTranslation()
  const { data: partners } = usePublicData<Partner[]>('/api/partners')
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/inquiry', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: `[Partnership] ${form.message}`,
      })
      toast.success(t('contact.success'))
      setForm({ name: '', phone: '', email: '', message: '' })
    } catch {
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageMeta title="Partners" description="Become a WallCraft partner or browse our current partners." url="/partners" />
      <div className="pub-section">
        <FadeIn>
          <h1 className="pub-section-title">{t('partners.title')}</h1>
          <p className="pub-section-subtitle">{t('partners.subtitle')}</p>
          {partners && partners.length > 0 && (
            <div className="pub-partners-strip" style={{ marginTop: 40 }}>
              {partners.map((p) => (
                <a key={p.id} href={p.website || '#'} target="_blank" rel="noreferrer">
                  <img src={p.logo_url} alt={p.name} style={{ height: 48 }} />
                </a>
              ))}
            </div>
          )}
        </FadeIn>
      </div>

      <FadeIn delay={0.1}>
        <div style={{ background: 'var(--ui-surface)', padding: '80px 32px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 className="pub-section-title">{t('partners.become_partner')}</h2>
            <form className="pub-form" style={{ marginTop: 32 }} onSubmit={handleSubmit}>
              <div className="pub-form__group">
                <label className="pub-form__label">{t('contact.form_name')} *</label>
                <input
                  className="pub-form__input"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="pub-form__group">
                <label className="pub-form__label">{t('contact.form_phone')}</label>
                <input
                  className="pub-form__input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="pub-form__group">
                <label className="pub-form__label">{t('contact.form_email')}</label>
                <input
                  className="pub-form__input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="pub-form__group">
                <label className="pub-form__label">{t('contact.form_message')}</label>
                <textarea
                  className="pub-form__textarea"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <button type="submit" className="pub-form__submit" disabled={loading}>
                {loading ? '...' : t('contact.submit')}
              </button>
            </form>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
