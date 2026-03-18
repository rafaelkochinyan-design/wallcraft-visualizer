import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { useVisualizerStore } from '../../store/visualizer'
import WallMesh from './WallMesh'
import SceneLight from './SceneLight'
import AccessoryObject from './AccessoryObject'

export default function Scene() {
  const { wallWidth, wallHeight, step, tooltipMode, isDraggingAccessory } = useVisualizerStore()

  // Camera starts further back, centered on wall height
  const cameraPosition = useMemo(
    () => [0, wallHeight / 2, Math.max(wallWidth, wallHeight) * 1.6] as [number, number, number],
    [wallWidth, wallHeight]
  )

  const orbitTarget = useMemo(
    () => [0, wallHeight / 2, 0] as [number, number, number],
    [wallHeight]
  )

  // Only enable orbit pan/rotation in interactive mode
  const orbitEnabled = step === 'interactive'

  return (
    <Canvas
      shadows
      camera={{ position: cameraPosition, fov: 45, near: 0.01, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#1a1a1a' }}
    >
      {/* Ambient fill light — keeps shadows from being pure black */}
      <ambientLight intensity={0.25} />

      {/* Main controllable directional light */}
      <SceneLight />

      {/* Wall + panels */}
      <Suspense fallback={null}>
        <WallMesh />
      </Suspense>

      {/* Accessories on the wall */}
      <Suspense fallback={null}>
        <AccessoryGroup />
      </Suspense>

      {/* Camera controls */}
      <OrbitControls
        target={orbitTarget}
        enabled={orbitEnabled && !isDraggingAccessory}
        enablePan={tooltipMode === 'settings' && !isDraggingAccessory}
        enableZoom
        enableRotate={orbitEnabled}
        minDistance={0.5}
        maxDistance={Math.max(wallWidth, wallHeight) * 3}
        // Limit vertical rotation: don't go below floor or flip over
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.8}
        makeDefault
      />
    </Canvas>
  )
}

function AccessoryGroup() {
  const { placedAccessories, wallWidth, wallHeight } = useVisualizerStore()

  return (
    <>
      {placedAccessories.map((placed) => (
        <AccessoryObject
          key={placed.uid}
          uid={placed.uid}
          accessory={placed.accessory}
          position={placed.position}
          wallWidth={wallWidth}
          wallHeight={wallHeight}
        />
      ))}
    </>
  )
}
