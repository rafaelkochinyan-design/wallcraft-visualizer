import { useVisualizerStore } from '../../store/visualizer'
import { useVisualizerStore as useStore } from '../../store/visualizer'

// ── Tooltip Main ──────────────────────────────────────────────
export function TooltipMain() {
  const { resetAll, setTooltipMode } = useVisualizerStore()

  return (
    <div
      className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-44 pointer-events-auto"
      style={{
        background: 'rgba(12, 12, 12, 0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <button
        onClick={() => setTooltipMode('settings')}
        className="w-full py-2.5 rounded-xl text-white text-sm font-medium text-center
          bg-white/10 hover:bg-white/18 active:scale-[0.97] transition-all duration-150"
      >
        Настроить
      </button>

      <button
        onClick={resetAll}
        className="w-full py-2.5 rounded-xl text-red-400 text-sm font-medium text-center
          hover:bg-red-500/10 active:scale-[0.97] transition-all duration-150"
        style={{ border: '1px solid rgba(239,68,68,0.25)' }}
      >
        Убрать всё
      </button>
    </div>
  )
}

// ── Tooltip Settings ──────────────────────────────────────────
const WALL_COLOR_PRESETS = [
  { label: 'Белый', value: '#f8f8f6' },
  { label: 'Светло-серый', value: '#e0e0dc' },
  { label: 'Бежевый', value: '#ede8df' },
  { label: 'Тёплый серый', value: '#c8c4bc' },
  { label: 'Серый', value: '#9a9a96' },
  { label: 'Тёмный', value: '#3a3a38' },
]

export function TooltipSettings() {
  const {
    settingsTab, setSettingsTab, setTooltipMode,
    lightAngle, setLightAngle,
    lightElevation, setLightElevation,
    wallColor, setWallColor,
    availableAccessoryTypes, availableAccessories,
    placeAccessory, placedAccessories, removeAccessory,
  } = useStore()

  return (
    <div
      className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-64 pointer-events-auto"
      style={{
        background: 'rgba(12, 12, 12, 0.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '16px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
        {(['light', 'position', 'accessories'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSettingsTab(tab)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all duration-150
              ${settingsTab === tab ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'}`}
          >
            {tab === 'light' ? 'Свет' : tab === 'position' ? 'Позиция' : 'Акс.'}
          </button>
        ))}
      </div>

      {/* Tab: Light */}
      {settingsTab === 'light' && (
        <div className="flex flex-col gap-5">
          <SliderControl
            label="Угол света"
            value={lightAngle}
            min={0} max={360}
            onChange={setLightAngle}
            unit="°"
          />
          <SliderControl
            label="Высота"
            value={lightElevation}
            min={5} max={85}
            onChange={setLightElevation}
            unit="°"
          />
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
              Цвет стены
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {WALL_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setWallColor(preset.value)}
                  title={preset.label}
                  className="w-7 h-7 rounded-full border-2 transition-all duration-150 active:scale-90"
                  style={{
                    backgroundColor: preset.value,
                    borderColor: wallColor === preset.value ? '#fff' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
            <input
              type="color"
              value={wallColor}
              onChange={(e) => setWallColor(e.target.value)}
              className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>
      )}

      {/* Tab: Position */}
      {settingsTab === 'position' && (
        <div className="text-white/60 text-xs leading-relaxed space-y-3">
          <p>Для управления камерой:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 rounded px-2 py-1 text-white/80">Перетащить</span>
              <span>— вращение</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 rounded px-2 py-1 text-white/80">Прокрутка</span>
              <span>— зум</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/10 rounded px-2 py-1 text-white/80">ПКМ + тянуть</span>
              <span>— панорама</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Accessories */}
      {settingsTab === 'accessories' && (
        <AccessoriesTab
          types={availableAccessoryTypes}
          accessories={availableAccessories}
          placed={placedAccessories}
          onPlace={placeAccessory}
          onRemove={removeAccessory}
        />
      )}

      {/* Back button */}
      <button
        onClick={() => setTooltipMode(null)}
        className="w-full mt-4 py-2 rounded-xl text-white/40 text-xs hover:text-white/70 transition-colors"
      >
        ← Назад
      </button>
    </div>
  )
}

// ── Slider control ─────────────────────────────────────────────
function SliderControl({
  label, value, min, max, onChange, unit = '',
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  unit?: string
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-white/50 text-xs uppercase tracking-wider">{label}</label>
        <span className="text-white/70 text-xs">{Math.round(value)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-white h-1 cursor-pointer"
      />
    </div>
  )
}

// ── Accessories tab ────────────────────────────────────────────
import { useState } from 'react'
import { AccessoryType, Accessory, PlacedAccessory } from '../../types'

function AccessoriesTab({
  types, accessories, placed, onPlace, onRemove,
}: {
  types: AccessoryType[]
  accessories: Accessory[]
  placed: PlacedAccessory[]
  onPlace: (acc: Accessory) => void
  onRemove: (uid: string) => void
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const filteredAccessories = selectedType
    ? accessories.filter((a) => a.type_id === selectedType)
    : []

  return (
    <div className="flex flex-col gap-3">
      {/* Type grid */}
      <div className="grid grid-cols-3 gap-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
            className={`py-2 px-1 rounded-lg text-xs text-center transition-all duration-150
              ${selectedType === type.id
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'}`}
          >
            {type.label_ru}
          </button>
        ))}
      </div>

      {/* Models for selected type */}
      {selectedType && filteredAccessories.length > 0 && (
        <div className="space-y-1">
          <p className="text-white/30 text-xs">Выберите модель:</p>
          {filteredAccessories.map((acc) => (
            <button
              key={acc.id}
              onClick={() => onPlace(acc)}
              className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5
                hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
            >
              <img
                src={acc.thumb_url}
                alt={acc.name}
                className="w-10 h-10 rounded-md object-cover bg-gray-700 flex-shrink-0"
              />
              <span className="text-white/70 text-xs text-left">{acc.name}</span>
            </button>
          ))}
        </div>
      )}

      {selectedType && filteredAccessories.length === 0 && (
        <p className="text-white/30 text-xs">Нет моделей для этого типа</p>
      )}

      {/* Placed accessories list */}
      {placed.length > 0 && (
        <div className="border-t border-white/10 pt-3 mt-1">
          <p className="text-white/30 text-xs mb-2">На стене ({placed.length}):</p>
          <div className="space-y-1">
            {placed.map((item) => (
              <div
                key={item.uid}
                className="flex items-center justify-between gap-2 py-1.5 px-2
                  rounded-lg bg-white/5"
              >
                <span className="text-white/60 text-xs truncate">{item.accessory.name}</span>
                <button
                  onClick={() => onRemove(item.uid)}
                  className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0
                    text-xs px-1.5 py-0.5 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
