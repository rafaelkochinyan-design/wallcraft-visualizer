// Canonical list of space type keys — used in admin and public pages
export const SPACE_TYPE_KEYS = [
  'living_room',
  'bedroom',
  'office',
  'hotel',
  'restaurant',
  'bathroom',
  'corridor',
] as const

export type SpaceTypeKey = (typeof SPACE_TYPE_KEYS)[number]

// English display labels for admin tables and select menus
export const SPACE_LABELS: Record<string, string> = {
  living_room: 'Living room',
  bedroom: 'Bedroom',
  office: 'Office',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  bathroom: 'Bathroom',
  corridor: 'Corridor',
}

// Filter chip options for the public Gallery page — keys are i18n translation keys
export const GALLERY_SPACE_FILTERS = [
  { key: '', label: 'gallery.filter_all' },
  { key: 'living_room', label: 'gallery.filter_living' },
  { key: 'bedroom', label: 'gallery.filter_bedroom' },
  { key: 'office', label: 'gallery.filter_office' },
  { key: 'hotel', label: 'gallery.filter_hotel' },
  { key: 'restaurant', label: 'gallery.filter_restaurant' },
  { key: 'bathroom', label: 'gallery.filter_bathroom' },
]
