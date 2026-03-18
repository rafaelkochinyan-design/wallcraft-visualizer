import { useVisualizerStore } from '../../store/visualizer'
import { Panel } from '../../types'

export default function PanelSelectStep() {
  const {
    availablePanels,
    selectedPanels,
    togglePanelSelect,
    setStep,
    tenant,
  } = useVisualizerStore()

  const primaryColor = tenant?.primary_color ?? '#1a1a1a'
  const canProceed = selectedPanels.length >= 1

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 pointer-events-none">
      <div className="pointer-events-auto rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white text-sm font-medium">Выберите панели</h3>
            <p className="text-white/40 text-xs mt-0.5">До 2 вариантов</p>
          </div>
          <span className="text-white/50 text-xs">
            {selectedPanels.length}/2 выбрано
          </span>
        </div>

        {/* Panel cards — horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
          {availablePanels.map((panel) => (
            <PanelCard
              key={panel.id}
              panel={panel}
              isSelected={selectedPanels.some((p) => p.id === panel.id)}
              isDisabled={selectedPanels.length === 2 && !selectedPanels.some((p) => p.id === panel.id)}
              onToggle={() => togglePanelSelect(panel)}
              primaryColor={primaryColor}
            />
          ))}

          {availablePanels.length === 0 && (
            <p className="text-white/40 text-sm py-4">Нет доступных панелей</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setStep('size')}
            className="px-4 py-2.5 rounded-xl text-white/60 text-sm hover:text-white/90 transition-colors"
          >
            ← Назад
          </button>
          <button
            onClick={() => { if (canProceed) setStep('interactive') }}
            disabled={!canProceed}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{
              backgroundColor: canProceed ? primaryColor : undefined,
              color: canProceed ? '#fff' : undefined,
              border: canProceed ? 'none' : '1px solid rgba(255,255,255,0.2)',
            }}
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  )
}

interface PanelCardProps {
  panel: Panel
  isSelected: boolean
  isDisabled: boolean
  onToggle: () => void
  primaryColor: string
}

function PanelCard({ panel, isSelected, isDisabled, onToggle, primaryColor }: PanelCardProps) {
  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={`flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-150
        ${isSelected ? 'bg-white/10' : 'bg-white/5 hover:bg-white/8'}
        ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
      style={{
        border: isSelected ? `2px solid ${primaryColor}` : '2px solid transparent',
        minWidth: '100px',
      }}
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
        <img
          src={panel.thumb_url}
          alt={panel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback: gray placeholder
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      <span className="text-white/80 text-xs text-center leading-tight">{panel.name}</span>
      {panel.price && (
        <span className="text-white/40 text-xs">{panel.price.toLocaleString()} ₽</span>
      )}
    </button>
  )
}
