import { Link } from 'react-router-dom'
import { Panel } from '../../types'

interface Props {
  panel: Panel
}

export default function ProductCard({ panel }: Props) {
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
      </div>
      <div className="pub-product-card__body">
        <div className="pub-product-card__name">{panel.name}</div>
        {panel.sku && <div className="pub-product-card__sku">SKU: {panel.sku}</div>}
        {panel.price ? (
          <div className="pub-product-card__footer">
            <span className="pub-product-card__price">
              {Math.round(panel.price).toLocaleString('ru-RU')} AMD
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}
