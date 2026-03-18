import axios, { AxiosError } from 'axios'

// ── Token store (in-memory, NOT localStorage) ─────────────────
let accessToken: string | null = null

export const tokenStore = {
  get: () => accessToken,
  set: (token: string) => { accessToken = token },
  clear: () => { accessToken = null },
}

// ── Resolve tenant slug from URL ──────────────────────────────
export function getTenantSlug(): string {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  // wallcraft.domain.com → parts[0] = 'wallcraft'
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0]
  }
  // Dev fallback from env
  return import.meta.env.VITE_TENANT_SLUG || 'wallcraft'
}

// ── Axios instance ─────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  withCredentials: true,
})

// Request interceptor: attach tenant slug + auth token
api.interceptors.request.use((config) => {
  // In dev: inject tenant via query param
  // In prod: subdomain is detected by backend automatically
  if (import.meta.env.VITE_APP_ENV === 'development') {
    config.params = { ...config.params, store: getTenantSlug() }
  }

  const token = tokenStore.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Response interceptor: handle 401 → try refresh
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config!

    if (
      error.response?.status === 401 &&
      (error.response.data as { error?: { code?: string } })?.error?.code === 'TOKEN_EXPIRED' &&
      !(original as { _retry?: boolean })._retry
    ) {
      ;(original as { _retry?: boolean })._retry = true

      if (isRefreshing) {
        // Queue subsequent requests while refreshing
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            original.headers!.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      isRefreshing = true
      try {
        const res = await api.post('/admin/auth/refresh')
        const newToken = res.data.data.accessToken
        tokenStore.set(newToken)
        refreshQueue.forEach((cb) => cb(newToken))
        refreshQueue = []
        original.headers!.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        tokenStore.clear()
        window.location.href = '/admin/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
