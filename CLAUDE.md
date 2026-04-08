# WallCraft — Claude Code Workflow

> **Read this file at the start of EVERY task before writing any code.**
> This is the single source of truth for how work gets done in this project.

---

## 🏗 Project Architecture

```
wallcraft/
├── frontend/                  # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/        # Public-facing pages
│   │   │   └── admin/         # Admin panel pages
│   │   ├── components/
│   │   │   ├── ui/            # Reusable UI (FadeIn, FilterChips, Pagination, Lightbox...)
│   │   │   ├── layout/        # PublicNavbar, PublicFooter, PublicLayout, AdminLayout
│   │   │   └── products/      # Product-specific components
│   │   ├── hooks/             # usePublicData, useLocalized, useTenant, useProductFilters...
│   │   ├── store/             # Zustand: visualizer.ts, theme.ts
│   │   ├── i18n/              # en.json, ru.json, am.json
│   │   ├── types/             # index.ts — all shared TypeScript interfaces
│   │   └── styles/            # CSS variables, pub-* classes, admin.css
├── backend/                   # Node.js + Express + Prisma + PostgreSQL
│   ├── src/
│   │   ├── routes/            # admin.ts, public.ts, auth.ts
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # auth, error handling
│   │   └── lib/               # prisma client, helpers
│   └── prisma/
│       └── schema.prisma      # Source of truth for DB schema
└── CLAUDE.md                  # ← You are here
```

## 🔑 Key Conventions

### Frontend
- **CSS**: Use existing `pub-*` CSS variables and classes. Never hardcode colors — use `var(--accent)`, `var(--ui-bg)`, `var(--text-primary)` etc.
- **Translations**: Every user-facing string goes through `t('key')`. Always add keys to ALL 3 files: `en.json`, `ru.json`, `am.json`
- **Localized DB content**: Use `useLocalized()` hook + `localize(field)` — never access `.ru` / `.en` / `.am` directly in components
- **Data fetching**: Use `usePublicData<T>(url, params?)` for public pages. Use `api.get/post/put/delete` directly when you need manual control (filters, mutations)
- **State in URL**: Filter/search/sort state goes in URL params via `useSearchParams` — not `useState`. See `useProductFilters.ts` as reference
- **Admin pages**: Follow pattern from `adminUtils.tsx` — use `PageShell`, `Modal`, `Field`, `useToast` (sonner), `TableActions`, `StatusBadge`
- **No form tags in React**: Use `onClick` handlers, not HTML `<form>` submit where possible in admin modals

### Backend
- **Response shape**: Always `{ data: T }` for single, `{ data: T[], meta?: {...} }` for lists
- **Error shape**: `{ error: { message: string, code?: string } }`
- **Auth**: Admin routes require JWT middleware. Public routes are open
- **Prisma**: Always use `$transaction` when doing count + fetch together
- **Migrations**: After schema changes always run `npx prisma migrate dev --name <description>`

### TypeScript
- No `any` types. If unknown, use `unknown` and narrow it
- All DB models have matching interfaces in `frontend/src/types/index.ts`
- After adding backend fields, always update the frontend `Tenant`/`Panel`/etc interface

---

## ✅ MANDATORY WORKFLOW — Follow Every Step

### PHASE 1 — PLAN (before writing any code)
```
1. Read the relevant existing files before touching anything
2. State the plan in a numbered list:
   - What files will be created
   - What files will be modified  
   - What DB changes are needed (if any)
   - Any breaking changes or risks
3. Wait — do not start coding until plan is clear
```

### PHASE 2 — CODE
```
1. Backend changes first (schema → migration → route → controller)
2. Frontend types second (update interfaces to match new backend)
3. Frontend logic third (hooks, state)
4. Frontend UI last (components, pages)
5. i18n keys — add to ALL 3 locale files as the final step
```

### PHASE 3 — SELF-REVIEW
After writing code, review it yourself before finishing:
```
□ No hardcoded strings — all go through t()
□ No hardcoded colors — all use CSS variables
□ No 'any' types
□ New Prisma fields added to frontend types/index.ts
□ All 3 locale files updated (en/ru/am)
□ No console.log left in code
□ Error states handled (try/catch, loading states)
□ Mobile breakpoints considered (max-width: 768px)
□ No duplicate code — reuse existing components/hooks
```

### PHASE 4 — LINT & FORMAT
Run these commands and fix ALL errors before finishing:
```bash
# Frontend
cd frontend
npx eslint src --ext .ts,.tsx --fix
npx prettier --write src

# Backend  
cd backend
npx eslint src --ext .ts --fix
npx prettier --write src
```

### PHASE 5 — TYPE CHECK
```bash
cd frontend && npx tsc --noEmit
cd backend && npx tsc --noEmit
```
Fix every TypeScript error. Zero errors required.

### PHASE 6 — TEST (if tests exist)
```bash
cd backend && npm test
```

### PHASE 7 — DEPLOY CHECK
```bash
# Build frontend — must succeed with zero errors
cd frontend && npm run build

# Verify backend starts
cd backend && npm run build
```

Only report task as done when ALL phases pass ✅

---

## 🚫 Never Do These Things

- Never use `any` type
- Never hardcode user-facing text (must use `t()`)
- Never hardcode colors (must use CSS variables)  
- Never access `.ru`/`.en`/`.am` directly — use `localize()`
- Never skip updating all 3 locale files
- Never leave `console.log` in committed code
- Never modify `pub-*` CSS class names (other components depend on them)
- Never break the existing `?category=ID` → `?category_id=ID` backward compat
- Never add frontend Zustand store state for things that belong in URL params
- Never run migrations without a descriptive name: `--name add_tenant_social_fields`

---

## 📦 Tech Stack Reference

| Layer | Tech |
|-------|------|
| Frontend framework | React 18 + Vite + TypeScript |
| Styling | CSS custom properties (no Tailwind in public pages), Tailwind in admin |
| State | Zustand (visualizer, theme) + URL params (filters) |
| i18n | i18next + react-i18next (3 langs: en, ru, am) |
| Routing | React Router v6 |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (access token in memory via tokenStore) |
| File uploads | Multipart → stored in /uploads |
| Toasts | Sonner (admin) |
| Animations | Custom FadeIn/StaggerChildren components |

---

## 🗂 Component Quick Reference

| Need | Use |
|------|-----|
| Fetch public data | `usePublicData<T>(url, params?)` |
| Localize DB string | `useLocalized()` → `localize(field)` |
| Filter state in URL | `useProductFilters()` or same pattern |
| Admin page wrapper | `<PageShell title addLabel onAdd loading>` |
| Admin modal | `<Modal title onClose wide?>` + `<ModalActions>` |
| Admin form field | `<Field label>` |
| Admin file upload | `<FileUpload url uploading accept onFile>` |
| Admin toast | `const [, showToast] = useToast()` |
| Admin locale tabs | `<LocaleTabs lang onChange>` |
| Filter chips (public) | `<FilterChips options value onChange>` |
| Pagination (public) | `<Pagination page pages onChange>` |
| Lightbox | `<Lightbox items index onClose onChange>` |
| Skeleton loader | `<div className="pub-skeleton" style={{height, width}}>` |
| Fade animation | `<FadeIn delay? direction?>` |
| Stagger animation | `<StaggerChildren className baseDelay>` |

---

## 🌐 API Routes Reference

### Public
```
GET  /api/panels              ?q, category_id, sort, min_price, max_price, page, limit
GET  /api/panels/:id
GET  /api/panel-categories
GET  /api/hero-slides
GET  /api/blog                ?page, limit, category
GET  /api/blog/:slug
GET  /api/projects
GET  /api/projects/:slug
GET  /api/gallery             ?space_type
GET  /api/designers
GET  /api/designers/:slug
GET  /api/dealers
GET  /api/partners
GET  /api/team
GET  /api/pages/:key
POST /api/inquiry
```

### Admin (JWT required)
```
GET/PUT         /admin/settings
POST            /admin/settings/upload-logo
GET/POST        /admin/panels
PUT/DELETE      /admin/panels/:id
GET/POST        /admin/hero-slides
PUT/DELETE      /admin/hero-slides/:id
PATCH           /admin/hero-slides/reorder
GET/POST        /admin/blog
PUT/DELETE      /admin/blog/:id
PATCH           /admin/blog/:id/publish
GET/POST        /admin/gallery
PUT/DELETE      /admin/gallery/:id
GET/POST        /admin/projects
PUT/DELETE      /admin/projects/:id
GET/POST        /admin/designers
PUT/DELETE      /admin/designers/:id
GET/POST        /admin/dealers
PUT/DELETE      /admin/dealers/:id
GET/POST        /admin/partners
PUT/DELETE      /admin/partners/:id
GET/POST        /admin/team
PUT/DELETE      /admin/team/:id
GET/PUT         /admin/pages/:key
GET             /admin/leads
PATCH           /admin/leads/:id
POST            /admin/auth/login
POST            /admin/auth/refresh
GET             /admin/auth/me
```
