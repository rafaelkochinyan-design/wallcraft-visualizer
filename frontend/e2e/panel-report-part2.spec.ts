import { test } from '@playwright/test'
import * as fs from 'fs'

test.setTimeout(60000)
test.use({ ignoreHTTPSErrors: true })

const SHOT_DIR = 'D:/Wallcraft/PANEL_REPORT/screenshots'

test('finish report - pargev + checkerboard + admin', async ({ page }) => {

  // ── Паргев (last panel) ─────────────────────────────────────────
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await page.waitForTimeout(2000)

  const pargev = page.locator('img[src="/textures/001_pargev_thumb.jpg"]').first()
  if (await pargev.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pargev.click()
    await page.waitForTimeout(2000)
  }
  await page.screenshot({ path: `${SHOT_DIR}/12_parg_01.png` })
  console.log('✅ Паргев captured')

  // ── Checkerboard (Консул А + Консул Б) ─────────────────────────
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForSelector('canvas', { timeout: 15000 })
  await page.waitForTimeout(2000)

  // Click Консул А in slot A
  const konsulA = page.locator('img[src="/textures/consul_a_thumb.jpg"]').first()
  if (await konsulA.isVisible({ timeout: 3000 }).catch(() => false)) {
    await konsulA.click()
    await page.waitForTimeout(1000)
  }
  await page.screenshot({ path: `${SHOT_DIR}/13_slot_A_only.png` })
  console.log('✅ Slot A only captured')

  // Switch to slot B — look for slot button
  const slotBtns = page.locator('button, div[style*="cursor: pointer"]').filter({ hasText: /Б|B|б|slot.?b/i })
  const slotB = slotBtns.first()
  if (await slotB.isVisible({ timeout: 2000 }).catch(() => false)) {
    await slotB.click()
    await page.waitForTimeout(500)
    const konsulB = page.locator('img[src="/textures/consul_b_thumb.jpg"]').first()
    if (await konsulB.isVisible({ timeout: 2000 }).catch(() => false)) {
      await konsulB.click()
      await page.waitForTimeout(2000)
    }
  }
  await page.screenshot({ path: `${SHOT_DIR}/14_checkerboard_AB.png` })
  console.log('✅ Checkerboard captured')

  // ── Admin panel ─────────────────────────────────────────────────
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SHOT_DIR}/15_admin_login.png` })
  console.log('✅ Admin login page captured')

  const emailInput = page.locator('input[type="email"], input[name="email"]').first()
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill('admin@wallcraft.am')
    await page.locator('input[type="password"]').first().fill('admin123')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(2500)
    await page.screenshot({ path: `${SHOT_DIR}/16_admin_dashboard.png` })
    console.log('✅ Admin dashboard captured')

    // Panels page
    const panelsLink = page.locator('a, nav *').filter({ hasText: /^Панели$/ }).first()
    if (await panelsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await panelsLink.click()
      await page.waitForTimeout(1500)
      await page.screenshot({ path: `${SHOT_DIR}/17_admin_panels_list.png` })
      console.log('✅ Admin panels list captured')
    }
  }

  console.log('\n✅ Part 2 complete. All screenshots in:', SHOT_DIR)
  fs.appendFileSync('D:/Wallcraft/PANEL_REPORT/REPORT.md', `
---

## PART 2 — Additional Screenshots

### 12 — Декор Паргев
![Паргев](screenshots/12_parg_01.png)

### 13 — Slot A Only (Консул А)
![Slot A](screenshots/13_slot_A_only.png)

### 14 — Checkerboard (Консул А + Консул Б)
![Checkerboard](screenshots/14_checkerboard_AB.png)

### 15 — Admin Login
![Admin Login](screenshots/15_admin_login.png)

### 16 — Admin Dashboard
![Admin Dashboard](screenshots/16_admin_dashboard.png)

### 17 — Admin Panels List
![Admin Panels](screenshots/17_admin_panels_list.png)
`)
})
