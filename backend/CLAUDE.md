# Backend — Claude Code Context

## Stack
Node.js + Express + Prisma + PostgreSQL + Cloudflare R2

## My scope
Everything inside `/backend/`. I do NOT touch `/frontend/`.

## Running the project
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev        # nodemon, port 3001
```

---

## Prisma Schema (source of truth)

```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  logo_url      String?
  primary_color String   @default("#1a1a1a")
  domain        String?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  users       User[]
  panels      Panel[]
  accessories Accessory[]
}

model User {
  id            String   @id @default(cuid())
  tenant_id     String
  email         String
  password_hash String
  role          Role     @default(ADMIN)
  created_at    DateTime @default(now())

  tenant Tenant @relation(fields: [tenant_id], references: [id])

  @@unique([tenant_id, email])
}

enum Role {
  ADMIN
  VIEWER
}

model PanelCategory {
  id        String  @id @default(cuid())
  tenant_id String
  name      String
  sort_order Int    @default(0)

  panels Panel[]
}

model Panel {
  id           String   @id @default(cuid())
  tenant_id    String
  category_id  String?
  name         String
  sku          String?
  texture_url  String
  thumb_url    String
  width_mm     Int      @default(500)
  height_mm    Int      @default(500)
  depth_mm     Int      @default(19)
  weight_kg    Float?
  price        Float?
  active       Boolean  @default(true)
  sort_order   Int      @default(0)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  tenant   Tenant         @relation(fields: [tenant_id], references: [id])
  category PanelCategory? @relation(fields: [category_id], references: [id])
}

model AccessoryType {
  id       String @id @default(cuid())
  name     String @unique  // "socket", "switch", "tv", "lamp", "picture"
  label_ru String          // "Розетка", "Выключатель", etc.
  icon_url String?

  accessories Accessory[]
}

model Accessory {
  id        String  @id @default(cuid())
  tenant_id String
  type_id   String
  name      String
  model_url String  // .glb on R2
  thumb_url String
  scale     Float   @default(1.0)
  active    Boolean @default(true)
  sort_order Int    @default(0)

  tenant Tenant        @relation(fields: [tenant_id], references: [id])
  type   AccessoryType @relation(fields: [type_id], references: [id])
}
```

---

## File Structure & Responsibilities

```
backend/src/
├── index.ts              ← Express app, middleware registration, listen
├── middleware/
│   ├── tenant.ts         ← resolve tenant from subdomain/query/header, attach req.tenant
│   ├── auth.ts           ← verify JWT, attach req.user
│   └── errorHandler.ts   ← catch-all error middleware
├── routes/
│   ├── public.ts         ← GET /api/tenant, GET /api/panels, GET /api/accessories
│   └── admin.ts          ← all /admin/* routes
├── controllers/
│   ├── tenantController.ts
│   ├── panelController.ts
│   ├── accessoryController.ts
│   └── authController.ts
├── services/
│   └── r2.ts             ← uploadFile(buffer, key, contentType): Promise<string>
└── utils/
    ├── response.ts        ← ok(), fail() helpers
    └── prisma.ts          ← singleton PrismaClient
```

---

## Tenant Middleware Pattern

```typescript
// src/middleware/tenant.ts
import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  let slug: string | undefined

  // 1. Try subdomain (wallcraft.domain.com)
  const host = req.hostname
  const parts = host.split('.')
  if (parts.length >= 3) {
    slug = parts[0]
  }

  // 2. Fallback: header
  if (!slug) {
    slug = req.headers['x-tenant-slug'] as string
  }

  // 3. Fallback: query param (dev only)
  if (!slug && process.env.NODE_ENV === 'development') {
    slug = req.query.store as string
  }

  if (!slug) {
    return res.status(400).json({ data: null, error: { message: 'Tenant not identified' } })
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) {
    return res.status(404).json({ data: null, error: { message: 'Store not found' } })
  }

  req.tenant = tenant
  next()
}
```

---

## Auth Middleware Pattern

```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ data: null, error: { message: 'Unauthorized' } })
  }
  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = { id: payload.sub as string, tenant_id: payload.tenant_id, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ data: null, error: { message: 'Token invalid or expired' } })
  }
}
```

---

## Response Helpers (always use these)

```typescript
// src/utils/response.ts
export const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ data, error: null })

export const fail = (res: Response, status: number, message: string, code?: string) =>
  res.status(status).json({ data: null, error: { message, code } })
```

---

## All API Endpoints

### Public routes (tenant middleware required, no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tenant | Returns tenant branding: {id, slug, name, logo_url, primary_color} |
| GET | /api/panels | Returns active panels for tenant, sorted by sort_order |
| GET | /api/accessories | Returns active accessories for tenant, grouped by type |
| GET | /api/accessory-types | Returns all AccessoryType rows |

### Admin routes (tenant middleware + auth middleware)

| Method | Path | Description |
|--------|------|-------------|
| POST | /admin/auth/login | {email, password} → {accessToken, refreshToken} |
| POST | /admin/auth/refresh | refreshToken in cookie → new accessToken |
| GET | /admin/auth/me | Returns current user |
| GET | /admin/panels | All panels (including inactive) |
| POST | /admin/panels | Create panel |
| PUT | /admin/panels/:id | Update panel |
| DELETE | /admin/panels/:id | Soft delete (set active=false) |
| POST | /admin/panels/upload-texture | multipart/form-data → uploads to R2, returns {url} |
| GET | /admin/accessories | All accessories (including inactive) |
| POST | /admin/accessories | Create accessory |
| PUT | /admin/accessories/:id | Update accessory |
| DELETE | /admin/accessories/:id | Soft delete |
| POST | /admin/accessories/upload-model | multipart/form-data → uploads .glb to R2, returns {url} |
| GET | /admin/settings | Returns tenant settings |
| PUT | /admin/settings | Update name, primary_color, logo_url |
| POST | /admin/settings/upload-logo | Uploads logo to R2, returns {url} |

---

## R2 Upload Service

```typescript
// src/services/r2.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadFile(
  buffer: Buffer,
  folder: string,          // "textures" | "models" | "logos"
  originalName: string,
  contentType: string
): Promise<string> {
  const ext = originalName.split('.').pop()
  const key = `${folder}/${uuid()}.${ext}`

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))

  return `${process.env.R2_PUBLIC_URL}/${key}`
}
```

---

## Seed Data (prisma/seed.ts)

Must create:
1. Tenant: `{ slug: 'wallcraft', name: 'Wallcraft', primary_color: '#1a1a1a' }`
2. User: `{ email: 'admin@wallcraft.am', password: hash('admin123'), role: 'ADMIN' }`
3. AccessoryTypes: socket, switch, tv, lamp, picture (with Russian labels)
4. Panel: Консул A (`{ name: 'Консул А', texture_url: '/textures/consul_a.jpg', ... }`)
5. Panel: Консул B (`{ name: 'Консул Б', texture_url: '/textures/consul_b.jpg', ... }`)

Note: consul_b.jpg = consul_a.jpg rotated 180° — can be the same file, rotation handled in frontend.

---

## TypeScript Express augmentation

Add this to `src/types/express.d.ts`:
```typescript
import { Tenant, User as PrismaUser } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      tenant: Tenant
      user?: {
        id: string
        tenant_id: string
        role: string
      }
    }
  }
}
```

---

## package.json dependencies

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3",
    "@prisma/client": "^5",
    "bcryptjs": "^2",
    "cors": "^2",
    "dotenv": "^16",
    "express": "^4",
    "jsonwebtoken": "^9",
    "multer": "^1",
    "uuid": "^9",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2",
    "@types/cors": "^2",
    "@types/express": "^4",
    "@types/jsonwebtoken": "^9",
    "@types/multer": "^1",
    "@types/node": "^20",
    "@types/uuid": "^9",
    "nodemon": "^3",
    "prisma": "^5",
    "ts-node": "^10",
    "typescript": "^5"
  },
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## CRITICAL RULES for this codebase

1. EVERY query on Panel, Accessory, User MUST include `where: { tenant_id: req.tenant.id }`
2. NEVER return password_hash in any response
3. File uploads: validate mime type before uploading (images: jpg/png/webp, models: glb/gltf)
4. Max file size: textures 5MB, models 20MB, logos 2MB
5. Use Zod for all request body validation — fail fast with clear error messages
6. Passwords hashed with bcryptjs rounds=10
