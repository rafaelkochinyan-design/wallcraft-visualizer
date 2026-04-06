import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../lib/api'
import { useVisualizerStore } from '../store/visualizer'
import type { Tenant, Panel, Accessory, AccessoryType } from '../types'

interface UseTenantResult {
  loading: boolean
  error: string | null
}

export function useTenant(): UseTenantResult {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { setTenant, setAvailablePanels, setAvailableAccessories, setAvailableAccessoryTypes } =
    useVisualizerStore()

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [tenantRes, panelsRes, accessoriesRes, typesRes] = await Promise.all([
          api.get<{ data: Tenant }>('/api/tenant'),
          api.get<{ data: Panel[] }>('/api/panels'),
          api.get<{ data: Accessory[] }>('/api/accessories'),
          api.get<{ data: AccessoryType[] }>('/api/accessory-types'),
        ])

        if (cancelled) return

        setTenant(tenantRes.data.data)
        setAvailablePanels(panelsRes.data.data)
        setAvailableAccessories(accessoriesRes.data.data)
        setAvailableAccessoryTypes(typesRes.data.data)

        // Apply tenant primary color to CSS variable for theming
        document.documentElement.style.setProperty(
          '--tenant-primary',
          tenantRes.data.data.primary_color
        )
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load store data. Please refresh the page.')
          toast.error('Не удалось загрузить данные магазина')
          console.error('useTenant error:', err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [setTenant, setAvailablePanels, setAvailableAccessories, setAvailableAccessoryTypes])

  return { loading, error }
}
