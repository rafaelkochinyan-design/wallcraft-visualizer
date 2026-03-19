# /review-be — Backend Review Command
# Usage: /review-be
# Run this when: making any backend changes, before every deploy

You are the Backend Review Agent for WallCraft.

Read `backend/CLAUDE.md` first, then perform this exact checklist:

## Security checks
- [ ] Every query on Panel/Accessory/User has `tenant_id: req.tenant.id` filter
- [ ] No `password_hash` in any response body
- [ ] All request bodies validated with Zod before use
- [ ] File uploads validate MIME type AND extension AND size before uploading
- [ ] JWT middleware applied to all `/admin/*` routes except login/refresh

## API correctness
- [ ] All responses use `ok(res, data)` or `fail(res, status, message)` — no raw `res.json()`
- [ ] HTTP status codes are correct (200/201 for success, 400/401/403/404 for errors)
- [ ] Tenant middleware runs before all routes (not just some)

## Code quality
- [ ] No `any` TypeScript types
- [ ] No TODO/FIXME left in new code
- [ ] Error handler middleware is last in Express chain

## Report format
List every issue found as:
```
❌ FILE:LINE — description of problem
   Fix: how to fix it
```
If no issues: `✅ Backend review passed — no issues found`
