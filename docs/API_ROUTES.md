# WallCraft API Routes

## Public Routes (no auth)

```
GET  /api/tenant
GET  /api/panels              ?q, category_id, collection_id, sort, min_price, max_price, page, limit
GET  /api/panels/:id
GET  /api/panel-categories
GET  /api/collections
GET  /api/collections/:slug
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
POST /api/inquiry             { name, phone, message, order_data? }
POST /api/leads               { name, phone, comment?, wall_config }
```

## Admin Routes (JWT required)

```
# Auth
POST /admin/auth/login
POST /admin/auth/refresh
GET  /admin/auth/me

# Settings
GET/PUT  /admin/settings
POST     /admin/settings/upload-logo

# Orders (Leads)
GET      /admin/leads
PATCH    /admin/leads/:id       { status }

# Panels
GET/POST          /admin/panels
PUT/DELETE        /admin/panels/:id
POST              /admin/panels/upload-image
POST              /admin/panels/upload-zip
POST              /admin/panels/:id/images
DELETE            /admin/panels/:id/images/:imageId
GET/POST          /admin/panel-categories

# Accessories
GET/POST          /admin/accessories
PUT/DELETE        /admin/accessories/:id
POST              /admin/accessories/upload-model
POST              /admin/accessories/upload-thumb

# Collections
GET/POST          /admin/collections
PUT/DELETE        /admin/collections/:id

# Content
GET/POST          /admin/hero-slides
PUT/DELETE        /admin/hero-slides/:id
POST              /admin/hero-slides/upload-image
PATCH             /admin/hero-slides/reorder

GET/POST          /admin/blog
GET/PUT/DELETE    /admin/blog/:id
PATCH             /admin/blog/:id/publish
POST              /admin/blog/upload-cover

GET/POST          /admin/gallery
PUT/DELETE        /admin/gallery/:id
POST              /admin/gallery/upload-image

GET/POST          /admin/projects
GET/PUT/DELETE    /admin/projects/:id
POST              /admin/projects/upload-image

GET/POST          /admin/designers
GET/PUT/DELETE    /admin/designers/:id
POST              /admin/designers/upload-photo

GET/POST          /admin/dealers
GET/PUT/DELETE    /admin/dealers/:id

GET/POST          /admin/partners
PUT/DELETE        /admin/partners/:id
POST              /admin/partners/upload-logo

GET/POST          /admin/team
GET/PUT/DELETE    /admin/team/:id
POST              /admin/team/upload-photo

GET/PUT           /admin/pages/:key

# Instagram
GET  /admin/instagram/auth-url
GET  /admin/instagram/callback
GET  /admin/instagram/status
POST /admin/instagram/import
POST /admin/instagram/refresh-token
```
