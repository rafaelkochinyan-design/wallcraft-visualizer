/**
 * seed-panels.ts
 * Deletes ALL panels/images/categories/sizes then creates 12 demo panels
 * (4 per category: Geometric, Modern, Classic).
 * Run via Render startCommand on deploy.
 */
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// Pexels CDN — permanent, free, no auth
const P = (id: number, w = 900, h = 700) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`

// Image sets per panel (each array = [thumb, img2, img3?])
const IMGS = {
  // ── Geometric ────────────────────────────────────────────────
  wave:     [P(3255245), P(1571460), P(2724749)],
  diamond:  [P(1643383), P(1648768), P(2082087)],
  hexagon:  [P(1571458), P(3225529), P(2980809)],
  scales:   [P(2062426), P(1030303), P(1743229)],

  // ── Modern ───────────────────────────────────────────────────
  loft:     [P(1457842), P(1669799)],
  metro:    [P(1648776), P(2635038), P(1930161)],
  slab:     [P(667838),  P(1055691), P(3180032)],
  linear:   [P(2082084), P(1571463), P(2251248)],

  // ── Classic ──────────────────────────────────────────────────
  classico: [P(2251247), P(1939485), P(2462015)],
  baroque:  [P(2462016), P(1939488), P(3255248)],
  arabesque:[P(1643386), P(2082088), P(1648770)],
  lotus:    [P(2251250), P(2462018), P(1930163)],
}

async function main() {
  console.log('🗑  Clearing panels, images, categories, sizes...')
  await prisma.panelImage.deleteMany()
  await prisma.panelSize.deleteMany()
  await prisma.panel.deleteMany()
  await prisma.panelCategory.deleteMany()
  console.log('✅ Cleared')

  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new Error('No tenant found — run full seed first')
  const tid = tenant.id
  console.log('Tenant:', tenant.name)

  // ── Categories ──────────────────────────────────────────────
  const [catGeo, catMod, catCls] = await Promise.all([
    prisma.panelCategory.create({ data: { tenant_id: tid, name: 'Geometric', sort_order: 1 } }),
    prisma.panelCategory.create({ data: { tenant_id: tid, name: 'Modern',    sort_order: 2 } }),
    prisma.panelCategory.create({ data: { tenant_id: tid, name: 'Classic',   sort_order: 3 } }),
  ])
  console.log('✅ 3 categories created')

  // ── Helper ──────────────────────────────────────────────────
  async function makePanel(data: {
    name: string; description: string; category_id: string
    width_mm: number; height_mm: number; depth_mm: number
    depth_relief_mm: number; weight_kg: number; material: string
    price: number; sort_order: number
    images: string[]; sizes: { label: string; width_mm: number; height_mm: number; depth_mm: number; price: number }[]
  }) {
    const { images, sizes, ...panelData } = data
    const panel = await prisma.panel.create({
      data: { tenant_id: tid, active: true, ...panelData },
    })
    await prisma.panelImage.createMany({
      data: images.map((url, i) => ({ panel_id: panel.id, url, sort_order: i })),
    })
    await prisma.panelSize.createMany({
      data: sizes.map((s, i) => ({ panel_id: panel.id, sort_order: i, ...s })),
    })
    console.log(' ✓', panel.name)
    return panel
  }

  // ════════════════════════════════════════════════════════════
  //  GEOMETRIC (4 panels)
  // ════════════════════════════════════════════════════════════
  console.log('\n🔷 Geometric')

  await makePanel({
    name: 'Wave 3D', category_id: catGeo.id, sort_order: 1,
    description: 'Smooth flowing wave relief. Creates a stunning play of light and shadow, ideal for accent walls in living rooms and hotel lobbies. Tiles seamlessly for continuous flow.',
    width_mm: 500, height_mm: 500, depth_mm: 20, depth_relief_mm: 18, weight_kg: 3.2,
    material: 'High-strength gypsum composite', price: 3200,
    images: IMGS.wave,
    sizes: [
      { label: '500×500', width_mm: 500, height_mm: 500, depth_mm: 20, price: 3200 },
      { label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 20, price: 3800 },
    ],
  })

  await makePanel({
    name: 'Diamond', category_id: catGeo.id, sort_order: 2,
    description: 'Precision geometric diamond relief. Bold repeating facets deliver a modern high-impact look. Popular in boutique hotels, offices, and premium residential projects.',
    width_mm: 600, height_mm: 600, depth_mm: 22, depth_relief_mm: 20, weight_kg: 4.1,
    material: 'High-strength gypsum composite', price: 3800,
    images: IMGS.diamond,
    sizes: [
      { label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 22, price: 3800 },
      { label: '300×600', width_mm: 300, height_mm: 600, depth_mm: 22, price: 2100 },
    ],
  })

  await makePanel({
    name: 'Hexagon', category_id: catGeo.id, sort_order: 3,
    description: 'Honeycomb hexagonal grid relief. The natural geometry of hexagons creates a structured, organic rhythm. Pairs beautifully with minimalist and Scandinavian interiors.',
    width_mm: 520, height_mm: 600, depth_mm: 20, depth_relief_mm: 16, weight_kg: 3.6,
    material: 'Gypsum composite', price: 3500,
    images: IMGS.hexagon,
    sizes: [
      { label: '520×600', width_mm: 520, height_mm: 600, depth_mm: 20, price: 3500 },
    ],
  })

  await makePanel({
    name: 'Scales', category_id: catGeo.id, sort_order: 4,
    description: 'Fish-scale overlapping arc relief inspired by nature. Soft curved motifs give any wall a fluid, sculptural texture. Works from floor-to-ceiling or as a feature strip.',
    width_mm: 500, height_mm: 500, depth_mm: 19, depth_relief_mm: 14, weight_kg: 3.0,
    material: 'Gypsum composite', price: 3100,
    images: IMGS.scales,
    sizes: [
      { label: '500×500', width_mm: 500, height_mm: 500, depth_mm: 19, price: 3100 },
      { label: '400×400', width_mm: 400, height_mm: 400, depth_mm: 19, price: 2100 },
    ],
  })

  // ════════════════════════════════════════════════════════════
  //  MODERN (4 panels)
  // ════════════════════════════════════════════════════════════
  console.log('\n🟦 Modern')

  await makePanel({
    name: 'Loft Brick', category_id: catMod.id, sort_order: 5,
    description: 'Industrial-style brick-effect relief panel. Clean rectangular modules with subtle texture. Perfect for open-plan spaces, restaurants, and contemporary residential interiors.',
    width_mm: 500, height_mm: 250, depth_mm: 19, depth_relief_mm: 12, weight_kg: 2.4,
    material: 'Gypsum composite with mineral filler', price: 2900,
    images: IMGS.loft,
    sizes: [
      { label: '500×250', width_mm: 500, height_mm: 250, depth_mm: 19, price: 2900 },
    ],
  })

  await makePanel({
    name: 'Metro', category_id: catMod.id, sort_order: 6,
    description: 'Subway tile-inspired offset row relief. Classic metro proportions reimagined in gypsum — the grout lines are recessed for a bold, architectural shadow effect.',
    width_mm: 600, height_mm: 300, depth_mm: 18, depth_relief_mm: 10, weight_kg: 2.7,
    material: 'Gypsum composite', price: 2800,
    images: IMGS.metro,
    sizes: [
      { label: '600×300', width_mm: 600, height_mm: 300, depth_mm: 18, price: 2800 },
      { label: '300×150', width_mm: 300, height_mm: 150, depth_mm: 18, price: 800 },
    ],
  })

  await makePanel({
    name: 'Slab', category_id: catMod.id, sort_order: 7,
    description: 'Smooth minimal stone-slab aesthetic. Ultra-flat surface with barely-there texture reminiscent of polished travertine. Timeless in monochrome or color-washed interiors.',
    width_mm: 600, height_mm: 600, depth_mm: 16, depth_relief_mm: 8, weight_kg: 3.5,
    material: 'Fine-grain gypsum composite', price: 3000,
    images: IMGS.slab,
    sizes: [
      { label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 16, price: 3000 },
      { label: '600×300', width_mm: 600, height_mm: 300, depth_mm: 16, price: 1600 },
    ],
  })

  await makePanel({
    name: 'Linear', category_id: catMod.id, sort_order: 8,
    description: 'Clean horizontal ridge lines with precision spacing. The linear rhythm adds depth and directionality — makes rooms feel wider when laid horizontally, taller when vertical.',
    width_mm: 500, height_mm: 500, depth_mm: 17, depth_relief_mm: 11, weight_kg: 2.9,
    material: 'Gypsum composite', price: 2750,
    images: IMGS.linear,
    sizes: [
      { label: '500×500', width_mm: 500, height_mm: 500, depth_mm: 17, price: 2750 },
    ],
  })

  // ════════════════════════════════════════════════════════════
  //  CLASSIC (4 panels)
  // ════════════════════════════════════════════════════════════
  console.log('\n🏛 Classic')

  await makePanel({
    name: 'Classico', category_id: catCls.id, sort_order: 9,
    description: 'Timeless baroque-inspired ornamental relief. Intricate floral and scroll motifs hand-cast in premium gypsum. Elevates any space with heritage elegance — from grand lobbies to luxurious master bedrooms.',
    width_mm: 600, height_mm: 600, depth_mm: 25, depth_relief_mm: 22, weight_kg: 5.0,
    material: 'Premium white gypsum with natural polymer binders', price: 4500,
    images: IMGS.classico,
    sizes: [
      { label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 25, price: 4500 },
      { label: '300×300', width_mm: 300, height_mm: 300, depth_mm: 25, price: 1300 },
    ],
  })

  await makePanel({
    name: 'Baroque', category_id: catCls.id, sort_order: 10,
    description: 'Fleur-de-lis repeating motif with rich dimensional depth. Draws from French Baroque tradition — formal yet warm. Ideal for dining rooms, reception halls, and statement ceilings.',
    width_mm: 600, height_mm: 600, depth_mm: 24, depth_relief_mm: 21, weight_kg: 4.8,
    material: 'Premium white gypsum', price: 4200,
    images: IMGS.baroque,
    sizes: [
      { label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 24, price: 4200 },
      { label: '300×300', width_mm: 300, height_mm: 300, depth_mm: 24, price: 1200 },
    ],
  })

  await makePanel({
    name: 'Arabesque', category_id: catCls.id, sort_order: 11,
    description: 'Islamic geometric interlace pattern with flowing star and polygon forms. A masterpiece of mathematical beauty in gypsum — stunning in hospitality and luxury residential projects.',
    width_mm: 500, height_mm: 500, depth_mm: 23, depth_relief_mm: 20, weight_kg: 4.4,
    material: 'Premium white gypsum with natural polymer binders', price: 3900,
    images: IMGS.arabesque,
    sizes: [
      { label: '500×500', width_mm: 500, height_mm: 500, depth_mm: 23, price: 3900 },
    ],
  })

  await makePanel({
    name: 'Lotus', category_id: catCls.id, sort_order: 12,
    description: 'Lotus petal mandala relief with layered symmetry. Each panel a complete composition — serene, spiritual, and architectural. Especially powerful as a ceiling centrepiece or feature headboard wall.',
    width_mm: 600, height_mm: 600, depth_mm: 26, depth_relief_mm: 23, weight_kg: 5.2,
    material: 'Premium white gypsum', price: 4100,
    images: IMGS.lotus,
    sizes: [
      { label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 26, price: 4100 },
      { label: '300×300', width_mm: 300, height_mm: 300, depth_mm: 26, price: 1150 },
    ],
  })

  // ── Summary ─────────────────────────────────────────────────
  const totalPanels = await prisma.panel.count({ where: { tenant_id: tid } })
  const totalImages = await prisma.panelImage.count()
  console.log(`\n🎉 Done! ${totalPanels} panels, ${totalImages} images`)
  console.log('   Geometric: Wave 3D, Diamond, Hexagon, Scales')
  console.log('   Modern:    Loft Brick, Metro, Slab, Linear')
  console.log('   Classic:   Classico, Baroque, Arabesque, Lotus')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
