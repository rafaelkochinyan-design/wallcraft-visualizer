# WallCraft Backend Skill

Use this skill when working on any backend task.

## Before writing any code

1. Check `docs/API_ROUTES.md` — does the route already exist?
2. Check `docs/DB_SCHEMA.md` — does the model/field already exist?
3. Check `backend/src/utils/` — is there already a shared utility for this?

## Adding a new route

```
1. Choose the right file:
   - Public (no auth): routes/public.ts or routes/content.ts
   - Admin (JWT required): routes/admin.ts or routes/adminContent.ts
   - Leads/orders: routes/leads.ts

2. Pattern for every handler:
   router.METHOD('/path', authMiddleware?, async (req, res, next) => {
     try {
       // validate with zod
       // query with prisma (ALWAYS include tenant_id)
       // return ok(res, data) or ok(res, data, 201)
     } catch (err) { next(err) }
   })

3. Update docs/API_ROUTES.md
```

## Prisma rules

```ts
// ALWAYS include tenant_id in every query
prisma.panel.findMany({ where: { tenant_id: req.tenant.id } })

// Multi-step operations MUST use $transaction
await prisma.$transaction(async (tx) => {
  await tx.panelSize.deleteMany({ where: { panel_id: id } })
  return tx.panel.update({ ... })
})

// After schema change:
npx prisma migrate dev --name descriptive-name
// Then update frontend/src/types/index.ts
```

## Response helpers

```ts
import { ok, fail } from '../utils/response'

ok(res, data)           // 200 { data }
ok(res, data, 201)      // 201 { data }
fail(res, 400, 'msg')   // 400 { error: { message } }
fail(res, 404, 'msg')   // 404 { error: { message } }
```

## Upload files

```ts
import { handleImageUpload } from '../utils/upload'

// Standard image (JPG/PNG/WebP, 10MB):
router.post('/upload-image', upload.single('file'), async (req, res, next) => {
  try { await handleImageUpload(req, res, 'folder-name') } catch (err) { next(err) }
})

// With options:
await handleImageUpload(req, res, 'logos', { allowSvg: true, maxBytes: 2 * 1024 * 1024 })
```

## Socket.io (real-time)

```ts
import { emitNewOrder } from '../utils/socket'

// After creating a lead:
emitNewOrder(lead)  // broadcasts 'new_order' event to all connected admin clients
```

## Auth middleware

```ts
router.use(authMiddleware)      // protect entire router
router.get('/path', authMiddleware, handler)  // protect single route
// Sets: req.user = { id, tenant_id, role }
```

## Key gotchas

- `fail(res, STATUS, message)` — status is 2nd param, message is 3rd
- All admin routes MUST have authMiddleware — check adminContent.ts uses `router.use(authMiddleware)` at top
- Tenant middleware runs globally — `req.tenant` is always set
- Never return `password_hash` in any response
- `ok()/fail()` are in `utils/response.ts`, NOT `lib/`
