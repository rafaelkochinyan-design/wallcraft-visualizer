import * as THREE from 'three'
import { useMemo } from 'react'

interface MeterGridProps {
  wallWidth: number
  wallHeight: number
}

export default function MeterGrid({ wallWidth, wallHeight }: MeterGridProps) {
  const lines = useMemo(() => {
    const positions: number[] = []
    const Z = 0.001 // slightly in front of wall

    // Vertical lines every 1m
    for (let x = -wallWidth / 2; x <= wallWidth / 2; x += 1) {
      positions.push(x, 0, Z, x, wallHeight, Z)
    }

    // Horizontal lines every 1m
    for (let y = 0; y <= wallHeight; y += 1) {
      positions.push(-wallWidth / 2, y, Z, wallWidth / 2, y, Z)
    }

    return new Float32Array(positions)
  }, [wallWidth, wallHeight])

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[lines, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" opacity={0.12} transparent depthWrite={false} />
    </lineSegments>
  )
}
