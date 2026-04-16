# WallCraft Architecture Decisions

## Why these choices exist — read before changing anything

### Filter state in URL params (not useState)
ProductsPage uses `useProductFilters()` which reads/writes to URL.
Reason: shareable links, browser back/forward works, SEO-friendly.
**Never** move filter state to useState or Zustand.

### Tenant data flow
Public footer/contact page reads tenant from Zustand store (visualizer.ts).
Store is populated by `useTenant()` hook which calls `GET /api/tenant`.
After admin saves settings → `fetchTenant()` must be called to refresh store.
**Never** read tenant data from a separate direct API call in components.

### Panel images — no thumb_url on Panel
Panel cards use `panel.panelImages[0].url` (sort_order=0) as thumbnail.
Old `thumb_url` was migrated to PanelImage records.
**Never** add thumb_url back to Panel model.

### ZIP downloads instead of individual files
Panels have one `zip_url` field — contains all files (3D models, catalog).
Reason: simpler UX, one download button, files grouped logically.
**Never** add separate model_url or catalog_url fields back.

### Admin = Tailwind, Public = CSS variables
Admin pages use Tailwind utility classes (bg-white, text-sm, etc.).
Public pages use CSS custom properties (var(--accent), pub-* classes).
**Never** mix these — no Tailwind in public pages, no CSS vars in admin.

### Socket.io for real-time orders
New orders emit via Socket.io → admin LeadsPage updates without refresh.
Backend: httpServer (not app.listen) to support WebSocket upgrade.
Socket util: `backend/src/utils/socket.ts` — setIO() / emitNewOrder().
Frontend hook: `useOrderSocket(onNewOrder)` — connects on mount, listens for new_order.

### Orders go to /api/leads (not /api/inquiry)
Order Now form (OrderSheet.tsx) posts to `/api/leads` with wall_config.
`/api/inquiry` is the old contact-form endpoint — kept for backward compat.
Admin Orders page (LeadsPage) reads from `/admin/leads`.
**Never** route OrderSheet submissions to /api/inquiry.

### Armenian phone validation
Order form pre-fills +374 prefix — user cannot delete it.
Validation: /^(\+374|374|0)\d{8}$/ after stripping spaces/dashes.
Runs on blur and on submit as guard.

### Panel calculator formula
User enters wall area (m²) → system calculates:
- panels_base = Math.ceil(sqm / panelAreaM2)
- panels_extra = Math.ceil(panels_base × 0.1)  ← 10% for cuts/waste
- panels_total = panels_base + panels_extra
Formula is intentional — always shown explicitly in UI with breakdown.

### Backward compat: ?category= → ?category_id=
Old HomePage links used ?category=ID, new system uses ?category_id=ID.
ProductsPage has a useEffect that auto-redirects old URLs.
**Never** remove this backward compat logic.

## Known Limitations

- Instagram Basic Display API tokens expire in 60 days — auto-refresh job runs daily at 3am
- Render free tier filesystem is ephemeral — all uploads must go to Cloudflare R2
- Pinterest has no public API for reading posts — manual gallery upload only
- WebSocket (Socket.io) requires Render paid plan for persistent connections
