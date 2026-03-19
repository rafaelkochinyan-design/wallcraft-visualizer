# WallCraft Visualizer — Master Context
# Читай этот файл ПЕРВЫМ перед любым действием в проекте.

---

## Проект в одном предложении
SaaS 3D визуализатор декоративных настенных панелей.
Пользователь вводит размеры стены → выбирает панели → видит реалтайм 3D превью → добавляет аксессуары.
Мультитенантный: каждый магазин получает свой брендированный инстанс.

**Первый клиент:** Wallcraft, Ереван — гипсовые панели «Консул» 500×500×19мм.
**Продакшн:** https://frontend-beige-six-43.vercel.app

---

## Стек — НИКОГДА не менять без явного запроса

| Слой | Технология |
|------|-----------|
| Frontend | React 18 + Vite 5 + TypeScript |
| 3D | React Three Fiber ^8 + @react-three/drei ^9 |
| State | Zustand ^4 |
| Styling | **CSS Variables (tokens.css + components.css)** — НЕ Tailwind |
| Animations | @react-spring/three + @react-spring/web |
| Gestures | @use-gesture/react |
| Toasts | sonner |
| Backend | Node.js + Express ^4 + Prisma ^5 |
| DB | PostgreSQL 15+ |
| Auth | JWT (access 15min / refresh 7d) |
| Storage | Cloudflare R2 (S3-compatible) |
| Validation | Zod ^3 |
| Multi-tenancy | Shared schema, tenant_id on EVERY row |

---

## КРИТИЧЕСКАЯ ГРАНИЦА — R3F vs DOM

Это главный источник ошибок в проекте. Запомни навсегда:

```
ВНУТРИ <Canvas>                    СНАРУЖИ <Canvas>
─────────────────────────────     ─────────────────────────────
useThree ✅                        useThree ❌ → CRASH
useFrame ✅                        useFrame ❌ → CRASH
<mesh>, <group> ✅                 <div>, <button> ❌ → не работает
THREE.* напрямую ✅                THREE.* ❌ → не нужно
НЕТ Tailwind, НЕТ CSS классов     CSS классы ✅, Tailwind ✅ (legacy)
```

**Правило:** данные между Canvas и DOM передаются ТОЛЬКО через Zustand store.
Никаких props drilling через границу Canvas.

---

## Design System

### Файлы (единственный источник правды)
```
frontend/src/styles/tokens.css      ← CSS переменные (цвета, шрифты, отступы)
frontend/src/styles/components.css  ← классы (.btn, .card, .card-dark, .input и т.д.)
```

### Ключевые переменные
```css
--font: 'DM Sans', sans-serif
--c-black: #0a0a0a
--c-white: #ffffff
--glass-dark: rgba(10,10,10,0.84)    /* все тёмные оверлеи */
--glass-light: rgba(255,255,255,0.97) /* карточки на 3D */
--h-btn-md: 52px                      /* минимальная высота кнопки */
--r-full: 9999px                      /* pill/таблетка */
--ease: cubic-bezier(0.16,1,0.3,1)   /* все анимации */
```

### Переиспользуемые компоненты
```
Button.tsx     → <Button variant="primary|secondary|ghost|danger" size="sm|md|lg" full>
InputField.tsx → <InputField label suffix error value onChange>
```

### НЕЛЬЗЯ
- Хардкодить цвета в компонентах — только через CSS variables
- Создавать новые CSS файлы — только tokens.css и components.css
- Использовать Tailwind для новых компонентов (legacy admin pages — ок)

---

## Multi-tenancy — ЖЕЛЕЗНОЕ ПРАВИЛО

**Каждый** запрос к БД на tenant-scoped таблицах ОБЯЗАН содержать `tenant_id`:

```typescript
// ✅ ПРАВИЛЬНО
prisma.panel.findMany({ where: { tenant_id: req.tenant.id } })

// ❌ НЕПРАВИЛЬНО — утечка данных между тенантами!
prisma.panel.findMany()
```

Tenant-scoped таблицы: `Panel`, `Accessory`, `User`
Глобальные таблицы: `AccessoryType`, `Tenant` (сами по себе)

**Резолюция тенанта** (порядок приоритетов):
1. Субдомен: `wallcraft.domain.com` → slug = `wallcraft`
2. Header: `x-tenant-slug: wallcraft`
3. Query param (только dev): `?store=wallcraft`

---

## API Response shape — всегда

```typescript
// Success
res.json({ data: T, error: null })

// Error
res.json({ data: null, error: { message: string, code?: string } })
```

Использовать только `ok(res, data)` и `fail(res, status, message)` из `utils/response.ts`.

---

## 3D Сцена — координаты

```
Стена:
  X: [-wallWidth/2, +wallWidth/2]    (ширина в метрах)
  Y: [0, wallHeight]                 (высота в метрах, от пола)
  Z: 0                               (плоскость стены)

Камера старт: [0, wallHeight/2, max(w,h)*1.6]
OrbitControls target: [0, wallHeight/2, 0]

Панель: 0.5м × 0.5м × 0.019м (500×500×19mm)
Тайлинг: InstancedMesh ОБЯЗАТЕЛЬНО (не individual meshes)
Аксессуары: drag через wallPlane = new THREE.Plane(new THREE.Vector3(0,0,1), 0)
```

---

## Zustand Store — ключевые поля

```typescript
// Стена
wallWidth, wallHeight: number        // метры
wallColor: string                    // hex

// UI flow
step: 'size' | 'panel_select' | 'interactive'
tooltipMode: null | 'settings'
settingsTab: 'light' | 'position' | 'accessories'
tooltipCollapsed: boolean
tooltipPosition: { x: number, y: number }  // y=-1 = по центру

// 3D
lightAngle: number      // azimuth 0-360°
lightElevation: number  // 0-90°

// Screenshot
pendingSave: boolean    // триггер из UI → Canvas подхватывает

// Данные
selectedPanels: Panel[]         // max 2
placedAccessories: PlacedAccessory[]
availablePanels, availableAccessories, availableAccessoryTypes
```

---

## Структура проекта

```
wallcraft-visualizer/
├── CLAUDE.md                     ← ты здесь
├── backend/
│   ├── CLAUDE.md
│   ├── prisma/schema.prisma
│   └── src/
│       ├── middleware/tenant.ts  ← КРИТИЧНО
│       ├── routes/public.ts
│       ├── routes/admin.ts
│       ├── services/r2.ts
│       └── utils/response.ts
└── frontend/
    ├── CLAUDE.md
    └── src/
        ├── styles/
        │   ├── tokens.css        ← design tokens
        │   └── components.css    ← component classes
        ├── components/
        │   ├── scene/            ← R3F only (Canvas context)
        │   │   ├── Scene.tsx     ← preserveDrawingBuffer:true
        │   │   ├── WallMesh.tsx
        │   │   ├── PanelTiling.tsx
        │   │   ├── MeterGrid.tsx
        │   │   ├── SceneLight.tsx
        │   │   └── AccessoryObject.tsx
        │   ├── ui/               ← DOM only (outside Canvas)
        │   │   ├── Button.tsx
        │   │   ├── InputField.tsx
        │   │   ├── TooltipWrapper.tsx
        │   │   ├── Tooltips.tsx
        │   │   └── Utils.tsx     ← PanelCounter, LoadingScreen, SaveScene
        │   └── steps/
        │       ├── WallSizeStep.tsx
        │       └── PanelSelectStep.tsx
        ├── store/visualizer.ts
        ├── hooks/useTenant.ts
        ├── lib/api.ts
        ├── types/index.ts
        └── pages/
            ├── VisualizerPage.tsx
            └── admin/
                ├── AdminLayout.tsx
                ├── AdminLoginPage.tsx
                ├── PanelsPage.tsx
                ├── AccessoriesPage.tsx
                └── StoreSettingsPage.tsx
```

---

## Агенты — кто за что отвечает

| Агент | Папка | Задачи |
|-------|-------|--------|
| `3d-scene` | `frontend/src/components/scene/` | R3F компоненты, WebGL, тени, тайлинг |
| `ui` | `frontend/src/components/ui/`, `steps/`, `pages/VisualizerPage.tsx` | DOM компоненты, design system |
| `backend` | `backend/` | API, Prisma, auth, tenant middleware |
| `admin` | `frontend/src/pages/admin/` | Admin CRUD UI |

**Slash commands:**
- `/review-3d` — проверка 3D компонентов
- `/review-be` — проверка бэкенда + tenant isolation
- `/review-ui` — проверка UI + design system
- `/add-panel` — добавить новую панель через API
- `/fix` — исправить конкретный баг

---

## Частые ошибки — ЗАПРЕЩЕНО

1. `useThree()` вне `<Canvas>` — CRASH
2. `prisma.panel.findMany()` без `tenant_id` — DATA LEAK
3. Создавать `new THREE.Mesh()` в цикле тайлинга — используй InstancedMesh
4. `texture.clone()` без `needsUpdate = true` — текстура не обновится
5. Хардкодить цвета (`color: '#333'`) — используй CSS variables
6. Импортировать THREE напрямую в UI компонентах — ненужная зависимость
7. `localStorage` для токенов — только в памяти + httpOnly cookie
