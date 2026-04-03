/**
 * VisualizerPage.tsx — Single-screen layout (Homestyler-inspired)
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────────┐
 * │  TOP TOOLBAR (logo | wall size inputs | actions)        │
 * ├──────────────┬──────────────────────────────────────────┤
 * │              │                                          │
 * │  LEFT        │         3D SCENE (fullscreen)            │
 * │  SIDEBAR     │                                          │
 * │  (panels /   │    ┌──────────────────────┐              │
 * │  accessories │    │   SETTINGS TOOLTIP   │              │
 * │  / settings) │    │   (draggable)        │              │
 * │              │    └──────────────────────┘              │
 * │              │                                          │
 * └──────────────┴──────────────────────────────────────────┘
 */

import { useEffect } from 'react'
import { useVisualizerStore } from '../store/visualizer'
import { useTenant } from '../hooks/useTenant'
import { useUrlState } from '../hooks/useUrlState'
import Scene              from '../components/scene/Scene'
import LeftSidebar        from '../components/sidebar/LeftSidebar'
import TopToolbar         from '../components/ui/TopToolbar'
import { LoadingScreen }  from '../components/ui/Utils'
import PriceCalculator    from '../components/ui/PriceCalculator'

export default function VisualizerPage() {
  const { loading, error } = useTenant()
  useUrlState()

  useEffect(() => {
    document.body.classList.add('visualizer-mode')
    return () => document.body.classList.remove('visualizer-mode')
  }, [])

  if (loading || error) {
    return <LoadingScreen error={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      background: '#f2efe9',
    }}>
      {/* Top toolbar */}
      <TopToolbar />

      {/* Main area: sidebar + 3D */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Left sidebar */}
        <LeftSidebar />

        {/* 3D scene — fills remaining space */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Scene />

          {/* Price calculator bottom-right */}
          <PriceCalculator />
        </div>
      </div>
    </div>
  )
}
