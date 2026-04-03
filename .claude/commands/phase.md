# /phase — Continue from Current Phase

## Usage
`/phase` — resumes work from the next incomplete phase

## What this does

1. Read `wallcraft_expansion.md` from memory to get current phase status
2. Identify the NEXT incomplete phase
3. Load the plan file at `C:\Users\Siranush\.claude\plans\hazy-marinating-hartmanis.md`
4. Execute that phase fully following the workflow in `workflow.md`

## Phase Map

### Phase 2 — Database & API (NEXT)
Files to create/modify:
- `backend/prisma/schema.prisma` — add 9 new models
- `backend/src/routes/content.ts` — CREATE (public GET routes)
- `backend/src/routes/adminContent.ts` — CREATE (admin CRUD routes)
- `backend/src/routes/public.ts` — add GET /api/panels/:id
- `backend/src/index.ts` — mount new routes

Run after schema change:
```
cd D:\Wallcraft\wallcraft-visualizer\backend && npx prisma migrate dev --name add_content_models
```

### Phase 3 — Shared UI Components
Extract reusable components from existing inline code:
- `HeroCarousel.tsx` — from HomePage hero section
- `Lightbox.tsx` — from Gallery/ProjectDetail inline lightbox
- `ProductCard.tsx` — from HomePage/ProductsPage inline card
- `PageHero.tsx` — new, for inner page heroes
- `SectionTitle.tsx` — new, editorial heading
- `FilterChips.tsx` — from Gallery/Blog/Dealers inline chips
- `Pagination.tsx` — from BlogPage inline pagination

Add framer-motion animations to all section cards.

### Phase 4 — Admin Pages (replace stubs)
9 admin pages to implement fully. Each follows `PanelsPage.tsx` pattern.
Use `/frontend-design` for each page.

### Phase 5 — Polish
Animations, SEO, performance, mobile QA.
