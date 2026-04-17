import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '../lib/api'
import { useVisualizerStore } from '../store/visualizer'
import type { Tenant, Panel } from '../types'

interface UseTenantResult {
  tenant: Tenant | null
  loading: boolean
  error: string | null
}

export function useTenant(): UseTenantResult {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { tenant, setTenant, setAvailablePanels } = useVisualizerStore()

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (tenant !== null) {
        setLoading(false)
        return
      }
      try {
        const [tenantRes, panelsRes] = await Promise.all([
          api.get<{ data: Tenant }>('/api/tenant'),
          api.get<{ data: { data: Panel[] } }>('/api/panels'),
        ])

        if (cancelled) return

        setTenant(tenantRes.data.data)
        // Handle both response shapes: { data: Panel[] } and { data: { data: Panel[], meta } }
        const panelsPayload = panelsRes.data.data
        const panelArray: Panel[] = Array.isArray(panelsPayload)
          ? panelsPayload
          : (panelsPayload?.data ?? [])
        setAvailablePanels(panelArray)

        // Apply tenant primary color to CSS variable for theming
        if (tenantRes.data.data.primary_color) {
          document.documentElement.style.setProperty(
            '--tenant-primary',
            tenantRes.data.data.primary_color
          )
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load store data. Please refresh the page.')
          toast.error('Failed to load store data')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [setTenant, setAvailablePanels])

  return { tenant, loading, error }
}
