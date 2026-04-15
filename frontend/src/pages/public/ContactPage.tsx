import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import api from '../../lib/api'
import { useTenant } from '../../hooks/useTenant'
import FadeIn from '../../components/ui/FadeIn'
import PageMeta from '../../components/ui/PageMeta'
import { Icon } from '../../components/ui/Icon'

export default function ContactPage() {
  const { t } = useTranslation()
  const { tenant } = useTenant()

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
        {(phone || whatsappNum) && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 32, marginBottom: 8 }}>
            {phone && (
              <a
                href={`tel:${phone}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 8,
                  background: 'var(--accent)', color: '#fff',
                  fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                }}
              >
                <Icon name="phone" size={18} />
                {phone}
              </a>
            )}
            {whatsappNum && (
              <a
                href={`https://wa.me/${whatsappNum}`}
                target="_blank"
                rel="noreferrer"
                className="pub-footer__whatsapp"
                style={{ display: 'inline-flex' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('contact.whatsapp')}
              </a>
            )}
          </div>
        )}
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
              <div className="pub-contact-info__icon"><Icon name="phone" size={20} /></div>
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
              <div className="pub-contact-info__icon"><Icon name="email" size={20} /></div>
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
              <div className="pub-contact-info__icon"><Icon name="location" size={20} /></div>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t('contact.whatsapp')}
            </a>
          )}
        </div>
      </div>
      </FadeIn>
    </div>
  )
}
