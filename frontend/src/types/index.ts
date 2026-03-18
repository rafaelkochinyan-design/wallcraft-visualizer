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
  texture_url: string
  thumb_url: string
  width_mm: number
  height_mm: number
  depth_mm: number
  weight_kg: number | null
  price: number | null
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
  uid: string                          // client-side uuid
  accessory: Accessory
  position: [number, number, number]   // world coords in meters [x, y, z]
}

// ── UI State types ─────────────────────────────────────────────
export type VisualizerStep = 'size' | 'panel_select' | 'interactive'
export type TooltipMode = 'main' | 'settings' | null
export type SettingsTab = 'light' | 'position' | 'accessories'

// Panel B = Panel A texture rotated 180°
// We track which of the 2 selected panels is "flipped"
export interface SelectedPanel {
  panel: Panel
  flipped: boolean   // if true, texture.rotation = Math.PI
}
