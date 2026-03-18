import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useVisualizerStore } from '../../store/visualizer'
import { Panel } from '../../types'
import MeterGrid from './MeterGrid'

const PANEL_W = 0.5   // meters (500mm)
const PANEL_H = 0.5   // meters (500mm)
const PANEL_D = 0.019 // meters (19mm depth)

// Geometry shared across all instances
const panelGeometry = new THREE.BoxGeometry(PANEL_W, PANEL_H, PANEL_D)

export default function WallMesh() {
  const { wallWidth, wallHeight, wallColor, selectedPanels, step } = useVisualizerStore()

  const hasPanels = step !== 'size' && selectedPanels.length > 0

  return (
    <group>
      {/* Base wall plane — always visible */}
      <mesh position={[0, wallHeight / 2, -PANEL_D / 2]} receiveShadow>
        <planeGeometry args={[wallWidth, wallHeight]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} metalness={0} />
      </mesh>

      {/* Panel tiles — only when panels are selected */}
      {hasPanels && (
        <PanelTiling
          wallWidth={wallWidth}
          wallHeight={wallHeight}
          wallColor={wallColor}
          panels={selectedPanels}
        />
      )}

      {/* Meter grid overlay — always visible */}
      <MeterGrid wallWidth={wallWidth} wallHeight={wallHeight} />
    </group>
  )
}

// ── Panel Tiling ──────────────────────────────────────────────

interface PanelTilingProps {
  wallWidth: number
  wallHeight: number
  wallColor: string
  panels: Panel[]
}

function PanelTiling({ wallWidth, wallHeight, wallColor, panels }: PanelTilingProps) {
  const textureUrl = panels[0]?.texture_url ?? '/textures/consul_a.jpg'
  const texture = useTexture(textureUrl)

  // Clone texture for variant B (rotated 180°)
  const textureB = useMemo(() => {
    const t = texture.clone()
    t.rotation = Math.PI
    t.center.set(0.5, 0.5)  // rotate around center
    t.needsUpdate = true
    return t
  }, [texture])

  // Configure base texture
  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1, 1)
    texture.needsUpdate = true
  }, [texture])

  const cols = Math.ceil(wallWidth / PANEL_W)
  const rows = Math.ceil(wallHeight / PANEL_H)
  const count = cols * rows

  const meshRefA = useRef<THREE.InstancedMesh>(null)
  const meshRefB = useRef<THREE.InstancedMesh>(null)

  // Place instances in a grid
  useEffect(() => {
    if (!meshRefA.current) return

    const matrix = new THREE.Matrix4()
    let i = 0

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -wallWidth / 2 + PANEL_W / 2 + col * PANEL_W
        const y = PANEL_H / 2 + row * PANEL_H
        matrix.setPosition(x, y, 0)

        if (panels.length === 2) {
          // Checkerboard: even = A, odd = B
          const isB = (row + col) % 2 === 1
          if (isB) {
            meshRefB.current?.setMatrixAt(i, matrix)
          } else {
            meshRefA.current.setMatrixAt(i, matrix)
          }
        } else {
          meshRefA.current.setMatrixAt(i, matrix)
        }
        i++
      }
    }

    meshRefA.current.instanceMatrix.needsUpdate = true
    if (meshRefB.current) meshRefB.current.instanceMatrix.needsUpdate = true
  }, [cols, rows, wallWidth, wallHeight, panels.length])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        color: wallColor,
        roughness: 0.85,
        metalness: 0,
      }),
    [texture, wallColor]
  )

  const materialB = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: textureB,
        color: wallColor,
        roughness: 0.85,
        metalness: 0,
      }),
    [textureB, wallColor]
  )

  return (
    <>
      {/* Panel variant A */}
      <instancedMesh
        ref={meshRefA}
        args={[panelGeometry, material, count]}
        castShadow
        receiveShadow
      />

      {/* Panel variant B — only rendered when 2 panels selected */}
      {panels.length === 2 && (
        <instancedMesh
          ref={meshRefB}
          args={[panelGeometry, materialB, count]}
          castShadow
          receiveShadow
        />
      )}
    </>
  )
}
