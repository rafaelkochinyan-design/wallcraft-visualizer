import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVisualizerStore } from '../../store/visualizer'

export default function PublicFooter() {
  const { t } = useTranslation()
  const { tenant } = useVisualizerStore()

  const phone = tenant?.phone || '+374 93 97 97 70'
  const email = tenant?.email || 'info@wallcraft.am'
  const address = tenant?.address || 'Ереван, Армения'
  const whatsappNum = phone.replace(/\D/g, '')

  const productLinks = [
    { to: '/products', label: t('nav.products') },
    { to: '/projects', label: t('nav.projects') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/designers', label: t('nav.designers') },
  ]

  const companyLinks = [
    { to: '/about', label: t('nav.about') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/installation', label: t('installation.title') },
    { to: '/partners', label: t('nav.dealers') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <footer className="pub-footer">
      <div className="pub-footer__grid">
        {/* Brand */}
        <div>
          <div className="pub-footer__brand-name">
            {tenant?.name || 'WallCraft'}
          </div>
          <p className="pub-footer__brand-desc">
            {t('about.subtitle')}
          </p>
          <div className="pub-footer__social">
            <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              💬
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              📸
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              f
            </a>
            <a href="https://behance.net" target="_blank" rel="noreferrer" aria-label="Behance">
              Bē
            </a>
          </div>
        </div>

        {/* Products */}
        <div>
          <div className="pub-footer__col-title">{t('nav.products')}</div>
          <ul className="pub-footer__links">
            {productLinks.map(({ to, label }) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
            <li>
              <Link to="/visualizer">✦ {t('nav.try3d')}</Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <div className="pub-footer__col-title">{t('nav.about')}</div>
          <ul className="pub-footer__links">
            {companyLinks.map(({ to, label }) => (
              <li key={to}><Link to={to}>{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <div className="pub-footer__col-title">{t('nav.contact')}</div>
          <ul className="pub-footer__links">
            <li><a href={`tel:${phone}`}>{phone}</a></li>
            <li><a href={`mailto:${email}`}>{email}</a></li>
            <li><span style={{ color: 'rgba(240,236,230,0.5)' }}>{address}</span></li>
          </ul>
          <div style={{ marginTop: 20 }}>
            <a
              href={`https://wa.me/${whatsappNum}`}
              target="_blank"
              rel="noreferrer"
              className="pub-footer__whatsapp"
            >
              💬 {t('contact.whatsapp')}
            </a>
          </div>
        </div>
      </div>

      <div className="pub-footer__bottom">
        <span>© {new Date().getFullYear()} {tenant?.name || 'WallCraft'}. {t('footer.rights')}.</span>
        <span>{t('footer.made_with')}</span>
      </div>
    </footer>
  )
}
