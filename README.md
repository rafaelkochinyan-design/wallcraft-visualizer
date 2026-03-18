# WallCraft 3D Visualizer

SaaS 3D wall panel visualizer. First tenant: **Wallcraft** (Yerevan).

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ running locally
- (Optional) Cloudflare R2 account for file storage

### 1. Clone and install

```bash
# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

### 2. Set up backend environment

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL at minimum
# For R2: set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
# For dev without R2: see "Dev without R2" section below
```

### 3. Set up database

```bash
cd backend
npx prisma migrate dev --name init
npm run db:seed
```

Seed creates:
- Tenant: `wallcraft`
- Admin user: `admin@wallcraft.am` / `admin123`
- 5 accessory types (socket, switch, tv, lamp, picture)
- 2 panels: Консул А and Консул Б

### 4. Add panel texture

Copy a high-res photo of the Консул panel (square crop, 1024×1024px minimum) to:
```
frontend/public/textures/consul_a.jpg
frontend/public/textures/consul_a_thumb.jpg  (smaller, ~200×200px)
```

### 5. Set up frontend environment

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001  ← default, no change needed
# VITE_TENANT_SLUG=wallcraft          ← default, no change needed
```

### 6. Run both servers

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open http://localhost:5173 — visualizer
Open http://localhost:5173/admin — admin panel

---

## Dev without Cloudflare R2

For local dev, you can skip R2 and use local file URLs instead.

Option 1: Use a public CDN URL for textures (upload manually to any image host).

Option 2: Modify `backend/src/services/r2.ts` to save files locally:

```typescript
// Temporary local storage for dev
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export async function uploadFile(buffer: Buffer, folder: string, originalName: string, _ct: string): Promise<string> {
  const ext = originalName.split('.').pop()
  const filename = `${Date.now()}.${ext}`
  const dir = join(process.cwd(), '../frontend/public/uploads', folder)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, filename), buffer)
  return `/uploads/${folder}/${filename}`
}
```

Then add `uploads/` to `frontend/public/`.

---

## Project Structure

```
wallcraft-visualizer/
├── CLAUDE.md              ← Master Claude Code context
├── backend/
│   ├── CLAUDE.md          ← Backend-specific context
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts       ← Express app entry
│       ├── middleware/    ← tenant, auth, errorHandler
│       ├── routes/        ← public.ts, admin.ts
│       ├── services/      ← r2.ts
│       └── utils/         ← prisma.ts, response.ts
└── frontend/
    ├── CLAUDE.md          ← Frontend-specific context
    └── src/
        ├── components/
        │   ├── scene/     ← R3F: Scene, WallMesh, SceneLight, MeterGrid, AccessoryObject
        │   ├── ui/        ← Tooltips (TooltipMain, TooltipSettings)
        │   └── steps/     ← WallSizeStep, PanelSelectStep
        ├── hooks/         ← useTenant.ts
        ├── lib/           ← api.ts (axios + token)
        ├── pages/         ← VisualizerPage, admin/*
        ├── store/         ← visualizer.ts (Zustand)
        └── types/         ← index.ts
```

---

## Multi-tenancy

- Each store gets a subdomain: `wallcraft.yourdomain.com`
- Backend resolves tenant from subdomain automatically
- In dev: use `?store=wallcraft` query param OR set `VITE_TENANT_SLUG=wallcraft`

To add a new store: insert a row in the `tenants` table + create an admin user.

---

## Implementation Status

- [x] Project structure and CLAUDE.md files
- [x] Database schema (Prisma)
- [x] Seed data
- [x] Backend: tenant middleware, auth, all API routes
- [x] Frontend: types, Zustand store, API client
- [x] 3D Scene: Scene, WallMesh with InstancedMesh, SceneLight, MeterGrid, AccessoryObject
- [x] UI Steps: WallSizeStep, PanelSelectStep
- [x] UI Tooltips: TooltipMain, TooltipSettings (light/position/accessories)
- [x] Admin: Login, Layout, PanelsPage (full CRUD), AccessoriesPage (skeleton), StoreSettingsPage
- [ ] AccessoriesPage: full modal with .glb upload (skeleton ready, see NOTE in file)
- [ ] 3D accessories: need real .glb models (see sources in WALLCRAFT_PROJECT_SPEC.md)
- [ ] Texture files: add consul_a.jpg to frontend/public/textures/
- [ ] Production deployment

---

## Accessory 3D Models

Need .glb files. Free sources:
- https://polypizza.xyz — free, CC0, .glb format
- https://sketchfab.com/features/free-3d-models — filter by CC license
- https://market.pmnd.rs — R3F community models

For MVP: socket + switch + TV is enough to demo the feature.

---

## Deployment

**Backend:** Railway, Render, or any Node.js host
- Set all env vars
- Run `npx prisma migrate deploy` before start
- Use `npm run build && npm start`

**Frontend:** Vercel
- Set `VITE_API_URL` to your backend URL
- Enable wildcard subdomain: `*.yourdomain.com → frontend`

**Database:** Railway Postgres or Supabase (free tier)

**Files:** Cloudflare R2 (free 10GB/month, no egress fees)
