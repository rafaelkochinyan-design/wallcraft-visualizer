/**
 * Scene.tsx
 * Камера: смотрит на стену немного сверху и спереди.
 * Угол даёт реальную перспективу комнаты — виден пол, потолок, боковые стены.
 */
import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, SoftShadows } from '@react-three/drei'
import { useVisualizerStore } from '../../store/visualizer'
import WallMesh        from './WallMesh'
import SceneLight      from './SceneLight'
import AccessoryObject from './AccessoryObject'
import RoomEnvironment from './RoomEnvironment'
import { SaveSceneWirer } from '../ui/Utils'

export default function Scene() {
  const { wallWidth, wallHeight, step, tooltipMode, placedAccessories } = useVisualizerStore()

  // Камера: стоит напротив стены, чуть выше середины, чуть наискосок
  // Это даёт перспективу — виден пол и потолок
  const camDist = useMemo(() => Math.max(wallWidth, wallHeight) * 1.45, [wallWidth, wallHeight])
  const camPos  = useMemo(
    () => [0, wallHeight * 0.48, camDist] as [number, number, number],
    [wallHeight, camDist]
  )
  const target  = useMemo(
    () => [0, wallHeight * 0.42, 0] as [number, number, number],
    [wallHeight]
  )

  return (
    <Canvas
      shadows="soft"
      camera={{ position: camPos, fov: 46, near: 0.01, far: 120 }}
      gl={{
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        toneMapping: 3,        // ACESFilmic
        toneMappingExposure: 0.88,
      }}
    >
      {/* Цвет фона = цвет потолка комнаты */}
      <color attach="background" args={['#f2efe9']} />

      <ambientLight intensity={0.20} color="#fff5e8" />
      <SoftShadows size={22} samples={14} focus={0.55} />
      <SceneLight />

      <Suspense fallback={null}>
        <RoomEnvironment />
      </Suspense>

      <Suspense fallback={null}>
        <WallMesh />
      </Suspense>

      <Suspense fallback={null}>
        {placedAccessories.map(a => (
          <AccessoryObject
            key={a.uid}
            uid={a.uid}
            accessory={a.accessory}
            position={a.position}
            wallWidth={wallWidth}
            wallHeight={wallHeight}
          />
        ))}
      </Suspense>

      <OrbitControls
        target={target}
        enabled={step === 'interactive'}
        enablePan={tooltipMode === 'settings'}
        enableZoom
        minDistance={0.6}
        maxDistance={camDist * 2.5}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI * 0.68}
        makeDefault
      />

      <SaveSceneWirer />
    </Canvas>
  )
}
