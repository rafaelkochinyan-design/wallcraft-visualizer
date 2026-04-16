# WallCraft

Premium 3D gypsum wall panel platform.
**Vite + React Router v6** frontend (NOT Next.js). Node.js + Express + Prisma + PostgreSQL backend.
Deployed: Vercel (FE) + Render (BE) + Cloudflare R2 (files).

## Commands
```bash
cd frontend && npm run dev && npm run build && npx tsc --noEmit
cd backend  && npm run dev && npm run build && npx tsc --noEmit
npx prisma migrate dev --name <description>   # always descriptive name
npx prisma studio                              # view/edit DB
```

## Structure
```
frontend/src/
  pages/public/        # ProductsPage, ContactPage, GalleryPage...
  pages/admin/         # LeadsPage(=Orders), StoreSettingsPage, PanelsPage...
  components/ui/       # FadeIn, FilterChips, Pagination, Lightbox, Icon, ErrorBoundary
  components/layout/   # PublicNavbar, PublicFooter, PublicLayout
  components/products/ # ProductCard, OrderSheet
  hooks/               # usePublicData, useLocalized, useTenant, useProductFilters, useOrderSocket
  store/               # visualizer.ts (tenant+panels), theme.ts
  i18n/                # en.json ru.json am.json — ALL 3 always
  types/index.ts       # ALL shared interfaces — update after schema changes
  styles/public.css    # pub-* classes and CSS variables

backend/src/
  routes/              # admin.ts, adminContent.ts, public.ts, content.ts, leads.ts, instagram.ts
  middleware/          # auth.ts, tenant.ts, errorHandler.ts
  services/            # r2.ts (Cloudflare R2 uploads)
  utils/               # prisma.ts, response.ts (ok/fail), upload.ts, socket.ts
  jobs/                # instagramRefresh.ts
  scripts/             # one-time migration scripts
prisma/schema.prisma   # DB source of truth
.claude/               # hooks, settings, skills
docs/                  # API_ROUTES.md, DB_SCHEMA.md, DECISIONS.md
```

## Hard Rules

**Never:**
- Use `any` type → use `unknown`, narrow properly
- Hardcode colors → use CSS variables
- Hardcode user strings → use `t('key')`
- Access `.ru/.en/.am` directly → use `localize(field)`
- Use Next.js patterns (getServerSideProps, next/image, next/link)
- Rename `pub-*` CSS classes
- Leave `console.log` in code
- Skip `npm run build` at end of task

**Always:**
- Update ALL 3 locale files (en/ru/am) when adding i18n keys
- Update `types/index.ts` after Prisma schema changes
- Test mobile at 375px width
- Use `font-size: 16px` minimum on inputs (prevents iOS zoom)
- Run `npx tsc --noEmit` after each file change

## CSS Variables
```
--accent           orange — prices, primary CTAs, active nav links
--accent-purple    purple — category chips/tags, filter active state, pagination
--accent-gold      gold — hero CTAs on dark backgrounds ONLY
--ui-bg            page background
--ui-surface       card/section background
--ui-border        borders
--text-primary     headings
--text-secondary   body text
--text-muted       placeholders, captions
```

## API Response Shape
```ts
Single:  { data: T }
List:    { data: T[], meta?: { total, page, limit, totalPages } }
Error:   { error: { message: string, code?: string } }
```

## Data Flow
```
Tenant data:  GET /api/tenant → Zustand store (visualizer.ts) → PublicFooter/ContactPage
              After admin save → call fetchTenant() to refresh store instantly

Public pages: usePublicData<T>(url, params?) → backend → Prisma → PostgreSQL
Panel filters: useProductFilters() reads/writes URL params → GET /api/panels?q=...
Orders:       POST /api/leads → Lead in DB → Socket.io emits → admin LeadsPage updates live
```

## Component Quick Reference
```
usePublicData<T>(url, params?)    fetch public API data with loading/error
useLocalized() → localize(field)  localize LocalizedString from DB
useProductFilters()               all filter state in URL params
useOrderSocket(onNewOrder)        WebSocket for real-time orders in admin

<PageShell title addLabel onAdd loading>   admin page wrapper
<Modal title onClose wide?>                admin modal
<ModalActions onClose saving>              admin save/cancel buttons
<Field label>                              admin form field wrapper
<FileUpload url uploading onFile>          admin file upload
useToast() → [, showToast]                admin sonner toast
<Icon name size>                           SVG icons (search/close/chevron-down/grid/list/filter/reset/phone/email/location)
<FadeIn delay? direction?>                 scroll reveal animation
<StaggerChildren className baseDelay>      stagger animation for grids
<FilterChips options value onChange>       horizontal scrollable filter chips
<Pagination page pages onChange>           page navigation
<Lightbox items index onClose onChange>    fullscreen image viewer
<ErrorBoundary>                            wraps public routes
pub-skeleton                               loading skeleton div
```

## Admin Patterns
- Admin uses **Tailwind** CSS classes
- Public uses **CSS variables** (`pub-*` classes)
- All admin pages follow: `PageShell` → table → `Modal` → `Field` inputs → `ModalActions`
- Toast: always use sonner via `useToast()` — never custom useState toast
- File uploads: POST multipart to `/admin/X/upload-Y` → returns `{ data: { url } }`

## Workflow — Follow Every Task
1. Read relevant existing files first
2. Plan: files to change, DB migrations needed, risks
3. Execute: backend → types → hooks → UI → i18n
4. TypeCheck: `npx tsc --noEmit` (zero errors)
5. Build: `npm run build` must pass

@docs/API_ROUTES.md
@docs/DB_SCHEMA.md
@docs/DECISIONS.md
