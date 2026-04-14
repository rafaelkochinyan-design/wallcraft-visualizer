import { useState, useEffect, useRef } from 'react'
import api from '../lib/api'

interface UsePublicDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePublicData<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): UsePublicDataResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(endpoint, { params })
      if (mountedRef.current) {
        setData(res.data.data)
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'object' && err !== null && 'response' in err
              ? ((err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message ?? 'Failed to load data')
              : 'Failed to load data'
        setError(message)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  const paramsKey = params ? JSON.stringify(params) : ''

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => {
      mountedRef.current = false
    }
  }, [endpoint, paramsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData }
}
