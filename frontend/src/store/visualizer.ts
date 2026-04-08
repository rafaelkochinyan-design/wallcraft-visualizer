import { create } from 'zustand'
import type { Panel, Tenant } from '../types'

interface VisualizerStore {
  tenant: Tenant | null
  setTenant: (t: Tenant) => void

  availablePanels: Panel[]
  setAvailablePanels: (p: Panel[]) => void
}

export const useVisualizerStore = create<VisualizerStore>((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),

  availablePanels: [],
  setAvailablePanels: (availablePanels) => set({ availablePanels }),
}))
