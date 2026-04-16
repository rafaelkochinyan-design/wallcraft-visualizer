# WallCraft Backend Review Checklist

Stack: Node.js + Express + TypeScript + Prisma + PostgreSQL  
Project: Multi-tenant SaaS wall panel visualizer. Client = WallCraft Yerevan.

## Severity
🔴 CRITICAL — security hole, data leak, crash risk, deploy blocker
🟠 HIGH — incorrect behavior, broken feature, data corruption risk
🟡 MEDIUM — bad pattern, tech debt, performance issue
🟢 LOW — style, minor improvement

---

## 1. Security

- Every Prisma query in admin routes has `where: { tenant_id: req.tenant.id }` — data leaks across ALL tenants without this
- Every admin route file has `router.use(authMiddleware)` at top (or per-route) — unauthenticated CRUD is a critical hole
- No password_hash returned in any response (User model has it, must be excluded)
- No JWT secrets, DB URLs, API keys in any response
- File uploads validate MIME type — not just file extension (trivially spoofed)
- `refreshToken` NOT returned in response body — httpOnly cookie only
- No `req.body.refreshToken` fallback on refresh endpoint — defeats httpOnly security
- No raw user input in Prisma `$queryRaw` or string-interpolated SQL

## 2. Tenant Isolation (Core Business Rule)

- `tenantMiddleware` resolves slug from: `?store=` param → `x-tenant-slug` header → subdomain (skipping .onrender.com/.vercel.app/localhost)
- Every query must scope to `req.tenant.id` — never query global Panel/Collection/Blog data
- Public API routes (/api/panels, /api/gallery, etc.) also use `req.tenant.id` from tenantMiddleware
- `req.user.tenant_id` from JWT must match `req.tenant.id` for admin operations

## 3. Error Handling

- ALL async route handlers wrapped in `try/catch` with `next(err)`
- No empty catch blocks (errors swallowed silently = impossible to debug in production)
- Prisma errors go to `next(err)` — not leaked raw (exposes DB schema)
- 404 for not-found records (not 500 or returning null as success)
- Multer/upload errors caught and handled
- R2 upload failures handled — don't proceed with DB write if file upload failed

## 4. Data Integrity

- Multi-step operations use `prisma.$transaction`:
  - Panel update + PanelSize deleteMany/createMany — must be atomic
  - Any operation that modifies >1 table
- JSON fields validated before write:
  - `panel_ids` (Collection, Project) must be string[]
  - `tags` (BlogPost, GalleryItem) must be string[]
  - `images` (Panel, Project) must be string[]
  - `content` (PageContent) must be Record<string, LocalizedString>
- Integer parse NaN-safe: `parseInt(x, 10) || 0` — raw `parseInt` returns NaN, breaks sort_order
- PUT/PATCH endpoints whitelist allowed fields — never `{ ...req.body }` mass assignment

## 5. Auth Flow

- Login: verify email + bcrypt password → issue access token (15min) + refresh token (7d httpOnly cookie)
- Refresh: reads `req.cookies.refreshToken` only → verify with JWT_REFRESH_SECRET → new access token
- Me: `findFirst({ where: { id: req.user.id, tenant_id: req.tenant.id } })` — scoped to tenant
- Password hash: bcrypt only — never store or return plaintext
- Cookie config: `httpOnly: true, secure: true (prod), sameSite: 'none' (prod)` — required for cross-domain (Vercel ↔ Render)

## 6. Response Shape Consistency

- Success: `ok(res, data)` → `{ data }`
- Error: `fail(res, message, code, status)` → `{ error: { message, code } }`
- Paginated list: `{ data: { data: T[], meta: { total, page, pages, limit } } }`
- Single item: `{ data: item }`
- No raw Prisma objects — always select/exclude fields explicitly
- `password_hash` must never appear in any response

## 7. WallCraft Business Logic

### Panels
- Panel belongs to a PanelCategory (category_id)
- Panel can have multiple PanelSizes (id, label, width_mm, height_mm, depth_mm, price)
- PanelSizes are replaced on update (deleteMany + createMany inside transaction)
- texture_url is required — drives 3D rendering
- model_url is optional — only panels with GLB models have 3D interaction
- `active: false` panels excluded from /api/panels public endpoint

### Collections
- Collection stores `panel_ids: string[]` as JSON — references Panel.id values
- panel_ids NOT a foreign key — just a JSON array, no DB-level constraint
- slug must be unique per tenant — auto-generated from name (lowercase, hyphenated)
- `active: false` collections excluded from /api/collections public endpoint

### Blog Posts
- `title`, `excerpt`, `body` are LocalizedString JSON: `{ en, ru, am }`
- `published: false` posts excluded from /api/blog public endpoint
- `published_at` set when published=true first time — not updated on re-publish
- `PATCH /admin/blog/:id/publish` toggles published state

### Gallery
- GalleryItem has `space_type` (living_room, bedroom, office, hotel, restaurant, bathroom)
- `tags` is string[] JSON array
- Images are ephemeral on Render free tier — R2 is the persistent solution
- `active: false` items excluded from public /api/gallery

### Designers
- `bio`, `role` are LocalizedString JSON
- `portfolio: string[]` — array of image URLs
- `slug` auto-generated, must be unique per tenant

### Hero Slides
- `headline`, `subheadline`, `cta_label` are LocalizedString JSON
- `PATCH /admin/hero-slides/reorder` takes `{ ids: string[] }` — updates sort_order in order
- Reorder must update ALL slides atomically

### Leads vs Inquiries
- Lead: from product visualizer "Send" button — includes `wall_config` JSON (panel config) + optional screenshot
- Inquiry: from contact form — name, phone, email, message, wall dimensions, panel_names
- Both scoped to tenant
- Lead `status`: new → read → archived (or similar)

### Instagram Import
- OAuth flow: /admin/instagram/auth-url → redirect → /admin/instagram/callback stores token in Tenant
- Token refresh: POST /admin/instagram/refresh-token — updates instagram_access_token on Tenant
- Import: POST /admin/instagram/import — fetches recent posts, creates GalleryItems
- Token stored on Tenant model (instagram_access_token, instagram_token_expiry, instagram_user_id)

### Settings (Tenant)
- GET/PUT /admin/settings reads/writes: name, logo_url, primary_color, phone, email, address, whatsapp, instagram_url, facebook_url, tiktok_url, pinterest_url, domain
- primary_color is #RRGGBB hex — used as CSS variable on frontend
- logo_url served from r2.ts upload

## 8. Storage (r2.ts)

- All file writes through `uploadFile(buffer, folder, name, contentType)`
- If `R2_ACCOUNT_ID` not set → local disk fallback → `API_PUBLIC_URL/uploads/{folder}/{file}`
- If R2 configured → returns `R2_PUBLIC_URL/{folder}/{file}`
- Local disk is ephemeral on Render — files lost on restart (known limitation)
- `API_PUBLIC_URL` env var must be `https://wallcraft-api.onrender.com` in production

## 9. Prisma / DB

- `binaryTargets = ["native", "debian-openssl-3.0.x"]` in schema.prisma (Render runs Debian)
- New models must have `tenant_id String` with `@relation(fields: [tenant_id], references: [id])`
- Migrations: every schema change needs `prisma migrate dev --name=...`
- No N+1 queries — use `include` for relations
- `deleteMany` before `createMany` in seed scripts — idempotent re-runs

---

## Output Format

```
## Backend Review

### 🔴 CRITICAL
[file:line] — issue — why dangerous — exact fix

### 🟠 HIGH
[file:line] — issue — impact — fix

### 🟡 MEDIUM
[file:line] — issue — fix

### 🟢 LOW
[file:line] — suggestion

### ✓ Clean
[list: Security, Error handling, etc. — areas with zero findings]
```

No praise. No filler. Only findings. If nothing to report in a section, write ✓ Clean.
