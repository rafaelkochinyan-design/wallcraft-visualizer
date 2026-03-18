import { useRef, useState, useCallback, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useVisualizerStore } from '../../store/visualizer'
import { Accessory } from '../../types'

interface AccessoryObjectProps {
  uid: string
  accessory: Accessory
  position: [number, number, number]
  wallWidth: number
  wallHeight: number
}

// Invisible plane for raycasting — at Z=0 (wall surface)
const WALL_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

export default function AccessoryObject({
  uid,
  accessory,
  position,
  wallWidth,
  wallHeight,
}: AccessoryObjectProps) {
  const { scene } = useGLTF(accessory.model_url)
  const { camera, raycaster, pointer } = useThree()
  const { moveAccessory } = useVisualizerStore()

  const groupRef = useRef<THREE.Group>(null)
  const [dragging, setDragging] = useState(false)

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    // Make all meshes cast and receive shadows
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }, [scene])

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setDragging(true)
    ;(e.target as Element | null)?.setPointerCapture?.(e.pointerId)
  }, [])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!dragging) return
      e.stopPropagation()

      raycaster.setFromCamera(pointer, camera)
      const point = new THREE.Vector3()
      raycaster.ray.intersectPlane(WALL_PLANE, point)

      if (point) {
        // Clamp to wall bounds
        const halfW = wallWidth / 2
        const clampedX = Math.max(-halfW, Math.min(halfW, point.x))
        const clampedY = Math.max(0, Math.min(wallHeight, point.y))
        moveAccessory(uid, [clampedX, clampedY, 0.025])
      }
    },
    [dragging, raycaster, pointer, camera, wallWidth, wallHeight, uid, moveAccessory]
  )

  return (
    <group
      ref={groupRef}
      position={position}
      scale={accessory.scale}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

// Preload when component is imported
// Individual preloads are called in the UI when user opens accessories tab
export function preloadAccessoryModel(url: string) {
  useGLTF.preload(url)
}
