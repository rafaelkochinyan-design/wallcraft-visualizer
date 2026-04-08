import { test, expect } from '@playwright/test'

// ── Admin UI Tests ─────────────────────────────────────────────
test.describe('Admin UI', () => {
  test.use({ ignoreHTTPSErrors: true })

  test('Admin login page loads', async ({ page }) => {
    await page.goto('/admin/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('Admin login with correct credentials', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'admin@wallcraft.am')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/admin\/panels/, { timeout: 5000 })
  })

  test('Admin login with wrong password shows error', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'admin@wallcraft.am')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/ошибка|неверный|invalid/i')).toBeVisible({ timeout: 3000 })
  })

  test('Admin panels page shows Консул А and Консул Б', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', 'admin@wallcraft.am')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin\/panels/)
    await expect(page.locator('text=Консул А')).toBeVisible()
    await expect(page.locator('text=Консул Б')).toBeVisible()
  })
})

// ── Public Homepage Tests ──────────────────────────────────────
test.describe('Public Homepage', () => {
  test.use({ ignoreHTTPSErrors: true })

  test('Homepage loads with product sections', async ({ page }) => {
    await page.goto('/')
    // Section title should be visible (products listed by category or fallback)
    await expect(page.locator('.pub-section-title').first()).toBeVisible({ timeout: 8000 })
  })

  test('Products page loads and shows panels', async ({ page }) => {
    await page.goto('/products')
    await expect(page.locator('.pub-section-title').first()).toBeVisible({ timeout: 8000 })
    // Grid or skeleton should render
    await expect(page.locator('.pub-product-grid, .pub-product-list, .pub-skeleton').first()).toBeVisible({ timeout: 8000 })
  })
})
