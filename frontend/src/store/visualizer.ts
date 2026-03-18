import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import {
  Panel,
  Accessory,
  PlacedAccessory,
  VisualizerStep,
  TooltipMode,
  SettingsTab,
  Tenant,
  AccessoryType,
} from '../types'

interface VisualizerStore {
  // Tenant
  tenant: Tenant | null
  setTenant: (tenant: Tenant) => void

  // Available data (loaded from API)
  availablePanels: Panel[]
  availableAccessories: Accessory[]
  availableAccessoryTypes: AccessoryType[]
  setAvailablePanels: (panels: Panel[]) => void
  setAvailableAccessories: (accessories: Accessory[]) => void
  setAvailableAccessoryTypes: (types: AccessoryType[]) => void

  // Wall
  wallWidth: number     // meters
  wallHeight: number    // meters
  wallColor: string     // hex

  // Selected panels (max 2)
  selectedPanels: Panel[]

  // Placed accessories on the wall
  placedAccessories: PlacedAccessory[]

  // UI flow
  step: VisualizerStep
  tooltipMode: TooltipMode
  settingsTab: SettingsTab

  // Lighting
  lightAngle: number      // azimuth 0-360 degrees
  lightElevation: number  // elevation 0-90 degrees

  // Actions — wall
  setWallSize: (width: number, height: number) => void
  setWallColor: (color: string) => void

  // Actions — panels
  togglePanelSelect: (panel: Panel) => void
  clearPanels: () => void

  // Actions — accessories
  placeAccessory: (accessory: Accessory) => void
  moveAccessory: (uid: string, position: [number, number, number]) => void
  removeAccessory: (uid: string) => void

  // Drag state — disables OrbitControls while dragging accessory
  isDraggingAccessory: boolean
  setIsDraggingAccessory: (v: boolean) => void

  // Actions — UI flow
  setStep: (step: VisualizerStep) => void
  setTooltipMode: (mode: TooltipMode) => void
  setSettingsTab: (tab: SettingsTab) => void

  // Actions — lighting
  setLightAngle: (angle: number) => void
  setLightElevation: (elevation: number) => void

  // Reset everything (Убрать всё button)
  resetAll: () => void
}

const DEFAULT_WALL = {
  wallWidth: 3,
  wallHeight: 2.7,
  wallColor: '#f0ede8',
}

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  // Tenant
  tenant: null,
  setTenant: (tenant) => set({ tenant }),

  // Available data
  availablePanels: [],
  availableAccessories: [],
  availableAccessoryTypes: [],
  setAvailablePanels: (panels) => set({ availablePanels: panels }),
  setAvailableAccessories: (accessories) => set({ availableAccessories: accessories }),
  setAvailableAccessoryTypes: (types) => set({ availableAccessoryTypes: types }),

  // Wall
  ...DEFAULT_WALL,
  selectedPanels: [],
  placedAccessories: [],
  isDraggingAccessory: false,

  // UI flow
  step: 'size',
  tooltipMode: null,
  settingsTab: 'light',

  // Lighting defaults — 45° azimuth, 60° elevation (nice dramatic angle for panels)
  lightAngle: 45,
  lightElevation: 60,

  // Wall actions
  setWallSize: (wallWidth, wallHeight) => set({ wallWidth, wallHeight }),
  setWallColor: (wallColor) => set({ wallColor }),

  // Panel select — toggle, max 2
  togglePanelSelect: (panel) => {
    const { selectedPanels } = get()
    const isSelected = selectedPanels.some((p) => p.id === panel.id)
    if (isSelected) {
      set({ selectedPanels: selectedPanels.filter((p) => p.id !== panel.id) })
    } else if (selectedPanels.length < 2) {
      set({ selectedPanels: [...selectedPanels, panel] })
    }
    // If already 2 selected and user clicks a third, do nothing (handled in UI by disabling)
  },
  clearPanels: () => set({ selectedPanels: [] }),

  // Accessory actions
  placeAccessory: (accessory) => {
    const { wallWidth, wallHeight, placedAccessories } = get()
    const newItem: PlacedAccessory = {
      uid: uuid(),
      accessory,
      // Place in center of wall, slightly in front of surface
      position: [0, wallHeight / 2, 0.025],
    }
    set({ placedAccessories: [...placedAccessories, newItem] })
  },

  moveAccessory: (uid, position) => {
    set((state) => ({
      placedAccessories: state.placedAccessories.map((a) =>
        a.uid === uid ? { ...a, position } : a
      ),
    }))
  },

  removeAccessory: (uid) => {
    set((state) => ({
      placedAccessories: state.placedAccessories.filter((a) => a.uid !== uid),
    }))
  },

  setIsDraggingAccessory: (isDraggingAccessory) => set({ isDraggingAccessory }),

  // UI flow
  setStep: (step) => set({ step }),
  setTooltipMode: (tooltipMode) => set({ tooltipMode }),
  setSettingsTab: (settingsTab) => set({ settingsTab }),

  // Lighting
  setLightAngle: (lightAngle) => set({ lightAngle }),
  setLightElevation: (lightElevation) => set({ lightElevation }),

  // Reset — clears everything except loaded tenant/panels/accessories data
  resetAll: () =>
    set((state) => ({
      ...DEFAULT_WALL,
      selectedPanels: [],
      placedAccessories: [],
      step: 'size',
      tooltipMode: null,
      settingsTab: 'light',
      lightAngle: 45,
      lightElevation: 60,
      // Keep loaded data
      tenant: state.tenant,
      availablePanels: state.availablePanels,
      availableAccessories: state.availableAccessories,
      availableAccessoryTypes: state.availableAccessoryTypes,
    })),
}))
