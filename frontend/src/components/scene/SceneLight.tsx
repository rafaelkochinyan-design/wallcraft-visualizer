/**
 * SceneLight.tsx — освещение оптимизированное для гипсовых рельефных панелей
 *
 * ПРИНЦИП: Гипс нужно освещать как скульптуру — сильный направленный свет
 * под углом 30-60° выявляет все рёбра рельефа. Именно так фотографируют
 * декоративные панели в каталогах — свет сбоку под углом.
 *
 * ИЗМЕНЕНИЯ vs предыдущей версии:
 * 1. Основной directional light сильнее (1.8 → 2.4)
 * 2. Добавлен fill light с противоположной стороны (для мягких теней)
 * 3. Угол по умолчанию подобран для максимальной выразительности рельефа
 * 4. Правильный castShadow с настроенной тенью
 */

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useVisualizerStore } from '../../store/visualizer'

export default function SceneLight() {
  const { wallWidth, wallHeight, lightAngle, lightElevation } = useVisualizerStore()

  const mainRef = useRef<THREE.DirectionalLight>(null)
  const fillRef = useRef<THREE.DirectionalLight>(null)

  // Конвертируем углы в позицию источника света
  const lightPos = useMemo(() => {
    const azRad  = (lightAngle    * Math.PI) / 180
    const elRad  = (lightElevation * Math.PI) / 180
    const dist   = Math.max(wallWidth, wallHeight) * 2.5

    return new THREE.Vector3(
      dist * Math.cos(elRad) * Math.sin(azRad),
      dist * Math.sin(elRad),
      dist * Math.cos(elRad) * Math.cos(azRad) + dist * 0.3
    )
  }, [lightAngle, lightElevation, wallWidth, wallHeight])

  // Fill light — с противоположной стороны, слабее
  const fillPos = useMemo(() => new THREE.Vector3(
    -lightPos.x * 0.5,
     lightPos.y * 0.6,
     lightPos.z * 0.8,
  ), [lightPos])

  // Target для обоих источников — центр стены
  const target = useMemo(() =>
    new THREE.Vector3(0, wallHeight / 2, 0),
  [wallHeight])

  useFrame(() => {
    if (mainRef.current) {
      mainRef.current.position.copy(lightPos)
      mainRef.current.target.position.copy(target)
      mainRef.current.target.updateMatrixWorld()
    }
    if (fillRef.current) {
      fillRef.current.position.copy(fillPos)
      fillRef.current.target.position.copy(target)
      fillRef.current.target.updateMatrixWorld()
    }
  })

  return (
    <>
      {/* Основной свет — выявляет рельеф */}
      <directionalLight
        ref={mainRef}
        position={lightPos.toArray()}
        intensity={2.2}       // Сильнее чем раньше (было 1.8)
        color="#fff8f0"        // Тёплый белый (как дневной свет из окна)
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* Fill light — смягчает тени, делает рельеф читаемым */}
      <directionalLight
        ref={fillRef}
        position={fillPos.toArray()}
        intensity={0.55}      // Слабее основного в 4x
        color="#e8f0ff"        // Чуть холоднее (как отражение от потолка/стены)
        castShadow={false}    // Без теней — только заполнение
      />

      {/* Rim light снизу — лёгкий контровой для объёма */}
      <pointLight
        position={[0, -0.5, 2.5]}
        intensity={0.12}
        color="#fff0e0"
        decay={2}
        distance={6}
      />
    </>
  )
}
