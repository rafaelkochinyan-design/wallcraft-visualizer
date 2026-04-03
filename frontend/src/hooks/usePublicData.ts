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
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err?.response?.data?.error?.message || 'Failed to load data')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => { mountedRef.current = false }
  }, [endpoint, JSON.stringify(params)])

  return { data, loading, error, refetch: fetchData }
}
