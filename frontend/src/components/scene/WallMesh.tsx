import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useVisualizerStore } from '../../store/visualizer'
import MeterGrid from './MeterGrid'
import type { Panel } from '../../types'

const PANEL_SIZE  = 0.5
const PANEL_DEPTH = 0.019
const GEO = new THREE.BoxGeometry(PANEL_SIZE, PANEL_SIZE, PANEL_DEPTH)

// ── Simple reliable panel tiling — no normal maps, just works ──
function PanelTiling({ wallWidth, wallHeight, panels, isPreview }: {
  wallWidth:  number
  wallHeight: number
  panels:     (Panel | null)[]
  isPreview?: boolean
}) {
  const urlA = panels[0]?.texture_url ?? '/textures/consul_a.jpg'
  const urlB = panels[1]?.texture_url ?? urlA

  const [texA, setTexA] = useState<THREE.Texture | null>(null)
  const [texB, setTexB] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(urlA, (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(1, 1)
      t.needsUpdate = true
      setTexA(t)
    })
  }, [urlA])

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(urlB, (t) => {
      t.colorSpace = THREE.SRGBColorSpace
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.rotation = Math.PI
      t.center.set(0.5, 0.5)
      t.needsUpdate = true
      setTexB(t)
    })
  }, [urlB])

  const cols        = Math.ceil(wallWidth / PANEL_SIZE)
  const rows        = Math.ceil(wallHeight / PANEL_SIZE)
  const count       = cols * rows
  const hasTwoSlots = !!panels[1]

  const refA = useRef<THREE.InstancedMesh>(null)
  const refB = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    const m    = new THREE.Matrix4()
    const posA: [number, number, number][] = []
    const posB: [number, number, number][] = []

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = -wallWidth / 2 + PANEL_SIZE / 2 + col * PANEL_SIZE
        const y = PANEL_SIZE / 2 + row * PANEL_SIZE
        if (hasTwoSlots && (row + col) % 2 === 1) {
          posB.push([x, y, 0])
        } else {
          posA.push([x, y, 0])
        }
      }
    }

    if (refA.current) {
      posA.forEach((p, i) => { m.setPosition(...p); refA.current!.setMatrixAt(i, m) })
      refA.current.count = posA.length
      refA.current.instanceMatrix.needsUpdate = true
    }
    if (refB.current) {
      posB.forEach((p, i) => { m.setPosition(...p); refB.current!.setMatrixAt(i, m) })
      refB.current.count = posB.length
      refB.current.instanceMatrix.needsUpdate = true
    }
  }, [cols, rows, wallWidth, wallHeight, hasTwoSlots])

  const matA = useMemo(() => new THREE.MeshStandardMaterial({
    map: texA ?? undefined, color: '#ffffff',
    roughness: 0.88, metalness: 0,
    transparent: !!isPreview, opacity: isPreview ? 0.7 : 1,
  }), [texA, isPreview])

  const matB = useMemo(() => new THREE.MeshStandardMaterial({
    map: texB ?? undefined, color: '#ffffff',
    roughness: 0.88, metalness: 0,
    transparent: !!isPreview, opacity: isPreview ? 0.7 : 1,
  }), [texB, isPreview])

  if (!texA) return null

  return (
    <>
      <instancedMesh ref={refA} args={[GEO, matA, count]} castShadow receiveShadow />
      {hasTwoSlots && texB && (
        <instancedMesh ref={refB} args={[GEO, matB, count]} castShadow receiveShadow />
      )}
    </>
  )
}

// ── Main WallMesh ──────────────────────────────────────────────
export default function WallMesh() {
  const {
    wallWidth, wallHeight, wallColor,
    selectedPanels, hoverPanelId, availablePanels,
  } = useVisualizerStore()

  const hoverPanel   = hoverPanelId ? (availablePanels.find(p => p.id === hoverPanelId) ?? null) : null
  const displayPanels = hoverPanel ? [hoverPanel, selectedPanels[1]] : selectedPanels
  const hasPanels    = displayPanels.some(p => p !== null)

  const { animColor } = useSpring({ animColor: wallColor, config: { tension: 110, friction: 22 } })

  return (
    <group>
      {/* Background wall plane — color controlled by wallColor */}
      {/* @ts-ignore */}
      <animated.mesh position={[0, wallHeight / 2, -PANEL_DEPTH - 0.002]} receiveShadow>
        <planeGeometry args={[wallWidth, wallHeight]} />
        {/* @ts-ignore */}
        <animated.meshStandardMaterial color={animColor} roughness={0.9} metalness={0} />
      </animated.mesh>

      {/* Panel tiling */}
      {hasPanels && (
        <PanelTiling
          wallWidth={wallWidth}
          wallHeight={wallHeight}
          panels={displayPanels}
          isPreview={!!hoverPanel}
        />
      )}

      <MeterGrid wallWidth={wallWidth} wallHeight={wallHeight} />
      <WallEdges wallWidth={wallWidth} wallHeight={wallHeight} />

      {!hasPanels && (
        <Html
          position={[0, wallHeight / 2, 0.005]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          zIndexRange={[0, 0]}
        >
          <img
            src="/wallcraft_logo_dark.png"
            alt=""
            style={{ width: `${Math.min(wallWidth * 120, 320)}px`, opacity: 0.08 }}
          />
        </Html>
      )}
    </group>
  )
}

function WallEdges({ wallWidth, wallHeight }: { wallWidth: number; wallHeight: number }) {
  const T   = 0.012
  const D   = PANEL_DEPTH + 0.01
  const mat = <meshStandardMaterial color="#b8b4ac" roughness={0.7} metalness={0} />
  return (
    <group>
      <mesh position={[0, -T/2, 0.001]}><boxGeometry args={[wallWidth+T*2, T, D]}/>{mat}</mesh>
      <mesh position={[0, wallHeight+T/2, 0.001]}><boxGeometry args={[wallWidth+T*2, T, D]}/>{mat}</mesh>
      <mesh position={[-wallWidth/2-T/2, wallHeight/2, 0.001]}><boxGeometry args={[T, wallHeight, D]}/>{mat}</mesh>
      <mesh position={[wallWidth/2+T/2, wallHeight/2, 0.001]}><boxGeometry args={[T, wallHeight, D]}/>{mat}</mesh>
    </group>
  )
}
