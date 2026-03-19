# Agent: 3D Scene
# Scope: frontend/src/components/scene/ — всё внутри <Canvas>

## Моя зона ответственности
Только `frontend/src/components/scene/`.
Я НЕ трогаю UI компоненты, steps, pages, backend.

---

## ГЛАВНОЕ ПРАВИЛО — граница Canvas

```
ВНУТРИ Canvas (мои файлы)         СНАРУЖИ Canvas (не моё)
────────────────────────────      ───────────────────────
useThree ✅                        useThree ❌ CRASH
useFrame ✅                        useFrame ❌ CRASH
<mesh> <group> <primitive> ✅      <div> <button> ✅
THREE.* ✅                         React DOM ✅
```

**Данные из Canvas → UI:** только через Zustand store.
**Никакого prop drilling через границу Canvas.**

---

## Импорты — только эти

```typescript
// R3F
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF, useTexture, Html, SoftShadows } from '@react-three/drei'
import * as THREE from 'three'

// Анимации (новое)
import { useSpring, animated } from '@react-spring/three'

// Gestures (новое)  
import { useDrag } from '@use-gesture/react'

// Store
import { useVisualizerStore } from '../../store/visualizer'

// Utils (содержит SaveSceneWirer — только он импортируется из UI)
import { SaveSceneWirer } from '../ui/Utils'
```

---

## Файлы и их обязанности

### Scene.tsx
```typescript
// ОБЯЗАТЕЛЬНЫЕ props для Canvas:
<Canvas
  shadows
  gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
  camera={{ position: camPos, fov: 45, near: 0.01, far: 100 }}
  style={{ background: '#1a1a18' }}
>
  <SoftShadows size={20} samples={12} focus={0.6} />
  <SaveSceneWirer />  // ← скриншот
  ...
</Canvas>
```

### WallMesh.tsx
- Плоскость стены с `wallColor`
- Рендерит `<PanelTiling>` когда панели выбраны
- Рендерит `<MeterGrid>`
- Watermark логотип через `<Html>` когда нет панелей

### PanelTiling.tsx — КРИТИЧНО: InstancedMesh
```typescript
// ✅ ПРАВИЛЬНО — один InstancedMesh на все тайлы
const meshRef = useRef<THREE.InstancedMesh>(null)
// cols = Math.ceil(wallWidth / 0.5)
// rows = Math.ceil(wallHeight / 0.5)
// count = cols * rows
<instancedMesh ref={meshRef} args={[geometry, material, count]} />

// ❌ НИКОГДА ТАК — убьёт перформанс на большой стене
tiles.map(t => <mesh key={t.id} ...><boxGeometry /></mesh>)
```

### Текстура панели
```typescript
const texture = useTexture(panel.texture_url)
texture.wrapS = texture.wrapT = THREE.RepeatWrapping
texture.repeat.set(1, 1)  // 1 паттерн на 1 тайл

// Вариант Б (второй паттерн) = клон с поворотом 180°
const textureB = useMemo(() => {
  const t = texture.clone()
  t.rotation = Math.PI
  t.center.set(0.5, 0.5)  // вращение вокруг центра
  t.needsUpdate = true
  return t
}, [texture])
```

### AccessoryObject.tsx — drag с @use-gesture

```typescript
import { useDrag } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/three'

// wallPlane для raycasting
const wallPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0,0,1), 0), [])

// Spring анимация появления
const spring = useSpring({
  scale: mounted ? accessory.scale : 0,
  config: { tension: 280, friction: 20 },
})

// Drag
const bind = useDrag(({ active, movement: [mx, my], memo = position }) => {
  const sensitivity = 0.005
  const nx = clamp(memo[0] + mx * sensitivity, -wallWidth/2, wallWidth/2)
  const ny = clamp(memo[1] - my * sensitivity, 0, wallHeight)
  if (!active) moveAccessory(uid, [nx, ny, 0.025])
  return memo
}, { filterTaps: true })

return (
  <animated.group {...bind()} scale={spring.scale} position={position}>
    <primitive object={clonedScene} />
  </animated.group>
)
```

### SceneLight.tsx
```typescript
// Позиция из spherical coords (azimuth + elevation)
const distance = Math.max(wallWidth, wallHeight) * 2
const x = distance * cos(elRad) * sin(azRad)
const y = distance * sin(elRad)
const z = distance * cos(elRad) * cos(azRad) + distance * 0.5
```

---

## Анимации с @react-spring/three

```typescript
// Плавная смена цвета стены
import { useSpring, animated } from '@react-spring/three'
const { color } = useSpring({ color: wallColor })
<animated.meshStandardMaterial color={color} />

// Pop анимация появления аксессуара
const spring = useSpring({
  scale: mounted ? acc.scale : 0,
  config: { tension: 280, friction: 20 }
})
<animated.group scale={spring.scale}>
```

---

## SaveSceneWirer (скриншот)
```typescript
// Компонент монтируется внутри Canvas
// Слушает store.pendingSave
// При pendingSave=true: gl.domElement.toDataURL() → скачивание

// В Scene.tsx:
<SaveSceneWirer />  // импортируется из '../ui/Utils'
```

---

## Координаты стены
```
Стена: X = [-wallWidth/2, +wallWidth/2], Y = [0, wallHeight], Z = 0
Камера: position = [0, wallHeight/2, max(w,h)*1.6]
Target: [0, wallHeight/2, 0]
Аксессуары: Z = 0.025 (чуть впереди стены)
```

---

## Чего НЕ делать
- `useThree()` — только внутри Canvas
- `new THREE.Object3D()` на каждом рендере — useMemo или useRef
- Индивидуальные mesh для тайлов панелей — только InstancedMesh
- `texture.clone()` без `needsUpdate = true`
- DOM элементы (`<div>`, `<button>`) внутри Canvas без `<Html>` обёртки
- Импортировать Tailwind или CSS классы в scene компоненты
