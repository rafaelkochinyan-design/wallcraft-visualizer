# Frontend — Context
# Scope: frontend/ — React, Vite, R3F, Zustand, Design System

## Stack
React 18 + Vite 5 + TypeScript + React Three Fiber + Zustand

## Critical rule: R3F vs DOM boundary

```
scene/     → INSIDE Canvas  → useThree ✅, THREE.* ✅, HTML ❌
ui/steps/  → OUTSIDE Canvas → useThree ❌, HTML ✅, CSS ✅
```

Data crosses boundary ONLY through Zustand store.

---

## Design System (CSS Variables — НЕ Tailwind)

### Tokens
```
frontend/src/styles/tokens.css     ← font, colors, spacing, radii, easing
frontend/src/styles/components.css ← .btn .card .card-dark .input .badge
```

### Font: DM Sans (loaded in index.html)
### Key tokens:
```css
--font: 'DM Sans', sans-serif
--h-btn-md: 52px      /* minimum button height */
--glass-dark: rgba(10,10,10,0.84)  /* dark overlay over 3D */
--glass-light: rgba(255,255,255,0.97) /* white card */
--ease: cubic-bezier(0.16,1,0.3,1)
```

---

## Packages
```json
"@react-three/fiber": "^8",
"@react-three/drei": "^9",
"@react-spring/three": "*",   // 3D spring animations
"@react-spring/web": "*",     // DOM spring animations
"@use-gesture/react": "*",    // drag/pinch gestures
"sonner": "*",                 // toast notifications
"zustand": "^4"
```

---

## Zustand Store (full field list)

```typescript
// Tenant
tenant: Tenant | null

// Wall
wallWidth, wallHeight: number   // meters
wallColor: string               // hex

// Data
availablePanels: Panel[]
selectedPanels: Panel[]         // max 2
availableAccessories: Accessory[]
availableAccessoryTypes: AccessoryType[]
placedAccessories: PlacedAccessory[]

// UI flow
step: 'size' | 'panel_select' | 'interactive'
tooltipMode: null | 'settings'
settingsTab: 'light' | 'position' | 'accessories'
tooltipCollapsed: boolean
tooltipPosition: { x: number, y: number }  // y=-1 = vertically centered

// Lighting
lightAngle: number        // 0-360°
lightElevation: number    // 0-90°

// Screenshot trigger
pendingSave: boolean       // UI sets true → SaveSceneWirer in Canvas handles it
```

---

## API Client (lib/api.ts)
- Axios instance with base URL from `VITE_API_URL`
- Auto-injects `?store=<tenantSlug>` in dev
- Auto-injects `Authorization: Bearer <token>` for admin routes
- Auto-refresh token on 401 TOKEN_EXPIRED

---

## Types (types/index.ts)

```typescript
Panel: { id, tenant_id, name, sku, texture_url, thumb_url, width_mm(500), height_mm(500), depth_mm(19), price }
Accessory: { id, tenant_id, type_id, name, model_url, thumb_url, scale, type: AccessoryType }
AccessoryType: { id, name, label_ru }
PlacedAccessory: { uid, accessory: Accessory, position: [x, y, z] }
```

---

## DO NOT
- Use Tailwind for new visualizer components (admin pages — ok)
- Hardcode colors or spacing values
- Use `useThree` outside Canvas
- Duplicate Button/InputField — use existing components
- Import THREE in UI components
