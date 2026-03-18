# Agent: Admin Panel

## My scope
`/frontend/src/pages/admin/` и `/frontend/src/components/admin/`

## Routes
```
/admin              → redirect to /admin/panels
/admin/login        → LoginPage (no auth required)
/admin/panels       → PanelsPage
/admin/accessories  → AccessoriesPage
/admin/settings     → StoreSettingsPage
```

## Auth pattern
```typescript
// Store access token in memory (NOT localStorage)
let accessToken: string | null = null

// After login:
accessToken = response.data.accessToken
// refreshToken is set in httpOnly cookie automatically

// On 401: try /admin/auth/refresh → get new accessToken
// If refresh fails: redirect to /admin/login
```

## Page: PanelsPage
- Table with columns: thumbnail, name, sku, price, active toggle, actions (edit/delete)
- "Добавить панель" button → opens modal/drawer
- Modal fields: name, sku, price, active checkbox, texture upload, thumb upload
- Texture upload: drag & drop или click, shows preview, sends to POST /admin/panels/upload-texture
- Edit: same modal prefilled
- Delete: confirm dialog, then DELETE /admin/panels/:id

## Page: AccessoriesPage
- Table: thumbnail, name, type, scale, active toggle, actions
- "Добавить аксессуар" button → modal
- Modal fields: name, type (dropdown), scale (0.1-5.0), .glb upload, thumb upload
- .glb upload: shows filename after upload, sends to POST /admin/accessories/upload-model

## Page: StoreSettingsPage
- Logo upload (shows current logo preview)
- Store name input
- Primary color: input type="color" + hex input
- Save button

## Styling
- Use Tailwind only
- Simple and clean — this is internal tool, not customer-facing
- Table rows: hover highlight
- Modals: centered overlay with backdrop
- Toast notifications for success/error (use a simple state-based toast, no library needed)

## CRITICAL RULES
1. ALL admin API calls: include `Authorization: Bearer ${accessToken}` header
2. ALL file uploads: use multipart/form-data (FormData)
3. Show loading spinners during API calls
4. Validate file types client-side before uploading:
   - Textures: jpg, png, webp only
   - Models: .glb only
   - Logo: jpg, png, webp only
5. After CRUD operations: refetch the list (don't manually update local state)
6. Tenant context: same subdomain/query-param mechanism as visualizer
