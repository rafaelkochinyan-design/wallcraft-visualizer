import { APIRequestContext } from '@playwright/test'

export const API_URL = 'http://localhost:3001'
export const ADMIN_EMAIL = 'admin@wallcraft.am'
export const ADMIN_PASSWORD = 'admin123'
export const TENANT_SLUG = 'wallcraft'

export async function getAdminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_URL}/admin/auth/login?store=${TENANT_SLUG}`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  const body = await res.json()
  return body.data.accessToken
}

export function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}
