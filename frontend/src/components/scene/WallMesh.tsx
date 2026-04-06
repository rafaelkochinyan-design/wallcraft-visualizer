import { useRef, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useVisualizerStore } from '../../store/visualizer'
import MeterGrid from './MeterGrid'
import type { Panel } from '../../types'

const PANEL_SIZE = 0.5
const PANEL_DEPTH = 0.019
const GEO = new THREE.BoxGeometry(PANEL_SIZE, PANEL_SIZE, PANEL_DEPTH)

// ── Simple reliable panel tiling ──
function PanelTiling({
  wallWidth,
  wallHeight,
  panels,
  isPreview,
}: {
  wallWidth: number
  wallHeight: number
  panels: (Panel | null)[]
  isPreview?: boolean
}) {
  const urlA = panels[0]?.texture_url ?? '/textures/consul_a.jpg'
  const urlB = panels[1]?.texture_url ?? urlA

  const [texA, setTexA] = useState<THREE.Texture | null>(null)
  const [texB, setTexB] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    setTexA(null)
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
    setTexB(null)
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

  const cols = Math.ceil(wallWidth / PANEL_SIZE)
  const rows = Math.ceil(wallHeight / PANEL_SIZE)
  const hasTwoSlots = !!panels[1]

  // Pre-compute positions so we know exact counts before InstancedMesh is created
  const { posA, posB } = useMemo(() => {
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
    return { posA, posB }
  }, [cols, rows, wallWidth, wallHeight, hasTwoSlots])

  const countA = posA.length
  const countB = posB.length

  const refA = useRef<THREE.InstancedMesh>(null)
  const refB = useRef<THREE.InstancedMesh>(null)

  // Set matrices after mount — texA in deps ensures mesh is mounted
  useEffect(() => {
    if (!refA.current || !texA) return
    const m = new THREE.Matrix4()
    posA.forEach((p, i) => {
      m.setPosition(...p)
      refA.current!.setMatrixAt(i, m)
    })
    refA.current.count = countA
    refA.current.instanceMatrix.needsUpdate = true
  }, [posA, countA, texA])

  useEffect(() => {
    if (!refB.current || !texB) return
    const m = new THREE.Matrix4()
    posB.forEach((p, i) => {
      m.setPosition(...p)
      refB.current!.setMatrixAt(i, m)
    })
    refB.current.count = countB
    refB.current.instanceMatrix.needsUpdate = true
  }, [posB, countB, texB])

  const matA = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texA ?? undefined,
        color: '#ffffff',
        roughness: 0.88,
        metalness: 0,
        transparent: !!isPreview,
        opacity: isPreview ? 0.7 : 1,
      }),
    [texA, isPreview]
  )

  const matB = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texB ?? undefined,
        color: '#ffffff',
        roughness: 0.88,
        metalness: 0,
        transparent: !!isPreview,
        opacity: isPreview ? 0.7 : 1,
      }),
    [texB, isPreview]
  )

  if (!texA) return null

  return (
    <>
      {/* key forces full remount when grid or panel changes — InstancedMesh args are NOT reactive */}
      <instancedMesh
        key={`A-${cols}-${rows}-${hasTwoSlots}-${urlA}`}
        ref={refA}
        args={[GEO, matA, countA]}
        castShadow
        receiveShadow
      />
      {hasTwoSlots && texB && (
        <instancedMesh
          key={`B-${cols}-${rows}-${urlB}`}
          ref={refB}
          args={[GEO, matB, countB]}
          castShadow
          receiveShadow
        />
      )}
    </>
  )
}

// ── Main WallMesh ──────────────────────────────────────────────
export default function WallMesh() {
  const { wallWidth, wallHeight, wallColor, selectedPanels, hoverPanelId, availablePanels } =
    useVisualizerStore()

  const hoverPanel = hoverPanelId
    ? (availablePanels.find((p) => p.id === hoverPanelId) ?? null)
    : null
  const displayPanels = hoverPanel ? [hoverPanel, selectedPanels[1]] : selectedPanels
  const hasPanels = displayPanels.some((p) => p !== null)

  const { animColor } = useSpring({ animColor: wallColor, config: { tension: 110, friction: 22 } })

  return (
    <group>
      {/* Background wall plane */}
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
  const T = 0.012
  const D = PANEL_DEPTH + 0.01
  const mat = <meshStandardMaterial color="#b8b4ac" roughness={0.7} metalness={0} />
  return (
    <group>
      <mesh position={[0, -T / 2, 0.001]}>
        <boxGeometry args={[wallWidth + T * 2, T, D]} />
        {mat}
      </mesh>
      <mesh position={[0, wallHeight + T / 2, 0.001]}>
        <boxGeometry args={[wallWidth + T * 2, T, D]} />
        {mat}
      </mesh>
      <mesh position={[-wallWidth / 2 - T / 2, wallHeight / 2, 0.001]}>
        <boxGeometry args={[T, wallHeight, D]} />
        {mat}
      </mesh>
      <mesh position={[wallWidth / 2 + T / 2, wallHeight / 2, 0.001]}>
        <boxGeometry args={[T, wallHeight, D]} />
        {mat}
      </mesh>
    </group>
  )
}
