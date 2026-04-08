import { test, expect } from '@playwright/test'
import { API_URL, TENANT_SLUG, getAdminToken, authHeaders } from './helpers'

// ── Public API Tests ───────────────────────────────────────────
test.describe('Public API', () => {
  test.use({ ignoreHTTPSErrors: true })

  test('GET /api/tenant returns wallcraft branding', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/tenant?store=${TENANT_SLUG}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.error).toBeNull()
    expect(body.data.slug).toBe('wallcraft')
    expect(body.data.name).toBe('Wallcraft')
    expect(body.data.primary_color).toBe('#c4622d')
  })

  test('GET /api/panels returns active panels', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/panels?store=${TENANT_SLUG}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.error).toBeNull()
    // Response is { data: { data: Panel[], meta: {...} } }
    const panels = body.data.data
    expect(Array.isArray(panels)).toBe(true)
    expect(panels.length).toBeGreaterThanOrEqual(2)
    const panel = panels[0]
    expect(panel).toHaveProperty('id')
    expect(panel).toHaveProperty('name')
    expect(panel).toHaveProperty('texture_url')
    expect(panel).toHaveProperty('thumb_url')
    expect(panel.width_mm).toBe(500)
    expect(panel.height_mm).toBe(500)
  })

  test('GET /api/accessories returns list', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/accessories?store=${TENANT_SLUG}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.error).toBeNull()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /api/accessory-types returns 6 types', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/accessory-types?store=${TENANT_SLUG}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.length).toBe(6)
    const names = body.data.map((t: { name: string }) => t.name)
    expect(names).toContain('socket')
    expect(names).toContain('tv')
    expect(names).toContain('lamp')
  })

  test('Unknown tenant returns 404', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/tenant?store=nonexistent`)
    expect(res.status()).toBe(404)
    const body = await res.json()
    expect(body.data).toBeNull()
    expect(body.error.message).toBeTruthy()
  })

  test('Missing store param returns 400', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/tenant`)
    expect(res.status()).toBe(400)
  })
})

// ── Admin Auth Tests ───────────────────────────────────────────
test.describe('Admin Auth', () => {
  test.use({ ignoreHTTPSErrors: true })

  test('Login with correct credentials returns tokens', async ({ request }) => {
    const res = await request.post(`${API_URL}/admin/auth/login?store=${TENANT_SLUG}`, {
      data: { email: 'admin@wallcraft.am', password: 'admin123' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.accessToken).toBeTruthy()
    expect(body.data.refreshToken).toBeTruthy()
  })

  test('Login with wrong password returns 401', async ({ request }) => {
    const res = await request.post(`${API_URL}/admin/auth/login?store=${TENANT_SLUG}`, {
      data: { email: 'admin@wallcraft.am', password: 'wrongpassword' },
    })
    expect(res.status()).toBe(401)
    const body = await res.json()
    expect(body.data).toBeNull()
  })

  test('GET /admin/auth/me returns current user', async ({ request }) => {
    const token = await getAdminToken(request)
    const res = await request.get(`${API_URL}/admin/auth/me?store=${TENANT_SLUG}`, {
      headers: authHeaders(token),
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.email).toBe('admin@wallcraft.am')
    expect(body.data.role).toBe('ADMIN')
    expect(body.data).not.toHaveProperty('password_hash')
  })

  test('Protected route without token returns 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/admin/panels?store=${TENANT_SLUG}`)
    expect(res.status()).toBe(401)
  })
})

// ── Admin Panels Tests ─────────────────────────────────────────
test.describe('Admin Panels', () => {
  test.use({ ignoreHTTPSErrors: true })

  test('GET /admin/panels returns all panels', async ({ request }) => {
    const token = await getAdminToken(request)
    const res = await request.get(`${API_URL}/admin/panels?store=${TENANT_SLUG}`, {
      headers: authHeaders(token),
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(2)
    const names = body.data.map((p: { name: string }) => p.name)
    expect(names).toContain('Консул А')
    expect(names).toContain('Консул Б')
  })
})

// ── Admin Settings Tests ───────────────────────────────────────
test.describe('Admin Settings', () => {
  test.use({ ignoreHTTPSErrors: true })

  test('GET /admin/settings returns tenant settings', async ({ request }) => {
    const token = await getAdminToken(request)
    const res = await request.get(`${API_URL}/admin/settings?store=${TENANT_SLUG}`, {
      headers: authHeaders(token),
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.slug).toBe('wallcraft')
    expect(body.data.name).toBe('Wallcraft')
    expect(body.data.primary_color).toBe('#c4622d')
  })
})
