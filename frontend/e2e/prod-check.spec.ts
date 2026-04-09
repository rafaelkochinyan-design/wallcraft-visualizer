import { test, expect } from '@playwright/test'

const PROD = 'https://frontend-beige-six-43.vercel.app'

// Render free tier can take up to 60s on cold start
test.describe('Production smoke', () => {
  test.use({ ignoreHTTPSErrors: true })
  test.setTimeout(90000)

  test('products page shows all panels', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', (err) => jsErrors.push(err.message))

    await page.goto(`${PROD}/products`, { waitUntil: 'domcontentloaded' })

    // Wait for cards to appear (Render free tier cold start can take ~60s)
    await expect(page.locator('.pub-product-card').first()).toBeVisible({ timeout: 70000 })
    await page.screenshot({ path: 'test-results/prod-products.png', fullPage: true })

    const cards = await page.locator('.pub-product-card').count()
    console.log(`\n  Cards: ${cards}  |  JS errors: ${jsErrors.length}\n`)

    expect(cards).toBeGreaterThan(0)
    expect(jsErrors.filter(e => e.includes('reduce') || e.includes('Cannot read'))).toHaveLength(0)
  })

  test('homepage loads without crash', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', (err) => jsErrors.push(err.message))

    await page.goto(`${PROD}/`, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.pub-product-card').first()).toBeVisible({ timeout: 70000 })
    await page.screenshot({ path: 'test-results/prod-homepage.png', fullPage: true })

    const cards = await page.locator('.pub-product-card').count()
    console.log(`\n  Cards: ${cards}  |  JS errors: ${jsErrors.length}\n`)

    expect(jsErrors.filter(e => e.includes('reduce') || e.includes('Cannot read'))).toHaveLength(0)
    expect(cards).toBeGreaterThan(0)
  })
})
