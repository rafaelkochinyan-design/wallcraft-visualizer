# WallCraft Frontend Review Checklist

Stack: React 18 + Vite + TypeScript + React Router v6 + Zustand + Framer Motion + i18next  
Project: Multi-tenant SaaS wall panel visualizer + full product website.

## Severity
🔴 CRITICAL — React rules violation, crash, security hole, SPA navigation broken
🟠 HIGH — incorrect behavior, broken UI, wrong API shape, hooks misuse
🟡 MEDIUM — performance issue, bad pattern, tech debt
🟢 LOW — style, minor improvement

---

## 1. React Rules of Hooks

- No hooks called after conditional early returns (useMemo, useEffect, useState must all be before any `if (...) return`)
- No hooks inside loops, conditions, or nested functions
- No hooks inside factory functions like `columns()` or event handlers
- useEffect cleanup always returned (clearTimeout, abort controller, event listener removal)
- useEffect dependencies array correct — no stale closures, no missing deps
- useMemo dependencies correct — doesn't recompute unnecessarily

## 2. Routing and SPA Navigation

- Animated links: `const MotionLink = motion(Link)` → `<MotionLink to={...}>` — NEVER `<motion.a href>` (causes full page reload, breaks SPA)
- All internal links use React Router `<Link to>` or `useNavigate()` — not `window.location.href` or `<a href>`
- Route params via `useParams()` — not manual `location.pathname.split('/')`
- `/visualizer` route has no PublicLayout wrapper (intentional — full screen, scroll-locked via `body.visualizer-mode`)
- All public routes wrapped in PublicLayout (Navbar + Footer)
- AnimatedRoutes in App.tsx uses `animKey = '/' + location.pathname.split('/')[1]` — not `location.pathname` (prevents AdminLayout remount on every /admin/* nav)

## 3. Data Fetching

- `usePublicData` hook used for all public page data fetching
- AbortController or cancel flag in useEffect → prevents `setState` after unmount (memory leak)
- API response shape guarded: `Array.isArray(payload) ? payload : (payload?.data ?? [])` for /api/panels
- Error state shown to user — not just console.error
- Loading state displayed while fetching
- No fetch calls in render body — only in useEffect or custom hooks
- ProductDetailPage: AbortController passed as `signal` to api.get

## 4. API Client (api.ts)

- All HTTP calls use `api` from `../../lib/api` — no raw `fetch()` or direct `axios` imports
- No `localStorage.getItem('token')` — in-memory tokenStore only
- No hardcoded API URLs — only `VITE_API_URL` env var
- `withCredentials: true` — required for httpOnly refresh token cookie cross-domain

## 5. State Management (Zustand)

- Current store fields: `tenant`, `setTenant`, `availablePanels`, `setAvailablePanels` — nothing else
- No code referencing removed fields: `setAvailableAccessories`, `wallColor`, `setWallColor`, `wallWidth` etc.
- `useTenant()` called in PublicLayout — not duplicated in every page (guard prevents double fetch)
- After any store change, grep `useVisualizerStore` for stale references
- Store never directly mutated — always via setters

## 6. Localization (Critical Pattern)

- `useLocalized()` hook used for ALL LocalizedString fields from DB (hero headlines, blog titles, designer bios, etc.)
- `i18n.language` ALWAYS `.slice(0, 2)` before using as object key — browser returns 'am-AM' not 'am'
- `useTranslation()` / `t()` used for static UI strings (nav labels, button text, form labels)
- No hardcoded strings in any language — all UI text via i18n keys
- LocalizedString fields never accessed as `obj[i18n.language]` directly
- Language stored in `localStorage('wc-lang')` — checked on init

## 7. TypeScript

- All types imported from `frontend/src/types/index.ts` — no inline re-definitions
- `LocalizedString` typed as `{ en: string, ru: string, am: string }` — not `any`
- MotionValue in style: `style={{ rotateX: v } as unknown as CSSProperties}` (required cast)
- No `@ts-ignore` without explanation comment
- No `as any` without justification
- `npx tsc --noEmit` produces zero errors

## 8. WallCraft Business Logic (Frontend)

### Public pages
- /products: filters via URL params (search, category_id, collection_id, sort, price_min, price_max, page)
- /products/:id: fetch `/api/panels/:id`, show gallery crossfade, sticky price bar, breadcrumb (Home → Products → name)
- /gallery: space_type filter chips (living_room, bedroom, office, hotel, restaurant, bathroom)
- /blog: paginated, ?page= and ?category= filter
- /designers/:slug, /projects/:slug: fetch by slug not id
- /contact: form submits to POST /api/inquiry

### Tenant-driven UI
- Footer social icons (Instagram, Pinterest, Facebook, TikTok, WhatsApp) only show if Tenant field is non-null
- `--tenant-primary` CSS variable set from `tenant.primary_color` (#D4601A for WallCraft)
- Logo in navbar from `tenant.logo_url`
- If useTenant not called before render: tenant=null → footer blank, no colors

### Admin pages
- All admin forms use `adminUtils.tsx` exports: Field, Modal, ModalActions, FileUpload, PageShell, StatusBadge, TableActions
- `useToast()` from adminUtils for notifications — not raw sonner calls
- `emptyLocale()` for initializing LocalizedString fields: `{ ru: '', en: '', am: '' }`
- `LocaleTabs` for switching between language tabs on multi-language fields
- Confirm dialog before delete
- Save button disabled while `saving === true`
- Uploads use `uploadImage(file, endpoint, onError)` from adminUtils

### Collections admin
- Panel picker: checkbox list of all panels, stores selected as `string[]` of Panel.id
- `panel_ids ?? []` guard — API may return null for new collections

### Hero slides
- @dnd-kit drag reorder — calls PATCH /admin/hero-slides/reorder with new id order
- LocaleStr tabs for headline/subheadline/cta_label

### Gallery admin
- BulkDropzone (react-dropzone) above table: uploads N images sequentially, shows progress bar
- Single item CRUD modal: image upload, caption, space_type select, tags, sort_order, active

### ProductCard
- 3D tilt via framer-motion: `tiltX`, `tiltY`, `scale`, `liftY` springs
- `index` prop controls `--card-index` CSS var for stagger delay
- `MotionLink` wraps entire card — whole card is clickable with SPA navigation

## 9. CSS Architecture

- **Public pages** (`/`, `/products`, `/gallery`, etc.): ONLY `public.css` + `tokens.css` — NO Tailwind
- **Admin pages** (`/admin/*`): Tailwind classes only — no inline styles where class exists
- **CSS variables**: `--tenant-primary`, `--color-*`, `--space-*` from `tokens.css`
- `body.visualizer-mode`: locks scroll, hides scrollbar — only on /visualizer
- No inline styles where a CSS class already exists
- All scroll animations use `.pub-reveal` + IntersectionObserver or FadeIn component — not CSS animations on mount

## 10. Components (Don't Break)

- `FadeIn.tsx` / `StaggerChildren`: scroll-triggered — don't add extra animation wrappers around them
- `HeroCarousel.tsx`: self-contained, uses `useLocalized()` internally
- `Lightbox.tsx`: portal-based — must be rendered at top of component tree
- `PageMeta.tsx`: `react-helmet-async` — `HelmetProvider` is in main.tsx
- `Icon.tsx`: only these names valid: search, close, chevron-down, chevron-left, chevron-right, grid, list, check, price, filter, reset
- `ErrorBoundary.tsx`: wraps ProductDetailPage and other async-heavy pages
- `Pagination.tsx`: returns null if `pages <= 1` — don't render it conditionally yourself

## 11. 3D Visualizer (DO NOT TOUCH unless explicitly asked)

- `frontend/src/scene/` — WallMesh, PanelTiling, Scene — off limits
- `frontend/src/store/visualizer.ts` — only touch if asked, grep all usages after any change
- Panel InstancedMesh material color MUST be `#ffffff`
- wallColor only on background plane — never on panel mesh
- InstancedMesh always has `key` prop with dimension + URL deps

## 12. Performance

- All public pages lazy-loaded via `React.lazy + Suspense` in App.tsx (code splitting)
- No anonymous functions or objects created in JSX prop (causes re-renders)
- `useCallback` on handlers passed as props to child components
- `useMemo` for expensive computations (position arrays, filtered lists)
- List items keyed by stable `id` — not index (causes reconciliation issues)

## 13. Security

- No JWT token in localStorage — tokenStore (in-memory) only
- No sensitive data in URL params
- No `dangerouslySetInnerHTML` with user content
- No user input in `style` attributes (CSS injection)
- Environment variables only via `import.meta.env.VITE_*`

---

## Output Format

```
## Frontend Review

### 🔴 CRITICAL
[file:line] — issue — why dangerous — exact fix

### 🟠 HIGH
[file:line] — issue — impact — fix

### 🟡 MEDIUM
[file:line] — issue — fix

### 🟢 LOW
[file:line] — suggestion

### ✓ Clean
[list: Hooks, Routing, Localization, etc. — areas with zero findings]
```

No praise. No filler. Only findings. If nothing to report in a section, write ✓ Clean.
