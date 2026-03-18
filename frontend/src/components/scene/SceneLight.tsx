// SceneLight.tsx
import { useMemo } from 'react'
import { useVisualizerStore } from '../../store/visualizer'

export default function SceneLight() {
  const { lightAngle, lightElevation, wallWidth, wallHeight } = useVisualizerStore()

  const position = useMemo(() => {
    const dist = Math.max(wallWidth, wallHeight) * 2
    const azRad = (lightAngle * Math.PI) / 180
    const elRad = (lightElevation * Math.PI) / 180
    return [
      dist * Math.cos(elRad) * Math.sin(azRad),
      dist * Math.sin(elRad),
      dist * Math.cos(elRad) * Math.cos(azRad) + dist * 0.5, // offset toward camera side
    ] as [number, number, number]
  }, [lightAngle, lightElevation, wallWidth, wallHeight])

  const target = [0, wallHeight / 2, 0] as [number, number, number]

  return (
    <directionalLight
      position={position}
      intensity={1.8}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-near={0.1}
      shadow-camera-far={50}
      shadow-camera-left={-10}
      shadow-camera-right={10}
      shadow-camera-top={10}
      shadow-camera-bottom={-10}
      target-position={target}
    />
  )
}
