import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { ReactNode, CSSProperties } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  distance?: number
  className?: string
  style?: CSSProperties
  once?: boolean
}

export default function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  distance = 24,
  className,
  style,
  once = true,
}: FadeInProps) {
  const { ref, inView } = useInView({ threshold: 0.12, triggerOnce: once })

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionMap[direction] }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}

/** Stagger wrapper — each direct child FadeIn gets increasing delay */
interface StaggerProps {
  children: ReactNode
  stagger?: number
  baseDelay?: number
  direction?: FadeInProps['direction']
  className?: string
  style?: CSSProperties
}

export function StaggerChildren({
  children,
  stagger = 0.08,
  baseDelay = 0,
  direction = 'up',
  className,
  style,
}: StaggerProps) {
  const { ref, inView } = useInView({ threshold: 0.08, triggerOnce: true })

  const directionMap = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  }

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: baseDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, ...directionMap[direction] },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}
