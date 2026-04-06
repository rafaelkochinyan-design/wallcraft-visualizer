/* ═══════════════════════════════════════════════════════
   Utils — PanelCounter, LoadingScreen, useSaveScene, SaveSceneWirer
   ═══════════════════════════════════════════════════════ */
import { useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useVisualizerStore } from '../../store/visualizer'

export function PanelCounter() {
  const { wallWidth, wallHeight, selectedPanels } = useVisualizerStore()
  if (!selectedPanels.some((p) => p !== null)) return null

  const cols = Math.ceil(wallWidth / 0.5)
  const rows = Math.ceil(wallHeight / 0.5)
  const total = cols * rows
  const price = selectedPanels[0]?.price ?? 0
  const totalPrice = price > 0 ? (total * price).toLocaleString('ru-RU') : null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 'var(--z-tooltip)',
        pointerEvents: 'none',
      }}
    >
      <div className="card-dark anim-fadein" style={{ padding: '14px 18px', minWidth: 190 }}>
        <Row label="Панелей" value={`${total} шт`} />
        <Row label="Площадь" value={`${(wallWidth * wallHeight).toFixed(1)} м²`} />
        {totalPrice && <Row label="~Стоимость" value={`${totalPrice} ₽`} accent />}
      </div>
    </div>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
      }}
    >
      <span
        style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.38)', fontWeight: 600 }}
      >
        {label}
      </span>
      <span
        style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: accent ? '#4ade80' : '#fff' }}
      >
        {value}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   LoadingScreen — брендированный лоадер
   ═══════════════════════════════════════════════════════ */
export function LoadingScreen({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        zIndex: 100,
      }}
    >
      <img
        src="/wallcraft_logo.png"
        alt="Wallcraft"
        style={{ height: 44, width: 'auto', opacity: 0.88, animation: 'fadeIn 0.6s var(--ease)' }}
      />

      {error ? (
        <div style={{ textAlign: 'center' }}>
          <p
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'var(--text-sm)', marginBottom: 16 }}
          >
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 'var(--r-full)',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font)',
              }}
            >
              Повторить
            </button>
          )}
        </div>
      ) : (
        /* Animated ribs — reflects the product */
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.3)',
                animation: `loadBar 1s ease-in-out ${i * 0.12}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   useSaveScene — screenshot из WebGL canvas
   ═══════════════════════════════════════════════════════ */
export function useSaveScene() {
  const { gl, scene, camera } = useThree()

  return useCallback(() => {
    gl.render(scene, camera)
    const url = gl.domElement.toDataURL('image/png', 1.0)
    const a = document.createElement('a')
    a.download = `wallcraft-${Date.now()}.png`
    a.href = url
    a.click()
  }, [gl, scene, camera])
}

/** Mount this inside <Canvas> to wire up the save action */
export function SaveSceneWirer() {
  const { pendingSave, setPendingSave } = useVisualizerStore()
  const save = useSaveScene()

  useEffect(() => {
    if (!pendingSave) return
    save()
    setPendingSave(false)
  }, [pendingSave, save, setPendingSave])

  return null
}
