import { useState } from 'react'
import { useVisualizerStore } from '../../store/visualizer'

export default function WallSizeStep() {
  const { wallWidth, wallHeight, setWallSize, setStep } = useVisualizerStore()

  const [width, setWidth] = useState(wallWidth.toString())
  const [height, setHeight] = useState(wallHeight.toString())
  const [errors, setErrors] = useState<{ width?: string; height?: string }>({})

  function validate(): boolean {
    const errs: typeof errors = {}
    const w = parseFloat(width)
    const h = parseFloat(height)

    if (isNaN(w) || w < 0.5 || w > 10)
      errs.width = 'От 0.5 до 10 м'
    if (isNaN(h) || h < 0.5 || h > 10)
      errs.height = 'От 0.5 до 10 м'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (!validate()) return
    setWallSize(parseFloat(width), parseFloat(height))
    setStep('panel_select')
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="pointer-events-auto bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-80">
        <h2 className="text-xl font-medium text-gray-900 mb-1">Размер стены</h2>
        <p className="text-sm text-gray-500 mb-6">Введите размеры в метрах</p>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Ширина
            </label>
            <div className="relative">
              <input
                type="number"
                value={width}
                onChange={(e) => { setWidth(e.target.value); setErrors({}) }}
                onBlur={validate}
                min="0.5"
                max="10"
                step="0.1"
                className={`w-full px-3 py-2.5 pr-8 rounded-lg border text-gray-900 text-sm
                  focus:outline-none focus:ring-2 focus:ring-black/20
                  ${errors.width ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">м</span>
            </div>
            {errors.width && <p className="text-red-500 text-xs mt-1">{errors.width}</p>}
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Высота
            </label>
            <div className="relative">
              <input
                type="number"
                value={height}
                onChange={(e) => { setHeight(e.target.value); setErrors({}) }}
                onBlur={validate}
                min="0.5"
                max="10"
                step="0.1"
                className={`w-full px-3 py-2.5 pr-8 rounded-lg border text-gray-900 text-sm
                  focus:outline-none focus:ring-2 focus:ring-black/20
                  ${errors.height ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">м</span>
            </div>
            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
          </div>
        </div>

        {/* Preview dimensions */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6 flex justify-between items-center">
          <span className="text-xs text-gray-400">Площадь</span>
          <span className="text-sm font-medium text-gray-700">
            {(parseFloat(width) * parseFloat(height)).toFixed(2)} м²
          </span>
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-medium
            hover:bg-gray-800 active:scale-[0.98] transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Выбрать панели →
        </button>
      </div>
    </div>
  )
}
