# Agent: Backend
# Scope: backend/ — Express, Prisma, PostgreSQL, JWT, R2, multi-tenancy

## Моя зона ответственности
Всё в `backend/`. Я НЕ трогаю `frontend/`.

---

## Железные правила (нарушение = баг в продакшне)

### 1. tenant_id ВЕЗДЕ
```typescript
// Каждый запрос к tenant-scoped таблице:
const panels = await prisma.panel.findMany({
  where: { tenant_id: req.tenant.id }  // ← ОБЯЗАТЕЛЬНО
})

// Tenant-scoped: Panel, Accessory, User
// Глобальные: AccessoryType, Tenant
```

### 2. Никогда не возвращать password_hash
```typescript
// ✅
select: { id: true, email: true, role: true }

// ❌
const user = await prisma.user.findUnique(...)
return res.json(user)  // password_hash утечёт!
```

### 3. Всегда использовать ok()/fail()
```typescript
import { ok, fail } from '../utils/response'

ok(res, data)              // { data, error: null }
fail(res, 404, 'Not found') // { data: null, error: { message } }
```

### 4. Zod валидация на все входящие данные
```typescript
const schema = z.object({ name: z.string().min(1).max(100) })
const parsed = schema.safeParse(req.body)
if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
```

---

## Tenant Middleware (не трогать без крайней нужды)

```typescript
// Порядок резолюции:
// 1. Субдомен: wallcraft.domain.com → 'wallcraft'
// 2. Header: x-tenant-slug
// 3. Query param (dev only): ?store=wallcraft

// Результат: req.tenant = Tenant объект из БД
```

---

## Prisma Schema — ключевые модели

```
Tenant      — slug(unique), name, logo_url, primary_color
User        — tenant_id, email, password_hash, role
Panel       — tenant_id, name, texture_url, thumb_url, 500×500×19mm
AccessoryType — name(unique), label_ru  (глобальная, нет tenant_id)
Accessory   — tenant_id, type_id, name, model_url, scale
```

---

## API структура

```
GET  /health                     ← без tenant, для uptime monitoring
GET  /api/tenant                 ← branding по tenant
GET  /api/panels                 ← active panels
GET  /api/accessories            ← active accessories с type
GET  /api/accessory-types        ← global types

POST /admin/auth/login           ← без authMiddleware, с tenantMiddleware
POST /admin/auth/refresh         ← без authMiddleware
GET  /admin/auth/me              ← authMiddleware

/admin/* остальные               ← tenantMiddleware + authMiddleware

POST /admin/panels/upload-texture    ← multipart, max 5MB, jpg/png/webp
POST /admin/accessories/upload-model ← multipart, max 20MB, .glb only
POST /admin/settings/upload-logo     ← multipart, max 2MB
```

---

## R2 Upload

```typescript
// В dev (R2_ACCOUNT_ID === 'skip') — сохраняет в frontend/public/uploads/
// В prod — загружает в Cloudflare R2

// Всегда валидировать тип файла ДО upload
const ext = file.originalname.split('.').pop()?.toLowerCase()
if (ext !== 'glb') return fail(res, 400, 'Only .glb files allowed')
```

---

## Auth flow

```
Login → accessToken (15min, в body) + refreshToken (7d, httpOnly cookie + body)
Request → Authorization: Bearer <accessToken>
401 TOKEN_EXPIRED → POST /admin/auth/refresh → новый accessToken
```

---

## Чего НЕ делать

- НЕ создавать новые таблицы без `tenant_id` если данные per-tenant
- НЕ пропускать `.safeParse()` на body
- НЕ возвращать Prisma объект напрямую если там есть sensitive поля
- НЕ делать raw SQL без экранирования
- НЕ трогать `frontend/`
