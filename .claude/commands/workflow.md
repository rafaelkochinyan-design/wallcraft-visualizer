# WallCraft — Full Development Workflow

## Usage
`/workflow "what you want to build"`

## The 6-Stage Pipeline

When user describes a task, execute ALL stages in order:

---

### STAGE 1 — LOAD CONTEXT
Before anything else:
1. Read `CLAUDE.md` in project root
2. Read memory file `wallcraft_expansion.md` from memory directory
3. Identify which phase we're in (Phase 1 done, Phase 2 next)
4. Check which files are relevant to the task

---

### STAGE 2 — PLAN `/plan`
Use the **Plan subagent** to design the implementation:
- Describe what needs to be built
- Include: relevant existing files, patterns to reuse, constraints from CLAUDE.md
- Wait for plan output
- Present plan to user and **WAIT FOR APPROVAL** before coding

Key questions before coding:
- Does this touch the 3D scene? → Don't break `scene/` components
- Does this need a new DB model? → Plan migration
- Does this add a public page? → Use PublicLayout + CSS variables (no Tailwind)
- Does this add an admin page? → Use Tailwind (admin.css pattern)
- Does this need localization? → Use LocalizedString + useLocalized hook

---

### STAGE 3 — CODE

**For frontend UI components or pages:**
Use `/frontend-design` skill to generate polished, production-grade UI.
- Describe the component clearly
- Include design tokens from `tokens.css` (accent: #c4622d, font: DM Sans)
- Specify: dark mode support, mobile responsive, CSS variables only (no Tailwind for public)

**For backend routes/services:**
Write directly following patterns in `backend/src/routes/` (see `public.ts` + `admin.ts` for examples).
Always:
- Filter by `tenant_id: req.tenant.id`
- Use `ok(res, data)` and `fail(res, status, msg)`
- Validate with Zod

**For 3D scene changes:**
Read `backend/CLAUDE.md` agent context first. Never call `useThree` outside Canvas.

---

### STAGE 4 — REVIEW
Use `/review` skill after writing code:
- Check for missing tenant_id filters (security)
- Check for hardcoded colors (should use CSS variables)
- Check for Tailwind in public pages (not allowed)
- Check panel material color is #ffffff (never change)
- Check no useThree/useFrame outside Canvas

---

### STAGE 5 — SIMPLIFY
Use `/simplify` skill to clean up:
- Remove duplicate logic
- Extract reusable pieces
- Check component size (>200 lines → split)

---

### STAGE 6 — BUILD VERIFY
Always run before declaring done:
```
powershell -Command "cd 'D:\Wallcraft\wallcraft-visualizer\frontend'; npx vite build" 2>&1 | tail -3
```
Must show `✓ built in` with no errors. Fix any TypeScript errors before finishing.

---

## Quick Reference — Which Skill for What

| Situation | Use |
|-----------|-----|
| Starting a new feature | `/plan` first |
| Building any UI component or page | `/frontend-design` |
| After writing code | `/review` then `/simplify` |
| Code feels bloated/complex | `/simplify` |
| Deploying to production | `/deploy` |
| Something repeating/polling needed | `/loop` |

---

## Phase Status (update this as phases complete)

- [x] Phase 1 — Foundation & Routing ✅ DONE (2026-04-02)
- [ ] Phase 2 — Database & API ⏳ NEXT
- [ ] Phase 3 — Shared UI Components
- [ ] Phase 4 — Admin Pages (real implementations)
- [ ] Phase 5 — Polish & Animations
