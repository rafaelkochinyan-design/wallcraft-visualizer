import { useVisualizerStore } from '../../store/visualizer'

export default function PriceCalculator() {
  const { wallWidth, wallHeight, selectedPanels } = useVisualizerStore()

  if (selectedPanels.length === 0) return null

  const wallArea = wallWidth * wallHeight

  // Calculate per panel type
  const lines = selectedPanels.map((panel, idx) => {
    const panelArea = (panel.width_mm / 1000) * (panel.height_mm / 1000)
    const totalPanels = Math.ceil(wallArea / panelArea)

    // If 2 panels selected — split roughly in half (checkerboard ~50/50)
    const count = selectedPanels.length === 2
      ? (idx === 0 ? Math.ceil(totalPanels / 2) : Math.floor(totalPanels / 2))
      : totalPanels

    const cost = panel.price ? count * panel.price : null

    return { panel, count, cost }
  })

  const totalCost = lines.every((l) => l.cost !== null)
    ? lines.reduce((sum, l) => sum + (l.cost ?? 0), 0)
    : null

  const hasPrices = lines.some((l) => l.cost !== null)
  if (!hasPrices) return null

  return (
    <div
      className="absolute bottom-6 right-6 z-20 pointer-events-none"
      style={{
        background: 'rgba(12, 12, 12, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '14px 16px',
        minWidth: '180px',
      }}
    >
      {/* Wall area */}
      <div className="text-white/40 text-xs mb-3">
        Площадь стены: <span className="text-white/70">{wallArea.toFixed(2)} м²</span>
      </div>

      {/* Per panel breakdown */}
      <div className="space-y-2">
        {lines.map(({ panel, count, cost }) => (
          <div key={panel.id} className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: panel.thumb_url ? undefined : '#888' }}
              />
              <span className="text-white/60 text-xs truncate">{panel.name}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-white/50 text-xs">{count} шт.</span>
              {cost !== null && (
                <div className="text-white/80 text-xs font-medium">
                  {cost.toLocaleString('ru-RU')} ₽
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {totalCost !== null && selectedPanels.length === 2 && (
        <div className="border-t border-white/10 mt-3 pt-3 flex justify-between items-center">
          <span className="text-white/40 text-xs">Итого</span>
          <span className="text-white text-sm font-semibold">
            {totalCost.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      )}

      <p className="text-white/20 text-[10px] mt-2">* без учёта монтажа</p>
    </div>
  )
}
