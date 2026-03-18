import { useState } from 'react'
import { useTenant } from '../hooks/useTenant'
import { useVisualizerStore } from '../store/visualizer'
import Scene from '../components/scene/Scene'
import WallSizeStep from '../components/steps/WallSizeStep'
import PanelSelectStep from '../components/steps/PanelSelectStep'
import { TooltipMain, TooltipSettings } from '../components/ui/Tooltips'
import PriceCalculator from '../components/ui/PriceCalculator'
import InquiryModal from '../components/ui/InquiryModal'

export default function VisualizerPage() {
  const { loading, error } = useTenant()
  const { tenant, step, tooltipMode } = useVisualizerStore()
  const [showInquiry, setShowInquiry] = useState(false)

  if (loading) {
    return (
      <div className="w-screen h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm hover:bg-white/15"
          >
            Обновить
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* 3D Canvas — full screen */}
      <Scene />

      {/* Logo overlay — top left */}
      {tenant?.logo_url && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <img src={tenant.logo_url} alt={tenant.name} className="h-8 object-contain" />
        </div>
      )}
      {!tenant?.logo_url && tenant?.name && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-white/60 text-sm font-medium tracking-widest uppercase">
            {tenant.name}
          </span>
        </div>
      )}

      {/* Step overlays */}
      {step === 'size' && <WallSizeStep />}
      {step === 'panel_select' && <PanelSelectStep />}

      {/* Tooltips — only in interactive mode */}
      {step === 'interactive' && (
        <div className="absolute inset-0 pointer-events-none">
          {tooltipMode === null && <TooltipMain />}
          {tooltipMode === 'settings' && <TooltipSettings />}
          <PriceCalculator />
        </div>
      )}

      {/* Quote button — bottom left, interactive step only */}
      {step === 'interactive' && (
        <div className="absolute bottom-6 left-6 z-20">
          <button
            onClick={() => setShowInquiry(true)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.92)',
              color: '#111',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            Запросить консультацию
          </button>
        </div>
      )}

      {/* Inquiry modal */}
      {showInquiry && <InquiryModal onClose={() => setShowInquiry(false)} />}
    </div>
  )
}
