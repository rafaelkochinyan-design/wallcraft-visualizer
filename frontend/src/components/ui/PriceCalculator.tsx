import { useVisualizerStore } from '../../store/visualizer'

export default function PriceCalculator() {
  const { wallWidth, wallHeight, selectedPanels } = useVisualizerStore()

  const nonNullPanels = selectedPanels.filter(p => p !== null)
  if (nonNullPanels.length === 0) return null

  const wallArea = wallWidth * wallHeight

  const lines = nonNullPanels.map((panel, idx) => {
    const panelArea = (panel.width_mm / 1000) * (panel.height_mm / 1000)
    const totalPanels = Math.ceil(wallArea / panelArea)
    const count = nonNullPanels.length === 2
      ? (idx === 0 ? Math.ceil(totalPanels / 2) : Math.floor(totalPanels / 2))
      : totalPanels
    const cost = panel.price ? count * panel.price : null
    return { panel, count, cost }
  })

  const totalCost = lines.every(l => l.cost !== null)
    ? lines.reduce((sum, l) => sum + (l.cost ?? 0), 0)
    : null

  const hasPrices = lines.some(l => l.cost !== null)
  if (!hasPrices) return null

  return (
    <div style={{
      position: 'absolute', bottom: 24, right: 24, zIndex: 20, pointerEvents: 'none',
      background: 'rgba(12,12,12,0.78)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '14px 16px',
      minWidth: 180,
      fontFamily: 'var(--font)',
    }}>
      {/* Wall area */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
        Площадь стены:{' '}
        <span style={{ color: 'rgba(255,255,255,0.7)' }}>{wallArea.toFixed(2)} м²</span>
      </div>

      {/* Per panel breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {lines.map(({ panel, count, cost }) => (
          <div key={panel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {panel.name}
              </span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{count} шт.</span>
              {cost !== null && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  {cost.toLocaleString('ru-RU')} ₽
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {totalCost !== null && nonNullPanels.length === 2 && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          marginTop: 10, paddingTop: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Итого</span>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
            {totalCost.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      )}

      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8, marginBottom: 0 }}>
        * без учёта монтажа
      </p>
    </div>
  )
}
