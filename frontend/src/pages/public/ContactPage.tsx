import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useVisualizerStore } from '../../store/visualizer'
import { useTenant } from '../../hooks/useTenant'
import FadeIn from '../../components/ui/FadeIn'
import PageMeta from '../../components/ui/PageMeta'

export default function ContactPage() {
  const { t } = useTranslation()
  const { tenant } = useVisualizerStore()
  useTenant()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)

  const phone = tenant?.phone || ''
  const email = tenant?.email || ''
  const address = tenant?.address || ''
  const whatsappNum = phone.replace(/\D/g, '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/inquiry', {
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
      })
      toast.success(t('contact.success'))
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pub-section">
      <PageMeta title="Contact" description="Get in touch with WallCraft — we'd love to hear from you." url="/contact" />
      <FadeIn>
        <h1 className="pub-section-title">{t('contact.title')}</h1>
        <p className="pub-section-subtitle">{t('contact.subtitle')}</p>
      </FadeIn>
      <FadeIn delay={0.1}>
      <div className="pub-grid-2" style={{ alignItems: 'start', gap: 64, marginTop: 48 }}>
        {/* Form */}
        <form className="pub-form" onSubmit={handleSubmit}>
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

        {/* Info */}
        <div className="pub-contact-info">
          {phone && (
            <div className="pub-contact-info__item">
              <div className="pub-contact-info__icon">📞</div>
              <div>
                <div className="pub-contact-info__label">{t('contact.phone')}</div>
                <div className="pub-contact-info__value">
                  <a href={`tel:${phone}`}>{phone}</a>
                </div>
              </div>
            </div>
          )}
          {email && (
            <div className="pub-contact-info__item">
              <div className="pub-contact-info__icon">✉️</div>
              <div>
                <div className="pub-contact-info__label">{t('contact.email')}</div>
                <div className="pub-contact-info__value">
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              </div>
            </div>
          )}
          {address && (
            <div className="pub-contact-info__item">
              <div className="pub-contact-info__icon">📍</div>
              <div>
                <div className="pub-contact-info__label">{t('contact.address')}</div>
                <div className="pub-contact-info__value">{address}</div>
              </div>
            </div>
          )}
          {whatsappNum && (
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noreferrer"
              className="pub-footer__whatsapp"
              style={{ display: 'inline-flex', marginTop: 16 }}
            >
              💬 {t('contact.whatsapp')}
            </a>
          )}
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
