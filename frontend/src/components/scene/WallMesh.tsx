/**
 * WallMesh.tsx
 *
 * Panel tiling with 3D GLB models.
 *
 * Root issues fixed:
 * 1. Models in XZ plane (thin Y) → rotate -90° around X to face camera
 * 2. Models in XY plane (thin Z) → no rotation needed
 * 3. Models not at origin → center using bounding box
 * 4. Scale computed from actual face dimensions after rotation
 */

import { useRef, useEffect, useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Clone, useGLTF, useTexture } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useVisualizerStore } from '../../store/visualizer'
import type { Panel } from '../../types'
import MeterGrid from './MeterGrid'

const PANEL_W = 0.5   // grid cell width (m)
const PANEL_H = 0.5   // grid cell height (m)
const PANEL_D = 0.019 // nominal depth for background plane offset

export default function WallMesh() {
  const { wallWidth, wallHeight, wallColor, selectedPanels, step } = useVisualizerStore()
  const hasPanels = step !== 'size' && selectedPanels.length > 0

  const { animColor } = useSpring({
    animColor: wallColor,
    config: { tension: 110, friction: 22 },
  })

  return (
    <group>
      {/* Background wall plane — only this changes color */}
      {/* @ts-ignore */}
      <animated.mesh position={[0, wallHeight / 2, -PANEL_D / 2 - 0.001]} receiveShadow>
        <planeGeometry args={[wallWidth, wallHeight]} />
        {/* @ts-ignore */}
        <animated.meshStandardMaterial color={animColor} roughness={0.90} metalness={0} />
      </animated.mesh>

      {hasPanels && (
        <Suspense fallback={null}>
          <PanelTiling wallWidth={wallWidth} wallHeight={wallHeight} panels={selectedPanels} />
        </Suspense>
      )}

      {step !== 'interactive' && (
        <MeterGrid wallWidth={wallWidth} wallHeight={wallHeight} />
      )}

      <WallEdges wallWidth={wallWidth} wallHeight={wallHeight} />
    </group>
  )
}

/* ═══════════════════════════════════════════════════════ */
interface TilingProps {
  wallWidth: number
  wallHeight: number
  panels: Panel[]
}

function PanelTiling({ wallWidth, wallHeight, panels }: TilingProps) {
  if (panels[0]?.model_url) {
    return <PanelModelTiling wallWidth={wallWidth} wallHeight={wallHeight} panels={panels} />
  }
  return <PanelTextureTiling wallWidth={wallWidth} wallHeight={wallHeight} panels={panels} />
}

/* ── 3D GLB tiling ─────────────────────────────────────── */

interface ModelTransform {
  rotation: [number, number, number]
  scale: number
  offset: [number, number, number]  // centering offset in model's local space
}

/**
 * Compute rotation, scale, and centering offset for a GLB scene.
 *
 * 3D software (3ds Max, SketchUp) exports panels in two orientations:
 *   - Thin Y (lying flat in XZ) → rotate -PI/2 around X to face camera
 *   - Thin Z (already XY, facing camera) → no rotation
 *
 * targetW/H = real-world panel size in meters (from DB width_mm/height_mm)
 */
function computeModelTransform(
  scene: THREE.Group,
  targetW: number,
  targetH: number
): ModelTransform {
  const box = new THREE.Box3().setFromObject(scene)
  const center = new THREE.Vector3()
  box.getCenter(center)
  const size = new THREE.Vector3()
  box.getSize(size)

  const sX = size.x, sY = size.y, sZ = size.z

  let rotation: [number, number, number]
  let faceW: number
  let faceH: number

  if (sY <= sX && sY <= sZ) {
    // Flat in XZ (thin Y) — lying like floor tile → stand it up toward camera
    rotation = [-Math.PI / 2, 0, 0]
    faceW = sX
    faceH = sZ
  } else if (sZ <= sX && sZ <= sY) {
    // Already in XY plane (thin Z) — faces camera directly
    rotation = [0, 0, 0]
    faceW = sX
    faceH = sY
  } else {
    // Thin X → rotate around Y axis
    rotation = [0, Math.PI / 2, 0]
    faceW = sZ
    faceH = sY
  }

  // Uniform scale to fit within panel cell (no distortion)
  const scale = Math.min(
    targetW / Math.max(faceW, 1),
    targetH / Math.max(faceH, 1)
  )

  return {
    rotation,
    scale,
    offset: [-center.x, -center.y, -center.z],
  }
}

function PanelModelTiling({ wallWidth, wallHeight, panels }: TilingProps) {
  // Always call both hooks (rules of hooks — can't call conditionally)
  const urlA = panels[0]?.model_url ?? ''
  const urlB = panels[1]?.model_url ?? urlA

  const gltfA = useGLTF(urlA)
  const gltfB = useGLTF(urlB)

  const cols = Math.ceil(wallWidth  / PANEL_W)
  const rows = Math.ceil(wallHeight / PANEL_H)

  const targetWA = (panels[0]?.width_mm  ?? 500) / 1000
  const targetHA = (panels[0]?.height_mm ?? 500) / 1000
  const targetWB = (panels[1]?.width_mm  ?? 500) / 1000
  const targetHB = (panels[1]?.height_mm ?? 500) / 1000

  // Compute transform for each panel model (once per scene load)
  const trA = useMemo(
    () => computeModelTransform(gltfA.scene, targetWA, targetHA),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gltfA.scene]
  )
  const trB = useMemo(
    () => computeModelTransform(gltfB.scene, targetWB, targetHB),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gltfB.scene]
  )

  // Panel positions in chess pattern
  const { posA, posB } = useMemo(() => {
    const posA: [number, number, number][] = []
    const posB: [number, number, number][] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -wallWidth / 2 + PANEL_W / 2 + col * PANEL_W
        const y = PANEL_H / 2 + row * PANEL_H
        if (panels.length === 2 && (row + col) % 2 === 1) {
          posB.push([x, y, 0])
        } else {
          posA.push([x, y, 0])
        }
      }
    }
    return { posA, posB }
  }, [cols, rows, wallWidth, wallHeight, panels.length])

  return (
    <>
      {posA.map((p, i) => (
        <group key={`a-${i}`} position={p}>
          {/* 1. rotate to face camera, 2. scale to fit cell */}
          <group rotation={trA.rotation} scale={trA.scale}>
            {/* 3. center the model at origin */}
            <Clone object={gltfA.scene} position={trA.offset} castShadow receiveShadow />
          </group>
        </group>
      ))}

      {panels.length === 2 && posB.map((p, i) => (
        <group key={`b-${i}`} position={p}>
          <group rotation={trB.rotation} scale={trB.scale}>
            <Clone object={gltfB.scene} position={trB.offset} castShadow receiveShadow />
          </group>
        </group>
      ))}
    </>
  )
}

/* ── Legacy texture tiling (fallback when no model_url) ── */
const panelGeo = new THREE.BoxGeometry(PANEL_W, PANEL_H, PANEL_D)

function PanelTextureTiling({ wallWidth, wallHeight, panels }: TilingProps) {
  const textureUrlA = panels[0]?.texture_url ?? '/textures/consul_a.jpg'
  const textureUrlB = panels[1]?.texture_url ?? textureUrlA

  const texA = useTexture(textureUrlA)
  const texB = useTexture(textureUrlB)

  useEffect(() => {
    ;[texA, texB].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(1, 1)
      t.needsUpdate = true
    })
  }, [texA, texB])

  const texBRot = useMemo(() => {
    const t = texB.clone()
    t.rotation = Math.PI
    t.center.set(0.5, 0.5)
    t.needsUpdate = true
    return t
  }, [texB])

  const cols  = Math.ceil(wallWidth  / PANEL_W)
  const rows  = Math.ceil(wallHeight / PANEL_H)
  const count = cols * rows

  const refA = useRef<THREE.InstancedMesh>(null)
  const refB = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const matrix = new THREE.Matrix4()
    const posA: [number, number, number][] = []
    const posB: [number, number, number][] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -wallWidth / 2 + PANEL_W / 2 + col * PANEL_W
        const y = PANEL_H / 2 + row * PANEL_H
        if (panels.length === 2 && (row + col) % 2 === 1) posB.push([x, y, 0])
        else posA.push([x, y, 0])
      }
    }
    if (refA.current) {
      posA.forEach((p, i) => { matrix.setPosition(...p); refA.current!.setMatrixAt(i, matrix) })
      refA.current.count = posA.length
      refA.current.instanceMatrix.needsUpdate = true
    }
    if (refB.current) {
      posB.forEach((p, i) => { matrix.setPosition(...p); refB.current!.setMatrixAt(i, matrix) })
      refB.current.count = posB.length
      refB.current.instanceMatrix.needsUpdate = true
    }
  }, [cols, rows, wallWidth, wallHeight, panels.length])

  const matA = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texA, color: '#ffffff', roughness: 0.80, metalness: 0 }),
    [texA]
  )
  const matB = useMemo(
    () => new THREE.MeshStandardMaterial({ map: texBRot, color: '#ffffff', roughness: 0.80, metalness: 0 }),
    [texBRot]
  )

  return (
    <>
      <instancedMesh ref={refA} args={[panelGeo, matA, count]} castShadow receiveShadow />
      {panels.length === 2 && (
        <instancedMesh ref={refB} args={[panelGeo, matB, count]} castShadow receiveShadow />
      )}
    </>
  )
}

/* ── Wall border edges ───────────────────────────────────── */
function WallEdges({ wallWidth, wallHeight }: { wallWidth: number; wallHeight: number }) {
  const T = 0.014
  const color = '#b8b4ac'
  const mats = <meshStandardMaterial color={color} roughness={0.6} />
  return (
    <group>
      <mesh position={[0, -T / 2, 0.001]}><boxGeometry args={[wallWidth + T * 2, T, PANEL_D + 0.01]} />{mats}</mesh>
      <mesh position={[0, wallHeight + T / 2, 0.001]}><boxGeometry args={[wallWidth + T * 2, T, PANEL_D + 0.01]} />{mats}</mesh>
      <mesh position={[-wallWidth / 2 - T / 2, wallHeight / 2, 0.001]}><boxGeometry args={[T, wallHeight, PANEL_D + 0.01]} />{mats}</mesh>
      <mesh position={[wallWidth / 2 + T / 2, wallHeight / 2, 0.001]}><boxGeometry args={[T, wallHeight, PANEL_D + 0.01]} />{mats}</mesh>
    </group>
  )
}
