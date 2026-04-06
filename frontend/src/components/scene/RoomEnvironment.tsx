/**
 * RoomEnvironment.tsx
 * Настоящая комната: пол + потолок + левая + правая + задняя стены.
 * Стена с панелями = задняя стена комнаты (Z=0).
 * Камера смотрит на неё под углом немного сверху.
 *
 * Система координат:
 *   Задняя стена (с панелями): X=[-w/2..w/2], Y=[0..h], Z=0
 *   Пол:     Y=0, тянется от Z=0 до Z=+depth
 *   Потолок: Y=roomH, тянется от Z=0 до Z=+depth
 *   Левая:   X=-roomW/2, тянется по Z и Y
 *   Правая:  X=+roomW/2, тянется по Z и Y
 */

import { useMemo } from 'react'
import * as THREE from 'three'
import { useVisualizerStore } from '../../store/visualizer'

// Комната шире и глубже стены
const EXTRA_W = 2.0 // метров по бокам от стены
const DEPTH = 6.0 // глубина комнаты к камере
const EXTRA_H = 1.0 // метров выше стены до потолка

// Цвета — тёплый нейтральный интерьер
const CLR = {
  floor: '#ccc4b4',
  ceiling: '#f2efe9',
  wallSide: '#ece8e0',
  wallBack: '#e8e4dc', // задняя стена вокруг панельной зоны
  skirting: '#d4d0c8',
  floorLine: '#b8b0a0',
  ceilStrip: '#fff8f0',
}

export default function RoomEnvironment() {
  const { wallWidth, wallHeight } = useVisualizerStore()

  const rW = wallWidth + EXTRA_W * 2 // полная ширина комнаты
  const rH = wallHeight + EXTRA_H // высота комнаты
  const rD = DEPTH

  // Центр пола/потолка по Z
  const midZ = rD / 2

  return (
    <group>
      {/* ── ПОЛ ─────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]} receiveShadow>
        <planeGeometry args={[rW, rD, 20, 20]} />
        <meshStandardMaterial color={CLR.floor} roughness={0.88} metalness={0} />
      </mesh>

      {/* Плиточная сетка на полу */}
      <FloorLines rW={rW} rD={rD} midZ={midZ} />

      {/* ── ПОТОЛОК ─────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, rH, midZ]} receiveShadow>
        <planeGeometry args={[rW, rD]} />
        <meshStandardMaterial color={CLR.ceiling} roughness={0.95} metalness={0} />
      </mesh>

      {/* ── ЛЕВАЯ СТЕНА ─────────────────────────────── */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-rW / 2, rH / 2, midZ]} receiveShadow>
        <planeGeometry args={[rD, rH]} />
        <meshStandardMaterial color={CLR.wallSide} roughness={0.92} metalness={0} />
      </mesh>

      {/* ── ПРАВАЯ СТЕНА ────────────────────────────── */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[rW / 2, rH / 2, midZ]} receiveShadow>
        <planeGeometry args={[rD, rH]} />
        <meshStandardMaterial color={CLR.wallSide} roughness={0.92} metalness={0} />
      </mesh>

      {/* ── ЗАДНЯЯ СТЕНА (вокруг панельной зоны) ────── */}
      {/* Верхняя полоса над панелями */}
      <mesh position={[0, wallHeight + EXTRA_H / 2, -0.001]} receiveShadow>
        <planeGeometry args={[rW, EXTRA_H]} />
        <meshStandardMaterial color={CLR.wallBack} roughness={0.92} metalness={0} />
      </mesh>
      {/* Левая полоса */}
      <mesh position={[-(wallWidth / 2 + EXTRA_W / 2), wallHeight / 2, -0.001]} receiveShadow>
        <planeGeometry args={[EXTRA_W, wallHeight]} />
        <meshStandardMaterial color={CLR.wallBack} roughness={0.92} metalness={0} />
      </mesh>
      {/* Правая полоса */}
      <mesh position={[wallWidth / 2 + EXTRA_W / 2, wallHeight / 2, -0.001]} receiveShadow>
        <planeGeometry args={[EXTRA_W, wallHeight]} />
        <meshStandardMaterial color={CLR.wallBack} roughness={0.92} metalness={0} />
      </mesh>

      {/* ── ПЛИНТУС (у задней стены низ) ────────────── */}
      <mesh position={[0, 0.05, 0.012]}>
        <boxGeometry args={[rW, 0.1, 0.02]} />
        <meshStandardMaterial color={CLR.skirting} roughness={0.7} />
      </mesh>

      {/* ── ПЛИНТУСЫ боковых стен ───────────────────── */}
      <mesh position={[-rW / 2 + 0.01, 0.05, midZ]}>
        <boxGeometry args={[0.02, 0.1, rD]} />
        <meshStandardMaterial color={CLR.skirting} roughness={0.7} />
      </mesh>
      <mesh position={[rW / 2 - 0.01, 0.05, midZ]}>
        <boxGeometry args={[0.02, 0.1, rD]} />
        <meshStandardMaterial color={CLR.skirting} roughness={0.7} />
      </mesh>

      {/* ── ПОТОЛОЧНЫЕ LED ПОЛОСЫ ────────────────────── */}
      <LEDStrips rH={rH} rD={rD} />

      {/* ── ОСВЕЩЕНИЕ КОМНАТЫ ───────────────────────── */}
      <RoomLights rW={rW} rH={rH} rD={rD} />
    </group>
  )
}

/* ── Плиточные линии на полу ─────────────────────────────── */
function FloorLines({ rW, rD, midZ }: { rW: number; rD: number; midZ: number }) {
  const geo = useMemo(() => {
    const pts: number[] = []
    const Y = 0.002
    const TILE = 0.6
    const x0 = -rW / 2,
      x1 = rW / 2
    const z0 = -rD / 2,
      z1 = rD / 2
    for (let z = z0; z <= z1 + 0.01; z += TILE) {
      pts.push(x0, Y, z, x1, Y, z)
    }
    for (let x = x0; x <= x1 + 0.01; x += TILE) {
      pts.push(x, Y, z0, x, Y, z1)
    }
    const arr = new Float32Array(pts)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [rW, rD])

  return (
    <group position={[0, 0, midZ]}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color="#a89e8e" transparent opacity={0.22} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

/* ── LED полосы ──────────────────────────────────────────── */
function LEDStrips({ rH, rD }: { rH: number; rD: number }) {
  return (
    <>
      {[-0.5, 0.5].map((ox) => (
        <mesh key={ox} position={[ox, rH - 0.006, DEPTH / 2]}>
          <boxGeometry args={[0.05, 0.008, rD - 0.3]} />
          <meshStandardMaterial
            color={CLR.ceilStrip}
            emissive="#fff5e0"
            emissiveIntensity={1.4}
            roughness={0.3}
          />
        </mesh>
      ))}
    </>
  )
}

/* ── Свет комнаты ────────────────────────────────────────── */
function RoomLights({ rW, rH, rD }: { rW: number; rH: number; rD: number }) {
  return (
    <>
      {/* Основной тёплый от потолка */}
      <pointLight
        position={[0, rH - 0.1, rD * 0.35]}
        intensity={0.7}
        color="#fff4e0"
        distance={14}
        decay={2}
      />
      <pointLight
        position={[0, rH - 0.1, rD * 0.72]}
        intensity={0.55}
        color="#fff4e0"
        distance={12}
        decay={2}
      />
      {/* Заполняющий от пола */}
      <pointLight
        position={[0, 0.4, rD * 0.5]}
        intensity={0.07}
        color="#e8d8b8"
        distance={10}
        decay={2}
      />
    </>
  )
}
