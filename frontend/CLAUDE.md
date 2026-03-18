# Frontend — Claude Code Context

## Stack
React 18 + Vite + TypeScript + React Three Fiber + Zustand + Tailwind CSS

## My scope
Everything inside `/frontend/`. I do NOT touch `/backend/`.

## Running the project
```bash
cd frontend
npm install
npm run dev   # Vite dev server, port 5173
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "@react-three/drei": "^9",
    "@react-three/fiber": "^8",
    "axios": "^1",
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6",
    "three": "^0.160",
    "zustand": "^4"
  },
  "devDependencies": {
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/three": "^0.160",
    "@vitejs/plugin-react": "^4",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "typescript": "^5",
    "vite": "^5"
  }
}
```

---

## TypeScript Types (src/types/index.ts)

```typescript
export interface Tenant {
  id: string
  slug: string
  name: string
  logo_url: string | null
  primary_color: string
}

export interface Panel {
  id: string
  tenant_id: string
  name: string
  sku: string | null
  texture_url: string
  thumb_url: string
  width_mm: number   // always 500 for Консул
  height_mm: number  // always 500 for Консул
  depth_mm: number   // always 19 for Консул
  price: number | null
  sort_order: number
}

export interface AccessoryType {
  id: string
  name: string       // "socket" | "switch" | "tv" | "lamp" | "picture"
  label_ru: string   // "Розетка" | "Выключатель" | "Телевизор" | "Лампа" | "Картина"
  icon_url: string | null
}

export interface Accessory {
  id: string
  type_id: string
  name: string
  model_url: string  // .glb file URL
  thumb_url: string
  scale: number
  type: AccessoryType
}

export interface PlacedAccessory {
  uid: string        // local uuid, not from DB
  accessory: Accessory
  position: [number, number, number]  // [x, y, z] in scene units (meters)
}

export type VisualizerStep = 'size' | 'panel_select' | 'interactive'
export type TooltipMode = 'main' | 'settings' | null
export type SettingsTab = 'light' | 'position' | 'accessories'
```

---

## Zustand Store (src/store/visualizer.ts)

```typescript
import { create } from 'zustand'
import { Panel, Accessory, PlacedAccessory, VisualizerStep, TooltipMode, SettingsTab } from '../types'
import { v4 as uuid } from 'uuid'

interface VisualizerStore {
  // Wall
  wallWidth: number
  wallHeight: number
  wallColor: string

  // Panels
  availablePanels: Panel[]
  selectedPanels: Panel[]  // max 2

  // Accessories
  availableAccessories: Accessory[]
  placedAccessories: PlacedAccessory[]

  // UI State
  step: VisualizerStep
  tooltipMode: TooltipMode
  settingsTab: SettingsTab

  // Light
  lightAngle: number      // azimuth degrees 0-360
  lightElevation: number  // elevation degrees 0-90

  // Tenant
  tenantLoaded: boolean

  // Actions
  setWallSize: (width: number, height: number) => void
  setWallColor: (color: string) => void
  setAvailablePanels: (panels: Panel[]) => void
  togglePanelSelect: (panel: Panel) => void
  setAvailableAccessories: (accessories: Accessory[]) => void
  placeAccessory: (accessory: Accessory) => void
  moveAccessory: (uid: string, position: [number, number, number]) => void
  removeAccessory: (uid: string) => void
  setStep: (step: VisualizerStep) => void
  setTooltipMode: (mode: TooltipMode) => void
  setSettingsTab: (tab: SettingsTab) => void
  setLightAngle: (angle: number) => void
  setLightElevation: (elevation: number) => void
  resetAll: () => void
  setTenantLoaded: (loaded: boolean) => void
}

const initialState = {
  wallWidth: 3,
  wallHeight: 2.7,
  wallColor: '#f5f5f0',
  availablePanels: [],
  selectedPanels: [],
  availableAccessories: [],
  placedAccessories: [],
  step: 'size' as VisualizerStep,
  tooltipMode: null as TooltipMode,
  settingsTab: 'light' as SettingsTab,
  lightAngle: 45,
  lightElevation: 60,
  tenantLoaded: false,
}

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  ...initialState,

  setWallSize: (width, height) => set({ wallWidth: width, wallHeight: height }),
  setWallColor: (color) => set({ wallColor: color }),
  setAvailablePanels: (panels) => set({ availablePanels: panels }),

  togglePanelSelect: (panel) => {
    const { selectedPanels } = get()
    const isSelected = selectedPanels.some(p => p.id === panel.id)
    if (isSelected) {
      set({ selectedPanels: selectedPanels.filter(p => p.id !== panel.id) })
    } else if (selectedPanels.length < 2) {
      set({ selectedPanels: [...selectedPanels, panel] })
    }
  },

  setAvailableAccessories: (accessories) => set({ availableAccessories: accessories }),

  placeAccessory: (accessory) => {
    const { wallWidth, wallHeight } = get()
    set(state => ({
      placedAccessories: [
        ...state.placedAccessories,
        {
          uid: uuid(),
          accessory,
          position: [0, wallHeight / 2, 0.02], // center of wall
        }
      ]
    }))
  },

  moveAccessory: (uid, position) => {
    set(state => ({
      placedAccessories: state.placedAccessories.map(a =>
        a.uid === uid ? { ...a, position } : a
      )
    }))
  },

  removeAccessory: (uid) => {
    set(state => ({
      placedAccessories: state.placedAccessories.filter(a => a.uid !== uid)
    }))
  },

  setStep: (step) => set({ step }),
  setTooltipMode: (tooltipMode) => set({ tooltipMode }),
  setSettingsTab: (settingsTab) => set({ settingsTab }),
  setLightAngle: (lightAngle) => set({ lightAngle }),
  setLightElevation: (lightElevation) => set({ lightElevation }),
  setTenantLoaded: (tenantLoaded) => set({ tenantLoaded }),

  resetAll: () => set({
    ...initialState,
    availablePanels: get().availablePanels,
    availableAccessories: get().availableAccessories,
    tenantLoaded: get().tenantLoaded,
  }),
}))
```

---

## API Client (src/lib/api.ts)

```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // for httpOnly refresh cookie
})

// Attach tenant slug to every request
// Dev: via query param. Prod: subdomain handles it automatically.
api.interceptors.request.use(config => {
  const slug = getTenantSlug()  // from subdomain or env
  if (slug && import.meta.env.VITE_APP_ENV === 'development') {
    config.params = { ...config.params, store: slug }
  }
  return config
})

function getTenantSlug(): string {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  if (parts.length >= 3) return parts[0]
  return import.meta.env.VITE_TENANT_SLUG || 'wallcraft'
}

export default api
```

---

## 3D Scene Architecture

### Wall coordinate system
- Wall is a flat plane at Z=0, facing camera (+Z direction)
- Wall spans: X = [-wallWidth/2, +wallWidth/2], Y = [0, wallHeight]
- Wall center: [0, wallHeight/2, 0]
- Camera position: [0, wallHeight/2, Math.max(wallWidth, wallHeight) * 1.5]
- OrbitControls target: [0, wallHeight/2, 0]

### Light position calculation
```typescript
function getLightPosition(angle: number, elevation: number, distance = 10): [number, number, number] {
  const azRad = (angle * Math.PI) / 180
  const elRad = (elevation * Math.PI) / 180
  return [
    distance * Math.cos(elRad) * Math.sin(azRad),
    distance * Math.sin(elRad),
    distance * Math.cos(elRad) * Math.cos(azRad),
  ]
}
```

### Panel tiling with InstancedMesh
```typescript
// IMPORTANT: Use InstancedMesh, NOT individual meshes
// Panel size: 0.5m × 0.5m × 0.019m

const PANEL_W = 0.5  // meters
const PANEL_H = 0.5  // meters
const PANEL_D = 0.019

// Number of tiles
const cols = Math.ceil(wallWidth / PANEL_W)
const rows = Math.ceil(wallHeight / PANEL_H)
const count = cols * rows

// For 2-panel checkerboard: even tiles = panel A, odd tiles = panel B
// "Консул Б" is "Консул А" with texture.rotation = Math.PI (180°)
```

### Accessory drag (raycasting)
```typescript
// Use an invisible plane for raycasting, not the panel mesh
const wallPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

// On pointer move while dragging:
const raycaster = new THREE.Raycaster()
raycaster.setFromCamera(pointer, camera)
const point = new THREE.Vector3()
raycaster.ray.intersectPlane(wallPlane, point)

// Clamp to wall bounds:
point.x = Math.max(-wallWidth/2, Math.min(wallWidth/2, point.x))
point.y = Math.max(0, Math.min(wallHeight, point.y))
point.z = 0.02  // slightly in front of wall
```

---

## UI/Tooltip Design System

### Colors
- Background: `rgba(255, 255, 255, 0.12)` with `backdrop-blur-md`
- Border: `rgba(255, 255, 255, 0.2)`
- Text: white (on dark canvas background)
- Accent/primary: tenant's `primary_color`
- Danger: `#ef4444`

### Tooltip positioning
- TooltipMain: `position: absolute, left: 24px, top: 50%, transform: translateY(-50%)`
- TooltipSettings: same position, wider, replaces TooltipMain with slide animation
- Width: TooltipMain = 180px, TooltipSettings = 260px

### Step UI
- Step panels are centered bottom overlays
- WallSizeStep: centered card with two number inputs (width, height)
- PanelSelectStep: bottom sheet with horizontal scroll panel cards

---

## Component Responsibilities

| Component | What it does | What it does NOT do |
|-----------|-------------|---------------------|
| Scene.tsx | Canvas setup, camera, fog, shadows | No business logic |
| WallMesh.tsx | Renders wall plane with color | No state reads except wall dimensions |
| PanelTiling.tsx | InstancedMesh panel tiles | No UI |
| MeterGrid.tsx | Grid lines every 1m | Purely visual |
| SceneLight.tsx | DirectionalLight + AmbientLight | Reads lightAngle/lightElevation from store |
| AccessoryObject.tsx | Load GLB, place on wall, handle drag | Calls store.moveAccessory on drag end |
| TooltipMain.tsx | Убрать всё + Настроить buttons | No 3D code |
| TooltipSettings.tsx | Tabs: свет/позиция/аксессуары | No 3D code |
| WallSizeStep.tsx | Width + height inputs, validation | No 3D code |
| PanelSelectStep.tsx | Panel grid, max 2 selection | No 3D code |

---

## CRITICAL RULES for this codebase

1. NEVER use `useThree` outside of R3F canvas context (inside `<Canvas>`)
2. R3F components (inside Canvas) — NO Tailwind, NO DOM elements
3. HTML overlay (Tooltips, Steps) — NO R3F hooks, NO `useThree`
4. Pass data between canvas and HTML via Zustand ONLY
5. `useGLTF.preload(url)` for accessory models — preload when user opens accessories tab
6. Always handle loading state for GLB models (use Suspense + fallback)
7. Texture for panels: load once with `useTexture`, clone for rotated variant (`texture.clone()`)
8. Panel texture rotation for variant B: `clonedTexture.rotation = Math.PI`
9. TypeScript: no `any`, no `@ts-ignore`
10. Do NOT use React.memo unnecessarily — only when profiling shows a problem
