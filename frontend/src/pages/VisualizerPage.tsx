import { useTenant }        from '../hooks/useTenant'
import { useVisualizerStore } from '../store/visualizer'
import Scene                  from '../components/scene/Scene'
import WallSizeStep           from '../components/steps/WallSizeStep'
import PanelSelectStep        from '../components/steps/PanelSelectStep'
import { TooltipMain, TooltipSettings } from '../components/ui/Tooltips'
import { TooltipWrapper }     from '../components/ui/TooltipWrapper'
import { PanelCounter, LoadingScreen } from '../components/ui/Utils'

export default function VisualizerPage() {
  const { loading, error } = useTenant()
  const { tenant, step, tooltipMode } = useVisualizerStore()

  if (loading || error) {
    return <LoadingScreen error={error} onRetry={() => window.location.reload()} />
  }

  const progress = step === 'size' ? 33 : step === 'panel_select' ? 66 : 100

  return (
    <div style={{ width:'100vw', height:'100vh', position:'relative', overflow:'hidden' }}>

      {/* ── 3D Canvas full-screen ── */}
      <Scene />

      {/* ── Progress bar ── */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Logo top-center ── */}
      <div style={{
        position:'absolute', top:20, left:'50%', transform:'translateX(-50%)',
        zIndex:'var(--z-overlay)', pointerEvents:'none', userSelect:'none',
      }}>
        {tenant?.logo_url ? (
          <img src={tenant.logo_url} alt={tenant.name}
            style={{ height:32, width:'auto', opacity:0.75, filter:'none' }} />
        ) : (
          <img
            src="/wallcraft_logo_dark.png"
            alt={tenant?.name ?? 'Wallcraft'}
            style={{ height:32, width:'auto', opacity:0.75, filter:'none' }}
          />
        )}
      </div>

      {/* ── Steps ── */}
      {step === 'size'         && <WallSizeStep />}
      {step === 'panel_select' && <PanelSelectStep />}

      {/* ── Tooltip + controls (interactive mode) ── */}
      {step === 'interactive' && (
        <TooltipWrapper>
          {tooltipMode === null       && <TooltipMain />}
          {tooltipMode === 'settings' && <TooltipSettings />}
        </TooltipWrapper>
      )}

      {/* ── Panel counter bottom-right ── */}
      <PanelCounter />
    </div>
  )
}
