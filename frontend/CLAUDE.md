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

/* Accent hierarchy */
--accent           /* orange — prices, primary CTA buttons, links, active nav */
--accent-purple    /* purple — categories, tags, filter chips active, pagination active, dropdown hover, lang switcher active */
--accent-purple-light  /* light purple — tag/chip backgrounds */
--accent-gold      /* gold — ONLY on dark/hero backgrounds (never on light bg) */
--accent-gold-dark /* darker gold — hover state for gold buttons */
```

### Accent color rules:
- **Orange** (`--accent`): prices, primary CTA buttons, active nav links, links
- **Purple** (`--accent-purple`): category tags, filter chips active state, pagination active page, dropdown item hover, language switcher active
- **Gold** (`--accent-gold`): hero CTA buttons only — guaranteed dark background. **Never use on light backgrounds.**

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

## Code Quality

### Tools
- **ESLint 9** (flat config) — `eslint.config.js`
- **Prettier 3** — `.prettierrc` (singleQuote, 2 spaces, trailingComma es5, printWidth 100)

### Scripts
```
npm run lint        # check, fail on any warning
npm run lint:fix    # auto-fix all fixable issues
npm run format      # prettier format all src/**/*.{ts,tsx,css,json}
```

### Rules in effect
- `@typescript-eslint/no-explicit-any` — **off** (too noisy for R3F/dynamic data)
- `react/no-unknown-property` — **off** (R3F uses custom JSX props: position, args, etc.)
- `react-hooks/set-state-in-effect` — **off** (intentional pattern for closing drawers on navigation)
- `@typescript-eslint/ban-ts-comment` — **off** (legacy scene code uses `@ts-ignore`)
- Unused vars — **warn** with `^_` prefix pattern to suppress intentionally unused

### Before committing
Always run `npm run lint:fix && npm run format` — CI will reject if `npm run lint` exits non-zero.

---

## DO NOT
- Use Tailwind for new visualizer components (admin pages — ok)
- Hardcode colors or spacing values
- Use `useThree` outside Canvas
- Duplicate Button/InputField — use existing components
- Import THREE in UI components
