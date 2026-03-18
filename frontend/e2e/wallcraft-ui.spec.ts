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

// ── Visualizer UI Tests ────────────────────────────────────────
test.describe('Visualizer UI', () => {
  test.use({ ignoreHTTPSErrors: true })

  test('Visualizer loads with wall size step', async ({ page }) => {
    await page.goto('/')
    // Canvas should be present
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 })
  })
})
