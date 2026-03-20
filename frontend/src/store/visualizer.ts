/**
 * visualizer.ts — обновлённый store (Homestyler-style)
 *
 * Убран wizard (step: size/panel_select/interactive).
 * Теперь single-screen: всё сразу на экране.
 *
 * Новые поля:
 * - sidebarTab: 'panels' | 'accessories' | 'settings'
 * - hoverPanelId — для hover preview при наведении в сайдбаре
 * - selectedPanelSlot: 0 | 1 — какой из 2 слотов сейчас редактируется
 * - selectedPanels: (Panel|null)[] — два слота вместо массива
 */

import { create } from 'zustand'
import type { Panel, Accessory, AccessoryType, PlacedAccessory, Tenant } from '../types'

type SidebarTab = 'panels' | 'accessories' | 'settings'

interface VisualizerStore {
  // ── Tenant ──────────────────────────────────────────────
  tenant: Tenant | null
  setTenant: (t: Tenant) => void

  // ── Wall dimensions ──────────────────────────────────────
  wallWidth:    number
  wallHeight:   number
  setWallSize:  (w: number, h: number) => void

  // ── Wall appearance ──────────────────────────────────────
  wallColor:    string
  setWallColor: (c: string) => void

  // ── Panels ───────────────────────────────────────────────
  availablePanels:    Panel[]
  setAvailablePanels: (p: Panel[]) => void

  // Два слота: slot 0 = основной паттерн, slot 1 = чередующийся
  selectedPanels:   (Panel | null)[]   // [slotA, slotB]
  activeSlot:       0 | 1
  setActiveSlot:    (s: 0 | 1) => void
  setPanelInSlot:   (panel: Panel | null, slot: 0 | 1) => void

  // Hover preview — панель подсвечивается в 3D при наведении в сайдбаре
  hoverPanelId:     string | null
  setHoverPanelId:  (id: string | null) => void

  // ── Accessories ──────────────────────────────────────────
  availableAccessories:       Accessory[]
  availableAccessoryTypes:    AccessoryType[]
  setAvailableAccessories:    (a: Accessory[]) => void
  setAvailableAccessoryTypes: (t: AccessoryType[]) => void

  placedAccessories: PlacedAccessory[]
  placeAccessory:   (a: Accessory) => void
  moveAccessory:    (uid: string, pos: [number, number, number]) => void
  removeAccessory:  (uid: string) => void

  // Drag state — disables OrbitControls while dragging accessory
  isDraggingAccessory:    boolean
  setIsDraggingAccessory: (v: boolean) => void

  // ── Sidebar ──────────────────────────────────────────────
  sidebarOpen:    boolean
  sidebarTab:     SidebarTab
  setSidebarOpen: (v: boolean) => void
  setSidebarTab:  (t: SidebarTab) => void

  // ── Lighting ─────────────────────────────────────────────
  lightAngle:        number
  lightElevation:    number
  setLightAngle:     (v: number) => void
  setLightElevation: (v: number) => void

  // ── Tooltip (draggable settings panel) ───────────────────
  tooltipCollapsed:    boolean
  tooltipPosition:     { x: number; y: number }
  setTooltipCollapsed: (v: boolean) => void
  setTooltipPosition:  (pos: { x: number; y: number }) => void

  // ── Screenshot ───────────────────────────────────────────
  pendingSave:    boolean
  setPendingSave: (v: boolean) => void

  // ── Reset ────────────────────────────────────────────────
  resetAll: () => void
}

const DEFAULT = {
  wallWidth:          3.0,
  wallHeight:         2.7,
  wallColor:          '#f0ede4',
  selectedPanels:     [null, null] as (Panel | null)[],
  activeSlot:         0 as 0 | 1,
  hoverPanelId:       null as string | null,
  placedAccessories:  [] as PlacedAccessory[],
  isDraggingAccessory: false,
  sidebarOpen:        true,
  sidebarTab:         'panels' as SidebarTab,
  lightAngle:         45,
  lightElevation:     60,
  tooltipCollapsed:   false,
  tooltipPosition:    { x: 20, y: -1 },
  pendingSave:        false,
}

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  ...DEFAULT,

  tenant: null,
  availablePanels: [],
  availableAccessories: [],
  availableAccessoryTypes: [],

  setTenant:                  (tenant) => set({ tenant }),
  setAvailablePanels:         (availablePanels) => set({ availablePanels }),
  setAvailableAccessories:    (availableAccessories) => set({ availableAccessories }),
  setAvailableAccessoryTypes: (availableAccessoryTypes) => set({ availableAccessoryTypes }),

  setWallSize:  (wallWidth, wallHeight) => set({ wallWidth, wallHeight }),
  setWallColor: (wallColor) => set({ wallColor }),

  setActiveSlot:   (activeSlot) => set({ activeSlot }),
  setHoverPanelId: (hoverPanelId) => set({ hoverPanelId }),
  setPanelInSlot:  (panel, slot) => set(s => {
    const next = [...s.selectedPanels] as (Panel | null)[]
    next[slot] = panel
    return { selectedPanels: next }
  }),

  placeAccessory: (accessory) => set(s => ({
    placedAccessories: [
      ...s.placedAccessories,
      {
        uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        accessory,
        position: [0, s.wallHeight / 2, 0.025] as [number, number, number],
      },
    ],
  })),
  moveAccessory: (uid, position) => set(s => ({
    placedAccessories: s.placedAccessories.map(a => a.uid === uid ? { ...a, position } : a),
  })),
  removeAccessory: (uid) => set(s => ({
    placedAccessories: s.placedAccessories.filter(a => a.uid !== uid),
  })),

  setIsDraggingAccessory: (isDraggingAccessory) => set({ isDraggingAccessory }),

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarTab:  (sidebarTab)  => set({ sidebarTab }),

  setLightAngle:     (lightAngle)     => set({ lightAngle }),
  setLightElevation: (lightElevation) => set({ lightElevation }),

  setTooltipCollapsed: (tooltipCollapsed) => set({ tooltipCollapsed }),
  setTooltipPosition:  (tooltipPosition)  => set({ tooltipPosition }),
  setPendingSave:      (pendingSave)      => set({ pendingSave }),

  resetAll: () => set({
    ...DEFAULT,
    tenant:                  get().tenant,
    availablePanels:         get().availablePanels,
    availableAccessories:    get().availableAccessories,
    availableAccessoryTypes: get().availableAccessoryTypes,
  }),
}))
