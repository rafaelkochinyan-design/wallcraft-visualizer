# /fix — Bug Fix Command
# Usage: /fix <description of problem>
# Systematically diagnose and fix bugs in WallCraft

You are the Bug Fix Agent for WallCraft.

## Step 1 — Classify the bug

Based on the description, determine which layer is affected:

| Symptom | Likely layer | Agent to use |
|---------|-------------|--------------|
| Black/empty canvas, WebGL error | 3D Scene | read agents/3d-scene/CLAUDE.md |
| "useThree called outside canvas" | 3D Scene | Canvas boundary violation |
| Panels not tiling / performance | 3D Scene | InstancedMesh issue |
| Tooltip wrong position / not dragging | UI | read agents/ui/CLAUDE.md |
| Toast not showing | UI | Sonner not mounted or wrong import |
| 401/403 from API | Backend | auth middleware issue |
| "Tenant not found" | Backend | tenant resolver issue |
| DB returning all tenants' data | Backend | missing tenant_id filter |
| TypeScript error in component | Depends on file path |

## Step 2 — Read the relevant CLAUDE.md

Based on classification:
- 3D bug → read `agents/3d-scene/CLAUDE.md`
- UI bug → read `agents/ui/CLAUDE.md`
- Backend bug → read `backend/CLAUDE.md`
- Admin bug → read `agents/admin/CLAUDE.md`

## Step 3 — Diagnose

Check the most common mistakes for that layer:

**3D bugs:**
- `useThree` outside Canvas → move inside or use Zustand
- Individual meshes for tiles → replace with InstancedMesh
- Texture not updating → add `needsUpdate = true`
- `preserveDrawingBuffer` missing → add to Canvas gl props

**UI bugs:**
- Hardcoded colors → replace with `var(--c-*)`
- Raw `<button>` → replace with `<Button>`
- Tooltip not dragging → check store has `tooltipPosition` + `setTooltipPosition`
- Screenshot not working → check `pendingSave` in store + `<SaveSceneWirer>` in Canvas

**Backend bugs:**
- Missing `tenant_id` → add `where: { tenant_id: req.tenant.id }`
- 401 on admin route → check authMiddleware order
- CORS error → check `CORS_ORIGIN` env var matches frontend URL exactly
- File upload 400 → check mime type validation

## Step 4 — Fix and verify

After making the fix:
1. Run the relevant review command:
   - `/review-3d` for scene fixes
   - `/review-be` for backend fixes
   - `/review-ui` for UI fixes

2. Test manually:
   - Open http://localhost:5173
   - Reproduce the original bug scenario
   - Confirm it's fixed

3. Check for regressions:
   - If 3D fix: verify panels still tile, accessories still drag
   - If backend fix: verify tenant isolation still works
   - If UI fix: verify other steps still work

## Step 5 — Report
```
Bug: <original description>
Root cause: <what was wrong>
Fix: <what was changed>
Files modified: <list>
Verified: <how you confirmed it's fixed>
```
