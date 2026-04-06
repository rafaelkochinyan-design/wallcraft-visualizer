/**
 * Exploration test — screenshots all public + admin pages
 * Desktop (1440×900) and Mobile (390×844)
 * Run: npx playwright test e2e/explore-all-pages.spec.ts --headed
 */
import { test, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const BASE = 'http://localhost:5173'
const OUT  = path.join(__dirname, '../test-results/exploration')
const BUGS: string[] = []

// Ensure output dir
fs.mkdirSync(OUT, { recursive: true })

function bug(page: string, viewport: string, issue: string) {
  const msg = `[${viewport}] ${page}: ${issue}`
  BUGS.push(msg)
  console.warn('🐛 BUG:', msg)
}

async function shot(page: Page, name: string, viewport: string) {
  const file = path.join(OUT, `${viewport}__${name.replace(/\//g, '_').replace(/^_/, '')}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log(`📸 ${viewport} | ${name}`)
  return file
}

async function checkPage(page: Page, route: string, label: string, vp: string) {
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(1200)

    // Check for error states
    const bodyText = await page.locator('body').innerText().catch(() => '')
    if (bodyText.includes('Cannot read') || bodyText.includes('undefined is not')) {
      bug(label, vp, 'JS runtime error visible on page')
    }

    // Check for loading spinners stuck
    const spinners = await page.locator('.animate-spin').count()
    if (spinners > 0) {
      // wait a bit more
      await page.waitForTimeout(2000)
      const spinners2 = await page.locator('.animate-spin').count()
      if (spinners2 > 0) bug(label, vp, `Loading spinner stuck (${spinners2} visible)`)
    }

    // Check for 404 / empty state that shouldn't be there
    const notFound = await page.locator('text=404, text=Page not found').count()
    if (notFound > 0) bug(label, vp, '404 or "Page not found" text visible')

    // Check images loaded (no broken img)
    const brokenImgs = await page.evaluate(() => {
      const imgs = Array.from(document.images)
      return imgs.filter(img => !img.complete || img.naturalWidth === 0).length
    })
    if (brokenImgs > 0) bug(label, vp, `${brokenImgs} broken image(s)`)

    // Check nav is visible on public pages
    if (!route.startsWith('/admin') && route !== '/visualizer') {
      const nav = await page.locator('nav, header').count()
      if (nav === 0) bug(label, vp, 'No nav/header found')
      const footer = await page.locator('footer').count()
      if (footer === 0) bug(label, vp, 'No footer found')
    }

    // Mobile: check hamburger exists in navbar
    if (vp === 'mobile' && !route.startsWith('/admin') && route !== '/visualizer') {
      const hamburger = await page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger, [class*="hamburger"], [class*="mobile-menu"]').count()
      // Don't bug if not found — just note it
    }

    // Horizontal scroll check (layout overflow)
    const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 5)
    if (hasHScroll) bug(label, vp, 'Horizontal scroll detected (overflow-x issue)')

    await shot(page, label + route, vp)
  } catch (e) {
    bug(label, vp, `Page failed to load: ${e}`)
    await shot(page, label + route + '_ERROR', vp).catch(() => {})
  }
}

const PUBLIC_PAGES = [
  ['/',             'homepage'],
  ['/products',     'products'],
  ['/gallery',      'gallery'],
  ['/projects',     'projects'],
  ['/blog',         'blog'],
  ['/designers',    'designers'],
  ['/dealers',      'dealers'],
  ['/about',        'about'],
  ['/contact',      'contact'],
  ['/installation', 'installation'],
  ['/partners',     'partners'],
  ['/visualizer',   'visualizer'],
]

// ── DESKTOP ────────────────────────────────────────────────────────────────
test.describe('Desktop (1440×900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const [route, label] of PUBLIC_PAGES) {
    test(`desktop: ${label}`, async ({ page }) => {
      await checkPage(page, route, label, 'desktop')
    })
  }

  test('desktop: admin login', async ({ page }) => {
    await checkPage(page, '/admin/login', 'admin_login', 'desktop')
  })

  test('desktop: admin panels (logged in)', async ({ page }) => {
    // Login
    await page.goto(BASE + '/admin/login')
    await page.waitForTimeout(500)
    await page.locator('input[type="email"], input[name="email"]').fill('admin@wallcraft.am')
    await page.locator('input[type="password"], input[name="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/admin/**', { timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(1000)
    await shot(page, 'admin_panels', 'desktop')

    // Walk all admin sections
    const sections = [
      ['/admin/hero-slides', 'admin_hero_slides'],
      ['/admin/gallery',     'admin_gallery'],
      ['/admin/projects',    'admin_projects'],
      ['/admin/blog',        'admin_blog'],
      ['/admin/designers',   'admin_designers'],
      ['/admin/team',        'admin_team'],
      ['/admin/dealers',     'admin_dealers'],
      ['/admin/partners',    'admin_partners'],
      ['/admin/pages',       'admin_pages'],
      ['/admin/leads',       'admin_leads'],
    ]
    for (const [route, label] of sections) {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {})
      await page.waitForTimeout(1000)
      const spinners = await page.locator('.animate-spin').count()
      if (spinners > 0) {
        await page.waitForTimeout(2000)
        const s2 = await page.locator('.animate-spin').count()
        if (s2 > 0) bug(label, 'desktop', 'Table still loading after 3s')
      }
      await shot(page, label, 'desktop')
    }
  })
})

// ── MOBILE ─────────────────────────────────────────────────────────────────
test.describe('Mobile (390×844 — iPhone 14)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true })

  for (const [route, label] of PUBLIC_PAGES) {
    test(`mobile: ${label}`, async ({ page }) => {
      await checkPage(page, route, label, 'mobile')
    })
  }

  test('mobile: admin login', async ({ page }) => {
    await checkPage(page, '/admin/login', 'admin_login', 'mobile')
  })
})

// ── AFTER ALL — write bug report ────────────────────────────────────────────
test.afterAll(async () => {
  const reportPath = path.join(OUT, 'BUG_REPORT.md')
  const ts = new Date().toISOString().slice(0, 19).replace('T', ' ')

  let md = `# WallCraft Exploration — Bug Report\n**Date:** ${ts}\n\n`
  md += `## Summary\n- Pages tested: ${PUBLIC_PAGES.length + 1} public + 11 admin\n`
  md += `- Viewports: Desktop 1440×900, Mobile 390×844\n`
  md += `- Total bugs found: ${BUGS.length}\n\n`

  if (BUGS.length === 0) {
    md += `## ✅ No bugs found!\n`
  } else {
    md += `## 🐛 Bugs Found\n\n`
    BUGS.forEach((b, i) => { md += `${i + 1}. ${b}\n` })
  }

  md += `\n## Screenshots\nAll screenshots saved to: \`e2e/../test-results/exploration/\`\n`

  fs.writeFileSync(reportPath, md, 'utf8')
  console.log('\n' + '═'.repeat(60))
  console.log(`BUG REPORT: ${reportPath}`)
  console.log(`Total bugs: ${BUGS.length}`)
  BUGS.forEach(b => console.log('  🐛', b))
  console.log('═'.repeat(60) + '\n')
})
