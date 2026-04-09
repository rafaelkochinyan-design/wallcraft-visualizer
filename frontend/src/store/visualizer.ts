import { create } from 'zustand'
import type { Panel, Tenant } from '../types'
import api from '../lib/api'

interface VisualizerStore {
  tenant: Tenant | null
  setTenant: (t: Tenant) => void
  fetchTenant: () => Promise<void>

  availablePanels: Panel[]
  setAvailablePanels: (p: Panel[]) => void
}

export const useVisualizerStore = create<VisualizerStore>((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
  fetchTenant: async () => {
    try {
      const res = await api.get('/api/tenant')
      set({ tenant: res.data.data })
    } catch (e) {
      console.error('Failed to fetch tenant', e)
    }
  },

  availablePanels: [],
  setAvailablePanels: (availablePanels) => set({ availablePanels }),
}))
