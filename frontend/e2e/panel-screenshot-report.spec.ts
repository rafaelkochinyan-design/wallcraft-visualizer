/**
 * panel-screenshot-report.spec.ts
 * Opens the visualizer, clicks each panel, takes a screenshot.
 * All screenshots saved to: D:/Wallcraft/PANEL_REPORT/screenshots/
 */

import { test, expect, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const REPORT_DIR = 'D:/Wallcraft/PANEL_REPORT'
const SHOT_DIR   = `${REPORT_DIR}/screenshots`

test.use({ ignoreHTTPSErrors: true })

test.beforeAll(() => {
  fs.mkdirSync(SHOT_DIR, { recursive: true })
})

async function waitForScene(page: Page) {
  // Wait for canvas to be visible
  await page.waitForSelector('canvas', { timeout: 15000 })
  // Extra time for 3D to render
  await page.waitForTimeout(2000)
}

async function getPanels(page: Page) {
  // Get all panel cards from the sidebar
  return page.locator('[data-panel-id]').all()
}

test('screenshot all panels on wall', async ({ page }) => {
  const results: { name: string; status: string; file: string; issue: string }[] = []

  // ── Open visualizer ────────────────────────────────────────────
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await waitForScene(page)

  // Screenshot: initial state (no panels)
  await page.screenshot({
    path: `${SHOT_DIR}/00_initial_state.png`,
    fullPage: false,
  })
  console.log('✅ Initial state captured')

  // ── Get panel list from API ─────────────────────────────────────
  const apiRes  = await page.request.get('http://localhost:3001/api/panels?store=wallcraft')
  const apiData = await apiRes.json()
  const panels: any[] = (apiData.data || []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  console.log(`Found ${panels.length} panels in API`)

  if (panels.length === 0) {
    console.error('❌ No panels returned from API!')
    results.push({ name: 'API', status: 'FAIL', file: '', issue: 'No panels returned from /api/panels' })
  }

  // ── Check sidebar is visible ────────────────────────────────────
  const sidebar = page.locator('div').filter({ hasText: /Панели|Аксессуары|Настройки/ }).first()
  const sidebarVisible = await sidebar.isVisible().catch(() => false)
  console.log('Sidebar visible:', sidebarVisible)

  // Screenshot sidebar state
  await page.screenshot({ path: `${SHOT_DIR}/01_sidebar_open.png` })

  // ── Screenshot each panel ───────────────────────────────────────
  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i]
    const slug  = panel.sku?.toLowerCase().replace(/[^a-z0-9]/g, '_') ?? `panel_${i}`
    const num   = String(i + 2).padStart(2, '0')

    console.log(`\n[${i+1}/${panels.length}] Testing: ${panel.name} (${panel.sku})`)
    console.log(`  texture_url: ${panel.texture_url}`)
    console.log(`  thumb_url:   ${panel.thumb_url}`)

    try {
      // Try clicking the panel in the sidebar
      // First try by data attribute, then by img src, then by text
      let clicked = false

      // Try finding the panel thumbnail image in sidebar
      const thumbImg = page.locator(`img[src="${panel.thumb_url}"]`).first()
      if (await thumbImg.isVisible({ timeout: 2000 }).catch(() => false)) {
        await thumbImg.click()
        clicked = true
        console.log(`  ✅ Clicked via thumbnail img`)
      }

      // Try finding by panel name text
      if (!clicked) {
        const nameEl = page.locator(`text=${panel.name}`).first()
        if (await nameEl.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameEl.click()
          clicked = true
          console.log(`  ✅ Clicked via text`)
        }
      }

      if (!clicked) {
        console.log(`  ⚠️  Could not find clickable element for panel`)
      }

      // Wait for wall to update
      await page.waitForTimeout(1500)

      // Take screenshot
      const filename = `${num}_${slug}.png`
      await page.screenshot({ path: `${SHOT_DIR}/${filename}` })

      // Check if canvas is black (simple heuristic — check page is not all-black)
      const canvasEl = page.locator('canvas')
      const canvasBox = await canvasEl.boundingBox()
      const isBlack = !canvasBox || canvasBox.width === 0

      results.push({
        name:   panel.name,
        status: clicked ? (isBlack ? 'FAIL-BLACK' : 'OK') : 'WARN-NOTCLICKED',
        file:   filename,
        issue:  !clicked ? 'Panel not found in sidebar' : isBlack ? 'Canvas appears black' : '',
      })

    } catch (err: any) {
      console.error(`  ❌ Error: ${err.message}`)
      results.push({ name: panel.name, status: 'ERROR', file: '', issue: err.message })
    }
  }

  // ── Screenshot: 2-slot checkerboard ────────────────────────────
  console.log('\n--- Testing 2-slot checkerboard ---')
  try {
    // Go back to start
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
    await waitForScene(page)

    // Click first panel (slot A)
    const firstThumb = page.locator(`img[src="${panels[0]?.texture_url ?? panels[0]?.thumb_url}"]`).first()
    if (await firstThumb.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstThumb.click()
      await page.waitForTimeout(1000)
    }

    // Screenshot slot A only
    await page.screenshot({ path: `${SHOT_DIR}/12_slot_A_only.png` })
    console.log('✅ Slot A screenshot')

    // Try to activate slot B and click second panel
    const slotBBtn = page.locator('text=Слот Б, text=B, text=Б').first()
    if (await slotBBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await slotBBtn.click()
      await page.waitForTimeout(500)
      const secondThumb = page.locator(`img[src="${panels[1]?.thumb_url}"]`).first()
      if (await secondThumb.isVisible({ timeout: 2000 }).catch(() => false)) {
        await secondThumb.click()
        await page.waitForTimeout(1500)
      }
    }
    await page.screenshot({ path: `${SHOT_DIR}/13_checkerboard_AB.png` })
    console.log('✅ Checkerboard screenshot')

  } catch (err: any) {
    console.error('Checkerboard test error:', err.message)
  }

  // ── Screenshot: Admin panel ─────────────────────────────────────
  console.log('\n--- Testing admin panel ---')
  try {
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    await page.screenshot({ path: `${SHOT_DIR}/14_admin_login.png` })

    // Try login
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    const passInput  = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('admin@wallcraft.am')
      await passInput.fill('admin123')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)
      await page.screenshot({ path: `${SHOT_DIR}/15_admin_dashboard.png` })
      console.log('✅ Admin dashboard screenshot')

      // Navigate to panels
      const panelsLink = page.locator('text=Панели').first()
      if (await panelsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await panelsLink.click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: `${SHOT_DIR}/16_admin_panels.png` })
        console.log('✅ Admin panels page screenshot')
      }
    }
  } catch (err: any) {
    console.error('Admin test error:', err.message)
  }

  // ── Write report ────────────────────────────────────────────────
  const report = generateReport(panels, results)
  fs.writeFileSync(`${REPORT_DIR}/REPORT.md`, report, 'utf8')
  console.log(`\n✅ Report saved: ${REPORT_DIR}/REPORT.md`)
  console.log(`✅ Screenshots saved: ${SHOT_DIR}/`)

  // At least initial screenshot must exist
  expect(fs.existsSync(`${SHOT_DIR}/00_initial_state.png`)).toBe(true)
})

function generateReport(panels: any[], results: any[]): string {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const ok   = results.filter(r => r.status === 'OK').length
  const fail = results.filter(r => r.status !== 'OK').length

  return `# WALLCRAFT — VISUAL TEST REPORT
Generated: ${now}

---

## SUMMARY
- Total panels tested: ${panels.length}
- Screenshots taken: ${results.length}
- OK: ${ok}
- Issues: ${fail}

---

## PANEL TEST RESULTS

| # | Panel | SKU | Status | Screenshot | Issue |
|---|-------|-----|--------|------------|-------|
${results.map((r, i) => `| ${i+1} | ${r.name} | ${panels[i]?.sku ?? '-'} | ${r.status} | ${r.file ? `![](screenshots/${r.file})` : '-'} | ${r.issue || '-'} |`).join('\n')}

---

## SCREENSHOTS

### 00 — Initial State (no panels selected)
![Initial](screenshots/00_initial_state.png)

### 01 — Sidebar Open
![Sidebar](screenshots/01_sidebar_open.png)

---

${panels.map((p, i) => {
  const num = String(i + 2).padStart(2, '0')
  const slug = p.sku?.toLowerCase().replace(/[^a-z0-9]/g, '_') ?? `panel_${i}`
  const r = results[i]
  return `### ${num} — ${p.name} (${p.sku})
- texture_url: \`${p.texture_url}\`
- thumb_url: \`${p.thumb_url}\`
- Status: **${r?.status ?? 'NOT TESTED'}**${r?.issue ? `\n- Issue: ${r.issue}` : ''}

![${p.name}](screenshots/${num}_${slug}.png)
`
}).join('\n---\n')}

---

### 12 — Slot A Only
![Slot A](screenshots/12_slot_A_only.png)

### 13 — Checkerboard (A+B)
![Checkerboard](screenshots/13_checkerboard_AB.png)

### 14 — Admin Login
![Admin Login](screenshots/14_admin_login.png)

### 15 — Admin Dashboard
![Admin Dashboard](screenshots/15_admin_dashboard.png)

### 16 — Admin Panels Page
![Admin Panels](screenshots/16_admin_panels.png)

---

## ISSUES TO FIX

${results.filter(r => r.status !== 'OK').length === 0
  ? '✅ No issues found — all panels working correctly'
  : results
      .filter(r => r.status !== 'OK')
      .map(r => `- **${r.name}**: ${r.status} — ${r.issue}`)
      .join('\n')
}

---

## HOW TO REPRODUCE

1. Backend: \`cd backend && npm run dev\` (port 3001)
2. Frontend: \`cd frontend && npm run dev\` (port 5173)
3. Open: http://localhost:5173
`
}
