/**
 * RoomPresets — quick room type preset buttons for TopToolbar.
 */
import { useVisualizerStore } from '../../store/visualizer'

const PRESETS = [
  { key: 'corridor', label: 'Коридор',  icon: '🚪', w: 1.2, h: 2.7 },
  { key: 'living',   label: 'Гостиная', icon: '🛋', w: 4.0, h: 2.7 },
  { key: 'bedroom',  label: 'Спальня',  icon: '🛏', w: 3.5, h: 2.7 },
  { key: 'kitchen',  label: 'Кухня',    icon: '🍳', w: 2.5, h: 2.7 },
] as const

export function RoomPresets({ onApply }: { onApply?: (w: number, h: number) => void }) {
  const { wallWidth, wallHeight, setWallSize } = useVisualizerStore()

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {PRESETS.map(p => {
        const active = Math.abs(wallWidth - p.w) < 0.05 && Math.abs(wallHeight - p.h) < 0.05
        return (
          <button key={p.key}
            onClick={() => { setWallSize(p.w, p.h); onApply?.(p.w, p.h) }}
            title={`${p.label} (${p.w}×${p.h}м)`}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 1, padding: '4px 8px',
              background: active ? 'rgba(10,132,255,0.2)' : 'transparent',
              border: `1px solid ${active ? 'var(--accent)' : 'transparent'}`,
              borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font)', transition: 'all 0.12s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{p.icon}</span>
            <span style={{ fontSize: 9, color: active ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600, lineHeight: 1 }}>
              {p.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
