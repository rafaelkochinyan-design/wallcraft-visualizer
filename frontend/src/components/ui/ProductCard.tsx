import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Panel } from '../../types'

interface Props {
  panel: Panel
}

export default function ProductCard({ panel }: Props) {
  const { t } = useTranslation()

  return (
    <Link to={`/products/${panel.id}`} className="pub-product-card">
      <div className="pub-product-card__img">
        <img
          src={panel.thumb_url || panel.texture_url || ''}
          alt={panel.name}
          loading="lazy"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.opacity = '0'
          }}
        />
        <span className="pub-product-card__3d-badge">✦ 3D</span>
      </div>
      <div className="pub-product-card__body">
        <div className="pub-product-card__name">{panel.name}</div>
        {panel.sku && <div className="pub-product-card__sku">SKU: {panel.sku}</div>}
        <div className="pub-product-card__footer">
          {panel.price ? (
            <span className="pub-product-card__price">{panel.price} ֏</span>
          ) : (
            <span />
          )}
          <Link
            to={`/visualizer?p0=${panel.sku || panel.id}`}
            className="pub-product-card__try"
            onClick={(e) => e.stopPropagation()}
          >
            {t('products.try_in_3d')}
          </Link>
        </div>
      </div>
    </Link>
  )
}
