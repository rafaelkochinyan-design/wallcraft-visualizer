// ── Localization ───────────────────────────────────────────────
export interface LocalizedString {
  en: string
  ru: string
  am: string
}

// ── API Response wrapper ───────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  error: null
}
export interface ApiError {
  data: null
  error: { message: string; code?: string }
}

// ── Domain models ──────────────────────────────────────────────
export interface Tenant {
  id: string
  slug: string
  name: string
  logo_url: string | null
  primary_color: string
  email: string | null
  phone: string | null
  address: string | null
  domain: string | null
}

export interface PanelCategory {
  id: string
  name: string
}

export interface Panel {
  id: string
  tenant_id: string
  name: string
  sku: string | null
  texture_url: string | null
  thumb_url: string
  model_url: string | null
  width_mm: number
  height_mm: number
  depth_mm: number
  weight_kg: number | null
  price: number | null
  images: { url: string }[]
  description: string | null
  material: string | null
  depth_relief_mm: number | null
  catalog_url: string | null
  active: boolean
  sort_order: number
  category: PanelCategory | null
}

export interface AccessoryType {
  id: string
  name: 'socket' | 'switch' | 'tv' | 'lamp' | 'picture' | 'shelf' | string
  label_ru: string
  icon_url: string | null
}

export interface Accessory {
  id: string
  tenant_id: string
  type_id: string
  name: string
  model_url: string
  thumb_url: string
  scale: number
  active: boolean
  type: AccessoryType
}

export interface PlacedAccessory {
  uid: string // client-side uuid
  accessory: Accessory
  position: [number, number, number] // world coords in meters [x, y, z]
}

// ── UI State types ─────────────────────────────────────────────
export type VisualizerStep = 'size' | 'panel_select' | 'interactive'
export type TooltipMode = 'main' | 'settings' | null
export type SettingsTab = 'light' | 'position' | 'accessories'

// Panel B = Panel A texture rotated 180°
// We track which of the 2 selected panels is "flipped"
export interface SelectedPanel {
  panel: Panel
  flipped: boolean // if true, texture.rotation = Math.PI
}

// ── Content Types ──────────────────────────────────────────────
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pages: number
}

export interface HeroSlide {
  id: string
  image_url: string
  video_url: string | null
  headline: LocalizedString
  subheadline: LocalizedString | null
  cta_label: LocalizedString | null
  cta_url: string | null
  sort_order: number
}

export interface Project {
  id: string
  tenant_id: string
  slug: string
  title: string
  description: string | null
  cover_url: string | null
  images: { url: string; caption?: string }[]
  space_type: string | null
  panel_ids: string[]
  created_at: string
}

export interface GalleryItem {
  id: string
  image_url: string
  thumb_url: string | null
  caption: string | null
  space_type: string | null
  tags: string[]
  sort_order: number
}

export interface BlogPost {
  id: string
  slug: string
  title: LocalizedString
  excerpt: LocalizedString
  body: LocalizedString
  cover_url: string | null
  category: string | null
  tags: string[]
  published: boolean
  published_at: string | null
  created_at: string
}

export interface Designer {
  id: string
  slug: string
  name: string
  photo_url: string | null
  bio: LocalizedString | null
  specialty: string | null
  portfolio: string[]
  instagram: string | null
  website: string | null
}

export interface Dealer {
  id: string
  name: string
  country: string
  region: string | null
  city: string
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  map_url: string | null
  logo_url: string | null
}

export interface Partner {
  id: string
  name: string
  logo_url: string
  website: string | null
}

export interface TeamMember {
  id: string
  name: string
  role: LocalizedString
  photo_url: string | null
  bio: LocalizedString | null
}

export interface PageContent {
  page_key: string
  content: Record<string, LocalizedString>
}
