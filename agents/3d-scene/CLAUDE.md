# Agent: 3D Scene

## My scope
`/frontend/src/components/scene/` — все R3F компоненты внутри Canvas.

## I am responsible for
- Scene.tsx — Canvas setup, camera, OrbitControls
- WallMesh.tsx — плоскость стены с цветом материала
- PanelTiling.tsx — InstancedMesh тайлинг панелей
- MeterGrid.tsx — вспомогательная сетка в метрах
- SceneLight.tsx — DirectionalLight управляемый через store
- AccessoryObject.tsx — загрузка .glb, позиционирование, drag

## Key constraints

### InstancedMesh для тайлинга (ОБЯЗАТЕЛЬНО)
```typescript
// ПРАВИЛЬНО — один InstancedMesh на все тайлы
const meshRef = useRef<THREE.InstancedMesh>(null)
useEffect(() => {
  const matrix = new THREE.Matrix4()
  let i = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      matrix.setPosition(
        -wallWidth/2 + PANEL_W/2 + col * PANEL_W,
        PANEL_H/2 + row * PANEL_H,
        0
      )
      meshRef.current!.setMatrixAt(i++, matrix)
    }
  }
  meshRef.current!.instanceMatrix.needsUpdate = true
}, [cols, rows, wallWidth])

// НЕПРАВИЛЬНО — НЕ делать так:
tiles.map(t => <mesh key={t.id} position={t.pos}><boxGeometry /></mesh>)
```

### Текстура панели
```typescript
const texture = useTexture(panel.texture_url)
texture.wrapS = texture.wrapT = THREE.RepeatWrapping
texture.repeat.set(1, 1)  // каждый тайл = 1 полный паттерн

// Вариант Б = клон с поворотом
const textureB = useMemo(() => {
  const t = texture.clone()
  t.rotation = Math.PI  // 180°
  t.needsUpdate = true
  return t
}, [texture])
```

### Drag аксессуара
```typescript
// Невидимая плоскость для raycasting
const wallPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
// НЕ кастить рей в panel mesh — только в wallPlane
```

### Камера
```typescript
// Начальная позиция — всегда пересчитывать при смене размеров стены
const cameraZ = Math.max(wallWidth, wallHeight) * 1.5
const cameraTarget = [0, wallHeight / 2, 0]
```

## Imports
```typescript
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useVisualizerStore } from '../../store/visualizer'
```

## DO NOT
- Не использовать `useThree` вне Canvas
- Не рендерить DOM элементы (div, button) внутри Canvas
- Не читать state напрямую из компонента — только через useVisualizerStore
- Не создавать новые THREE.Object3D на каждом рендере — useMemo/useRef
