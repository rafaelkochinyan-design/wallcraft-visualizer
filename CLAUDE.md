# WallCraft Visualizer — Claude Code Master Context

## Project in one sentence
A SaaS 3D wall panel visualizer. Users input wall dimensions, pick decorative gypsum panels and accessories, and see a real-time 3D preview. Multi-tenant: each store gets its own branded instance.

## First (and only) client right now
**Wallcraft** — decorative gypsum panel store in Yerevan, Armenia.
Panel: "Консул" — 500×500×19mm, ridge/rib texture, paintable gypsum.

---

## Tech Stack — NEVER deviate from this

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | React + Vite + TypeScript | React 18, Vite 5 |
| 3D | React Three Fiber + drei | @react-three/fiber ^8, @react-three/drei ^9 |
| State | Zustand | ^4 |
| Styling | Tailwind CSS | ^3 |
| Backend | Node.js + Express | Express ^4 |
| ORM | Prisma | ^5 |
| Database | PostgreSQL | 15+ |
| Auth | JWT (jsonwebtoken) | access 15min, refresh 7d |
| File Storage | Cloudflare R2 via @aws-sdk/client-s3 | S3-compatible |
| Validation | Zod | ^3 |
| Multi-tenancy | Shared schema, tenant_id on every row | row-level isolation |

## Monorepo structure
```
wallcraft-visualizer/
├── CLAUDE.md                    ← you are here
├── backend/
│   ├── CLAUDE.md                ← backend-specific context
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── tenant.ts        ← tenant resolver (CRITICAL)
│   │   │   ├── auth.ts          ← JWT verify
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── public.ts        ← /api/* (no auth)
│   │   │   └── admin.ts         ← /admin/* (JWT required)
│   │   ├── controllers/
│   │   ├── services/
│   │   │   └── r2.ts            ← Cloudflare R2 upload
│   │   ├── utils/
│   │   │   └── response.ts      ← standard {data, error} shape
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── CLAUDE.md                ← frontend-specific context
│   ├── src/
│   │   ├── components/
│   │   │   ├── scene/           ← R3F components only
│   │   │   │   ├── Scene.tsx
│   │   │   │   ├── WallMesh.tsx
│   │   │   │   ├── PanelTiling.tsx
│   │   │   │   ├── MeterGrid.tsx
│   │   │   │   ├── SceneLight.tsx
│   │   │   │   └── AccessoryObject.tsx
│   │   │   ├── ui/              ← HTML overlay UI
│   │   │   │   ├── TooltipMain.tsx
│   │   │   │   ├── TooltipSettings.tsx
│   │   │   │   ├── TooltipAccessories.tsx
│   │   │   │   └── ColorPicker.tsx
│   │   │   ├── steps/           ← wizard steps
│   │   │   │   ├── WallSizeStep.tsx
│   │   │   │   └── PanelSelectStep.tsx
│   │   │   └── admin/           ← admin panel pages
│   │   ├── hooks/
│   │   │   ├── useTenant.ts
│   │   │   └── useApi.ts
│   │   ├── store/
│   │   │   └── visualizer.ts    ← Zustand store
│   │   ├── types/
│   │   │   └── index.ts         ← shared TS types
│   │   ├── lib/
│   │   │   └── api.ts           ← axios instance
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── textures/            ← panel textures (jpg)
│   ├── .env.example
│   └── package.json
└── agents/                      ← Claude Code agent contexts
    ├── backend/CLAUDE.md
    ├── 3d-scene/CLAUDE.md
    ├── ui-tooltip/CLAUDE.md
    └── admin/CLAUDE.md
```

---

## Multi-tenancy — HOW IT WORKS

**Strategy:** Shared PostgreSQL database, `tenant_id` column on every tenant-scoped table.

**Tenant resolution order:**
1. Subdomain: `wallcraft.yourdomain.com` → slug = `wallcraft`
2. Query param fallback (dev only): `?store=wallcraft`
3. Header: `x-tenant-slug: wallcraft`

**Middleware** (`src/middleware/tenant.ts`) runs on EVERY request:
- Resolves tenant slug from request
- Looks up tenant in DB
- Attaches `req.tenant` to request
- Returns 404 if tenant not found

**RULE: Every DB query on tenant-scoped tables MUST filter by `tenant_id`.**
Never query panels/accessories/users without tenant filter.

---

## API Response Shape — ALWAYS use this

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { message: string, code?: string } }
```

Use `src/utils/response.ts` helpers: `ok(res, data)` and `fail(res, status, message)`.

---

## Authentication

- Admin login → POST `/admin/auth/login` → returns `{ accessToken, refreshToken }`
- Access token: 15 min expiry, sent in `Authorization: Bearer <token>`
- Refresh token: 7 days, stored in httpOnly cookie AND returned in body
- `auth` middleware verifies access token, attaches `req.user` with `{ id, tenant_id, role }`
- All `/admin/*` routes (except login/refresh) require valid JWT

---

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/wallcraft
JWT_SECRET=<random 64 char hex>
JWT_REFRESH_SECRET=<different random 64 char hex>
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=wallcraft-assets
R2_PUBLIC_URL=https://pub-XXXX.r2.dev
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:3001
VITE_APP_ENV=development
```

---

## Key Business Rules

1. **Panel tile size is always 500×500mm (0.5m × 0.5m)**
2. **Max 2 panels selectable at once** in the visualizer
3. **Panel "Консул"** has 2 visual variants = same texture, variant B is rotated 180°
4. **Wall dimensions:** min 0.5m, max 10m for both width and height
5. **Accessories** are placed on the wall surface (Z = wall Z + small offset)
6. **Accessories** can be dragged along wall surface (constrained to wall bounds)
7. **Reset ("Убрать всё")** clears everything and goes back to wall size input
8. **Admin panel** is at `/admin` route, completely separate from visualizer
9. **Tenant branding** (logo, primary_color) is loaded once on app start via `/api/tenant`

---

## 3D Scene Rules

- **Wall position:** centered at world origin, faces +Z axis
  - Wall spans X: [-width/2, +width/2], Y: [0, height], Z: 0
- **Camera start:** position [0, height/2, Math.max(width, height) * 1.5], target [0, height/2, 0]
- **Light:** DirectionalLight, position controlled by azimuth + elevation angles
  - `x = distance * cos(elevation) * sin(azimuth)`
  - `y = distance * sin(elevation)`
  - `z = distance * cos(elevation) * cos(azimuth)`
- **Panel tiling:** Use `THREE.InstancedMesh` — DO NOT create individual meshes per tile
- **Texture tiling:** `texture.wrapS = texture.wrapT = THREE.RepeatWrapping`
- **Panel texture UV:** each tile shows exactly 1 panel = UV repeat per tile, not whole wall
- **Accessory drag:** Raycasting against invisible wall plane (`THREE.Plane(normal, 0)`)

---

## DO NOT

- Do NOT use `create-react-app` — use Vite
- Do NOT use `axios` on backend — use native `fetch` or keep it simple
- Do NOT store tokens in localStorage — use memory + httpOnly cookie for refresh
- Do NOT skip `tenant_id` filter on any DB query
- Do NOT create individual `THREE.Mesh` per panel tile — use `InstancedMesh`
- Do NOT put business logic in React components — use hooks or Zustand actions
- Do NOT import THREE directly in R3F components when drei equivalent exists
- Do NOT use `any` TypeScript type — be explicit

---

## Current Status
Phase 0 — Starting from scratch. Nothing built yet.
Start with: backend setup → prisma schema → seed → public API endpoints.
