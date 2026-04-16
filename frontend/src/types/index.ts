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
  phone: string | null
  email: string | null
  address: string | null
  whatsapp: string | null
  domain: string | null
  instagram_url: string | null
  facebook_url: string | null
  tiktok_url: string | null
  pinterest_url: string | null
}

export interface PanelCategory {
  id: string
  name: string
}

export interface PanelSize {
  id: string
  panel_id: string
  label: string
  width_mm: number
  height_mm: number
  depth_mm: number
  price: number | null
  sort_order: number
}

export interface PanelImage {
  id: string
  url: string
  caption?: string | null
  sort_order: number
}

export interface Panel {
  id: string
  tenant_id: string
  name: string
  zip_url?: string | null
  width_mm: number
  height_mm: number
  depth_mm: number
  weight_kg: number | null
  price: number | null
  description: string | null
  material: string | null
  depth_relief_mm: number | null
  active: boolean
  sort_order: number
  category: PanelCategory | null
  sizes?: PanelSize[]
  panelImages?: PanelImage[]
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
  active: boolean
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
  active: boolean
  sort_order: number
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
  active: boolean
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
  active: boolean
  sort_order: number
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
  lat: number | null
  lng: number | null
  logo_url: string | null
  active: boolean
  sort_order: number
}

export interface Partner {
  id: string
  name: string
  logo_url: string
  website: string | null
  sort_order: number
  active: boolean
}

export interface TeamMember {
  id: string
  name: string
  role: LocalizedString
  photo_url: string | null
  bio: LocalizedString | null
  sort_order: number
  active: boolean
}

export interface PageContent {
  page_key: string
  content: Record<string, LocalizedString>
}

export interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  cover_url: string | null
  panel_ids: string[]
  active: boolean
  sort_order: number
  created_at: string
}
