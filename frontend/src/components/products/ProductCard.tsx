import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Panel } from '../../types'

const MotionLink = motion(Link)

interface Props {
  panel: Panel
  index?: number
}

export default function ProductCard({ panel, index = 0 }: Props) {
  const ref = useRef<HTMLAnchorElement & { href: string }>(null)

  // Detect touch-only devices — disable 3D tilt, use tap feedback instead
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  // Mouse position for 3D tilt
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)

  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 })
  const scale = useSpring(1, { stiffness: 300, damping: 30 })
  const liftY = useSpring(0, { stiffness: 300, damping: 30 })

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5)
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseEnter() {
    scale.set(1.03)
    liftY.set(-4)
  }

  function handleMouseLeave() {
    tiltX.set(0)
    tiltY.set(0)
    scale.set(1)
    liftY.set(0)
  }

  return (
    <MotionLink
      ref={ref}
      to={`/products/${panel.id}`}
      className="pub-product-card"
      style={
        isTouch
          ? { '--card-index': index } as unknown as CSSProperties
          : {
              rotateX,
              rotateY,
              scale,
              y: liftY,
              transformPerspective: 800,
              transformStyle: 'preserve-3d',
              '--card-index': index,
            } as unknown as CSSProperties
      }
      // Touch: tap scale feedback. Desktop: 3D tilt via mouse events
      whileTap={isTouch ? { scale: 0.97 } : undefined}
      onMouseMove={isTouch ? undefined : handleMouseMove}
      onMouseEnter={isTouch ? undefined : handleMouseEnter}
      onMouseLeave={isTouch ? undefined : handleMouseLeave}
    >
      <div className="pub-product-card__img">
        {panel.panelImages?.[0]?.url ? (
          <img
            src={panel.panelImages[0].url}
            alt={panel.name}
            loading="lazy"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.opacity = '0'
            }}
          />
        ) : (
          <div style={{
            width: '100%', paddingTop: '100%', background: 'var(--ui-surface)',
            borderRadius: 12, position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', fontSize: 32,
              color: 'var(--text-muted)',
            }}>🏛</span>
          </div>
        )}
        <div className="pub-product-card__overlay" />
      </div>
      <div className="pub-product-card__body">
        {panel.category?.name && (
          <div className="pub-product-card__category">{panel.category.name}</div>
        )}
        <div className="pub-product-card__name">{panel.name}</div>
        {panel.price ? (
          <div className="pub-product-card__footer">
            <span
              className="pub-product-card__price"
              style={{ '--price-delay': index * 50 } as CSSProperties}
            >
              {Math.round(panel.price).toLocaleString('ru-RU')} AMD
            </span>
          </div>
        ) : null}
      </div>
    </MotionLink>
  )
}
