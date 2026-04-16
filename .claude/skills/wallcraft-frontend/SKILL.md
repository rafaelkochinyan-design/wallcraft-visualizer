# WallCraft Frontend Skill

Use this skill when working on any frontend task.

## Before writing any code

1. Check if the component already exists in `frontend/src/components/`
2. Check if there's already a hook for this in `frontend/src/hooks/`
3. Check `types/index.ts` — does the interface already exist?

## Adding a new public page

```
1. Create frontend/src/pages/public/NewPage.tsx
2. Add route in App.tsx (React Router v6 <Route> syntax, lazy import)
3. Add nav link in PublicNavbar.tsx if needed
4. Add <PageMeta> component at top of page
5. Add i18n keys to en.json, ru.json, am.json
```

## Adding a new admin page

```
1. Create frontend/src/pages/admin/AdminNewPage.tsx
2. Follow pattern: PageShell → table → Modal → Field inputs → ModalActions
3. Import from adminUtils: PageShell, Modal, ModalActions, Field, FileUpload, useToast, TableActions, StatusBadge
4. Add NavLink in AdminLayout.tsx sidebar
5. Add route in App.tsx under /admin/* routes
```

## Adding i18n keys

Always add to ALL THREE files in the same commit:
- `frontend/src/i18n/locales/en.json`
- `frontend/src/i18n/locales/ru.json`
- `frontend/src/i18n/locales/am.json`

## Mobile checklist (375px)

- [ ] Input font-size ≥ 16px (prevents iOS zoom)
- [ ] Buttons min 44px height (touch targets)
- [ ] No horizontal overflow
- [ ] Filter chips: `overflow-x: auto; flex-wrap: nowrap; flex-shrink: 0`
- [ ] Grid collapses to 1 column: `grid-template-columns: 1fr`
- [ ] Modals: centered on desktop, bottom-sheet on mobile

## TypeScript rules

```ts
// ❌ Wrong
catch (err: any) { }
const where: any = {}

// ✅ Right
catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown error'
}
const where: Prisma.PanelWhereInput = {}
```

## CSS pattern

```tsx
// ❌ Wrong — hardcoded color
<div style={{ color: '#D4601A' }}>

// ✅ Right — CSS variable
<div style={{ color: 'var(--accent)' }}>

// ❌ Wrong — Tailwind in public page
<div className="text-orange-600">

// ✅ Right — CSS class
<div className="pub-card__price">
```

## Key gotchas

- `useLocalized()` returns a function: `const localized = useLocalized(); localized(field)`
- `useTenant()` must be called in PublicLayout — not in individual pages
- `/api/panels` response: `Array.isArray(payload) ? payload : (payload?.data ?? [])` guard required
- `MotionLink = motion(Link)` NOT `motion.a` — prevents full page reload
- `store/visualizer.ts` only has `tenant` + `availablePanels` — no wall/accessory state
- OrderSheet posts to `/api/leads`, not `/api/inquiry`
