/**
 * TooltipWrapper.tsx
 *
 * ФИКС позиции: тултип остаётся там где его оставили.
 * Проблема была: setTooltipPosition сохранял {x, y} но при следующем рендере
 * useSpring инициализировался заново с initY=-1 → прыгал на середину.
 *
 * Решение:
 * 1. useSpring инициализируется ОДИН РАЗ (пустой deps [])
 * 2. Позиция из store применяется через api.set() только при монтировании
 * 3. После drag setTooltipPosition сохраняет реальные px координаты (y > 0)
 * 4. Snap to edge — притягивается к ближайшему краю, но НЕ сбрасывает на середину
 *
 * НЕТ backdrop-filter — ломает transparent bg при CSS transform.
 * Фон: solid var(--ui-bg)
 */

import { useRef, useCallback, useEffect, ReactNode, useState } from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import { useVisualizerStore } from '../../store/visualizer'

interface Props {
  children: ReactNode
}

const PAD = 16
const SNAP_DIST = 90

export function TooltipWrapper({ children }: Props) {
  const { tooltipCollapsed, setTooltipCollapsed, tooltipPosition, setTooltipPosition } =
    useVisualizerStore()

  const wrapRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const origin = useRef({ px: 0, py: 0, ex: 0, ey: 0 })

  /* ── Считаем стартовую позицию ОДИН РАЗ ──────────────── */
  const startX = tooltipPosition.x
  const startY =
    tooltipPosition.y < 0
      ? typeof window !== 'undefined'
        ? Math.round(window.innerHeight / 2 - 200)
        : 200
      : tooltipPosition.y

  const [{ x, y }, api] = useSpring(() => ({
    x: startX,
    y: startY,
    config: { tension: 380, friction: 32 },
  }))

  // Только при монтировании синхронизируем с store
  useEffect(() => {
    const sx = tooltipPosition.x
    const sy =
      tooltipPosition.y < 0
        ? Math.round(window.innerHeight / 2 - (wrapRef.current?.offsetHeight ?? 200) / 2)
        : tooltipPosition.y
    api.set({ x: sx, y: sy })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Snap logic ────────────────────────────────────────── */
  const snapPosition = useCallback((cx: number, cy: number) => {
    const el = wrapRef.current
    if (!el) return { x: cx, y: cy }

    const W = window.innerWidth
    const H = window.innerHeight
    const ew = el.offsetWidth
    const eh = el.offsetHeight

    // Clamp внутри экрана
    let nx = Math.max(PAD, Math.min(W - ew - PAD, cx))
    let ny = Math.max(PAD, Math.min(H - eh - PAD, cy))

    // Snap к краю если близко
    const dL = cx
    const dR = W - cx - ew
    const min = Math.min(dL, dR)

    if (min < SNAP_DIST) {
      nx = dL < dR ? PAD : W - ew - PAD
    }

    return { x: nx, y: ny }
  }, [])

  /* ── Drag ──────────────────────────────────────────────── */
  const onDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('button,input,select,a')) return
      e.preventDefault()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      dragging.current = true
      origin.current = {
        px: e.clientX,
        py: e.clientY,
        ex: x.get(),
        ey: y.get(),
      }
    },
    [x, y]
  )

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - origin.current.px
      const dy = e.clientY - origin.current.py
      const el = wrapRef.current
      const ew = el?.offsetWidth ?? 280
      const eh = el?.offsetHeight ?? 400
      const nx = Math.max(PAD, Math.min(window.innerWidth - ew - PAD, origin.current.ex + dx))
      const ny = Math.max(PAD, Math.min(window.innerHeight - eh - PAD, origin.current.ey + dy))
      // Живой drag — тугая пружина
      api.start({ x: nx, y: ny, config: { tension: 900, friction: 38, clamp: false } })
    },
    [api]
  )

  const onUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    // Snap к краю + сохраняем РЕАЛЬНЫЕ координаты (не -1!)
    const { x: fx, y: fy } = snapPosition(x.get(), y.get())
    api.start({ x: fx, y: fy, config: config.gentle })

    // Сохраняем реальные px — y всегда > 0 после drag
    setTooltipPosition({ x: Math.round(fx), y: Math.round(fy) })
  }, [x, y, snapPosition, api, setTooltipPosition])

  /* ── Expand ────────────────────────────────────────────── */
  const expand = useCallback(() => {
    setTooltipCollapsed(false)
    // Проверяем что после разворота тултип влезает на экране
    setTimeout(() => {
      const el = wrapRef.current
      if (!el) return
      const maxY = window.innerHeight - el.offsetHeight - PAD
      const curY = y.get()
      if (curY > maxY) {
        const ny = Math.max(PAD, maxY)
        api.start({ y: ny, config: config.gentle })
        setTooltipPosition({ x: Math.round(x.get()), y: Math.round(ny) })
      }
    }, 80)
  }, [setTooltipCollapsed, y, x, api, setTooltipPosition])

  /* ── Анимации open/close ───────────────────────────────── */
  const panelSpring = useSpring({
    opacity: tooltipCollapsed ? 0 : 1,
    scaleX: tooltipCollapsed ? 0.88 : 1,
    scaleY: tooltipCollapsed ? 0.8 : 1,
    config: { tension: 320, friction: 26 },
  })
  const pillSpring = useSpring({
    opacity: tooltipCollapsed ? 1 : 0,
    scale: tooltipCollapsed ? 1 : 0.75,
    config: { tension: 320, friction: 26 },
  })

  return (
    <animated.div
      ref={wrapRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        x,
        y,
        zIndex: 100,
        willChange: 'transform',
        userSelect: 'none',
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* Развёрнутая панель */}
      <animated.div
        style={{
          ...panelSpring,
          transformOrigin: 'top left',
          overflow: 'hidden',
          borderRadius: 20,
          pointerEvents: tooltipCollapsed ? 'none' : 'auto',
        }}
      >
        <div
          style={{
            background: 'var(--ui-bg)',
            border: '1px solid var(--ui-border)',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.50), 0 4px 16px rgba(0,0,0,0.28)',
            overflow: 'hidden',
            minWidth: 280,
          }}
        >
          <Chrome onCollapse={() => setTooltipCollapsed(true)} />
          <div style={{ pointerEvents: 'auto' }}>{children}</div>
        </div>
      </animated.div>

      {/* Свёрнутая таблетка */}
      <animated.div
        style={{
          ...pillSpring,
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: 'top left',
          pointerEvents: tooltipCollapsed ? 'auto' : 'none',
        }}
      >
        <Pill onExpand={expand} />
      </animated.div>
    </animated.div>
  )
}

/* ── Chrome (drag handle + macOS dots) ──────────────────── */
function Chrome({ onCollapse }: { onCollapse: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px 10px',
        borderBottom: '1px solid var(--ui-surface)',
        cursor: 'grab',
      }}
    >
      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={onCollapse}
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            width: 13,
            height: 13,
            borderRadius: '50%',
            border: 'none',
            background: hov ? 'var(--accent-red)' : 'var(--accent-red)',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.18)',
          }}
          title="Свернуть"
        >
          {hov && (
            <span style={{ fontSize: 9, color: '#6a0000', lineHeight: 1, fontWeight: 900 }}>—</span>
          )}
        </button>
        {['#ffbd2e', '#28ca42'].map((c, i) => (
          <div
            key={i}
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: c,
              opacity: 0.35,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.12)',
            }}
          />
        ))}
      </div>

      {/* Grip dots */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
          flexWrap: 'wrap',
          maxWidth: 48,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ui-elevated)' }}
          />
        ))}
      </div>
      <div style={{ width: 51 }} />
    </div>
  )
}

/* ── Pill ────────────────────────────────────────────────── */
function Pill({ onExpand }: { onExpand: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onExpand}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 18px 11px 14px',
        background: hov ? 'var(--ui-surface)' : 'var(--ui-bg)',
        border: `1px solid ${hov ? 'var(--ui-elevated)' : 'var(--ui-border)'}`,
        borderRadius: 99,
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        transition: 'background 0.13s, border-color 0.13s',
        fontFamily: 'var(--font)',
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect
          x="1"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill="var(--text-primary)"
          fillOpacity=".9"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="6"
          rx="1.5"
          fill="var(--text-primary)"
          fillOpacity=".9"
        />
        <rect
          x="1"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="var(--text-primary)"
          fillOpacity=".9"
        />
        <rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1.5"
          fill="var(--text-primary)"
          fillOpacity=".45"
        />
      </svg>
      <span
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: 0.1 }}
      >
        Настройки
      </span>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: 2 }}>
        <path d="M1 5L5 1L9 5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  )
}
