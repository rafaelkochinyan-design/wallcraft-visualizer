import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePublicData } from '../hooks/usePublicData'
import { Dealer } from '../types'

export default function DealersPage() {
  const { t } = useTranslation()
  const { data: dealers, loading } = usePublicData<Dealer[]>('/api/dealers')
  const [country, setCountry] = useState('')

  const countries = useMemo(() => {
    if (!dealers) return []
    return Array.from(new Set(dealers.map(d => d.country))).sort()
  }, [dealers])

  const filtered = country ? dealers?.filter(d => d.country === country) : dealers

  return (
    <div className="pub-section">
      <h1 className="pub-section-title">{t('dealers.title')}</h1>
      <p className="pub-section-subtitle">{t('dealers.subtitle')}</p>
      <div className="pub-filter-chips">
        <button className={`pub-filter-chip${country === '' ? ' active' : ''}`} onClick={() => setCountry('')}>
          {t('dealers.all_countries')}
        </button>
        {countries.map(c => (
          <button key={c} className={`pub-filter-chip${country === c ? ' active' : ''}`} onClick={() => setCountry(c)}>{c}</button>
        ))}
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="pub-skeleton" style={{ height: 100, borderRadius: 16 }} />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(dealer => (
            <div key={dealer.id} className="pub-dealer-card">
              {dealer.logo_url ? (
                <img src={dealer.logo_url} alt={dealer.name} className="pub-dealer-card__logo" />
              ) : (
                <div className="pub-dealer-card__logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🏪</div>
              )}
              <div>
                <div className="pub-dealer-card__name">{dealer.name}</div>
                <div className="pub-dealer-card__address">
                  {[dealer.city, dealer.country, dealer.address].filter(Boolean).join(', ')}
                  {dealer.phone && <><br />{dealer.phone}</>}
                </div>
                <div className="pub-dealer-card__links">
                  {dealer.website && <a href={dealer.website} target="_blank" rel="noreferrer" className="pub-dealer-card__link">{t('dealers.visit_website')}</a>}
                  {dealer.map_url && <a href={dealer.map_url} target="_blank" rel="noreferrer" className="pub-dealer-card__link">{t('dealers.get_directions')}</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>No dealers found.</div>
      )}
    </div>
  )
}
