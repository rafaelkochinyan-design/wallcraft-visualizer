import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Panel } from '../../types'

interface Props {
  panel: Panel
}

export default function ProductCard({ panel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 })
  const scale = useSpring(1, { stiffness: 300, damping: 30 })

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    x.set(nx)
    y.set(ny)
  }

  function handleMouseEnter() {
    scale.set(1.03)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
    scale.set(1)
  }

  return (
    <motion.a
      ref={ref}
      href={`/products/${panel.id}`}
      className="pub-product-card"
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 800,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
    </motion.a>
  )
}
