# WallCraft DB Schema

## Key Models

```prisma
model Tenant {
  id                      String    @id @default(cuid())
  slug                    String    @unique
  name                    String
  logo_url                String?
  primary_color           String    @default("#1a1a1a")
  phone                   String?
  email                   String?
  address                 String?
  whatsapp                String?
  instagram_url           String?
  facebook_url            String?
  tiktok_url              String?
  pinterest_url           String?
  instagram_access_token  String?
  instagram_token_expiry  DateTime?
  instagram_user_id       String?
}

model Panel {
  id              String         @id @default(cuid())
  tenant_id       String
  name            String
  description     String?
  width_mm        Float?
  height_mm       Float?
  depth_mm        Float?
  depth_relief_mm Float?
  weight_kg       Float?
  material        String?
  price           Float?
  zip_url         String?        # downloadable ZIP (3D models, catalog)
  active          Boolean        @default(true)
  sort_order      Int            @default(0)
  category_id     String?
  category        PanelCategory? @relation(...)
  images          PanelImage[]   # images[0] (sort_order=0) = primary thumbnail
  sizes           PanelSize[]
  created_at      DateTime       @default(now())
}

model PanelImage {
  id         String  @id @default(cuid())
  panel_id   String
  url        String
  caption    String?
  sort_order Int     @default(0)
  # sort_order: 0 = primary/thumbnail shown in cards
}

model PanelSize {
  id         String  @id @default(cuid())
  panel_id   String
  label      String  # "Type 1", "Small", "Large"
  width_mm   Float
  height_mm  Float
  depth_mm   Float
  price      Float?
  sort_order Int     @default(0)
}

model PanelCategory {
  id         String  @id @default(cuid())
  tenant_id  String
  name       String
  sort_order Int     @default(0)
}

model Collection {
  id          String  @id @default(cuid())
  tenant_id   String
  name        String
  slug        String
  description String?
  cover_url   String?
  panel_ids   Json    @default("[]")
  sort_order  Int     @default(0)
  active      Boolean @default(true)
}

model Lead {
  id          String   @id @default(cuid())
  tenant_id   String
  name        String
  phone       String
  comment     String?
  status      String   @default("new")  # new|contacted|sold|cancelled
  wall_config Json
  # wall_config shape:
  # Visualizer: { source:'3d_visualizer', width, height, color, panels[], total_panels, total_cost, share_url }
  # Product order: { source:'order_form', type:'product_order', panel_name, panel_id,
  #                  square_meters, panels_base, panels_extra, panels_total,
  #                  panel_area_m2, price_per_m2, total_cost,
  #                  width:0, height:0, color, panels:[{name}] }
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}

model GalleryItem {
  id         String   @id @default(cuid())
  tenant_id  String
  image_url  String
  thumb_url  String?
  caption    String?
  space_type String?  # living_room|bedroom|office|hotel|restaurant|bathroom
  tags       Json     @default("[]")
  sort_order Int      @default(0)
  active     Boolean  @default(true)
}
```

## Important Notes

- `Panel.images[0]` (sort_order=0) = primary thumbnail shown in cards
- `Lead.wall_config.source` = 'order_form' | 'contact_form' | '3d_visualizer'
- `Lead.wall_config.square_meters` = user-entered wall area in m²
- `Lead.wall_config.panels_base` = Math.ceil(sqm / panelArea)
- `Lead.wall_config.panels_extra` = Math.ceil(panels_base × 0.1)
- Tenant has only ONE record per tenant_id (multi-tenant ready, single-tenant in use)
- Never add `thumb_url` back to Panel — use PanelImage with sort_order=0
- Never add separate `model_url`/`catalog_url` — use `zip_url`
