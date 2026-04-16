/**
 * seed-panels.ts
 * Deletes ALL existing panels, panel images, panel categories, panel sizes
 * then creates 4 demo panels with real data and reliable external image URLs.
 * Run via Render startCommand: npx ts-node src/scripts/seed-panels.ts && node dist/index.js
 */
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

// Pexels CDN — stable permanent URLs, free for commercial use, no auth needed
// Format: https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?...
const IMG = {
  // White/light 3D geometric wall texture shots
  wave1:    'https://images.pexels.com/photos/3255245/pexels-photo-3255245.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  wave2:    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  wave3:    'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',

  diamond1: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  diamond2: 'https://images.pexels.com/photos/1648768/pexels-photo-1648768.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  diamond3: 'https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',

  loft1:    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  loft2:    'https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',

  classico1:'https://images.pexels.com/photos/2251247/pexels-photo-2251247.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  classico2:'https://images.pexels.com/photos/1939485/pexels-photo-1939485.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
  classico3:'https://images.pexels.com/photos/2462015/pexels-photo-2462015.jpeg?auto=compress&cs=tinysrgb&w=900&h=700&fit=crop',
}

async function main() {
  console.log('🗑  Clearing panels, images, categories, sizes...')

  // Delete in FK order
  await prisma.panelImage.deleteMany()
  await prisma.panelSize.deleteMany()
  await prisma.panel.deleteMany()
  await prisma.panelCategory.deleteMany()

  console.log('✅ Cleared')

  // ── Get tenant ─────────────────────────────────────────────────
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new Error('No tenant found — run full seed first')
  const tid = tenant.id
  console.log('Tenant:', tenant.name, tid)

  // ── Categories ─────────────────────────────────────────────────
  const [catGeo, catMod, catCls] = await Promise.all([
    prisma.panelCategory.create({ data: { tenant_id: tid, name: 'Geometric', sort_order: 1 } }),
    prisma.panelCategory.create({ data: { tenant_id: tid, name: 'Modern',    sort_order: 2 } }),
    prisma.panelCategory.create({ data: { tenant_id: tid, name: 'Classic',   sort_order: 3 } }),
  ])
  console.log('✅ Categories created')

  // ── Panel 1: Wave 3D ────────────────────────────────────────────
  const wave = await prisma.panel.create({
    data: {
      tenant_id:       tid,
      category_id:     catGeo.id,
      name:            'Wave 3D',
      description:     'Smooth flowing wave relief. Creates a stunning play of light and shadow, ideal for accent walls in living rooms and hotel lobbies. Each panel tiles seamlessly for continuous flow.',
      width_mm:        500,
      height_mm:       500,
      depth_mm:        20,
      depth_relief_mm: 18,
      weight_kg:       3.2,
      material:        'High-strength gypsum composite',
      price:           3200,
      active:          true,
      sort_order:      1,
    },
  })
  await prisma.panelImage.createMany({ data: [
    { panel_id: wave.id, url: IMG.wave1, caption: 'Wave 3D — installed view',    sort_order: 0 },
    { panel_id: wave.id, url: IMG.wave2, caption: 'Wave 3D — interior detail',   sort_order: 1 },
    { panel_id: wave.id, url: IMG.wave3, caption: 'Wave 3D — texture close-up',  sort_order: 2 },
  ]})
  await prisma.panelSize.createMany({ data: [
    { panel_id: wave.id, label: '500×500', width_mm: 500, height_mm: 500, depth_mm: 20, price: 3200, sort_order: 0 },
    { panel_id: wave.id, label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 20, price: 3800, sort_order: 1 },
  ]})
  console.log('✅ Wave 3D created')

  // ── Panel 2: Diamond ────────────────────────────────────────────
  const diamond = await prisma.panel.create({
    data: {
      tenant_id:       tid,
      category_id:     catGeo.id,
      name:            'Diamond',
      description:     'Precision geometric diamond relief. Bold repeating facets deliver a modern, high-impact look. Popular in boutique hotels, offices, and premium residential projects.',
      width_mm:        600,
      height_mm:       600,
      depth_mm:        22,
      depth_relief_mm: 20,
      weight_kg:       4.1,
      material:        'High-strength gypsum composite',
      price:           3800,
      active:          true,
      sort_order:      2,
    },
  })
  await prisma.panelImage.createMany({ data: [
    { panel_id: diamond.id, url: IMG.diamond1, caption: 'Diamond — full wall installation', sort_order: 0 },
    { panel_id: diamond.id, url: IMG.diamond2, caption: 'Diamond — bedroom accent wall',    sort_order: 1 },
    { panel_id: diamond.id, url: IMG.diamond3, caption: 'Diamond — texture detail',         sort_order: 2 },
  ]})
  await prisma.panelSize.createMany({ data: [
    { panel_id: diamond.id, label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 22, price: 3800, sort_order: 0 },
    { panel_id: diamond.id, label: '300×600', width_mm: 300, height_mm: 600, depth_mm: 22, price: 2100, sort_order: 1 },
  ]})
  console.log('✅ Diamond created')

  // ── Panel 3: Loft Brick ─────────────────────────────────────────
  const loft = await prisma.panel.create({
    data: {
      tenant_id:       tid,
      category_id:     catMod.id,
      name:            'Loft Brick',
      description:     'Industrial-style brick-effect relief panel. Clean rectangular modules with subtle texture. Perfect for open-plan spaces, restaurants, and contemporary residential interiors.',
      width_mm:        500,
      height_mm:       250,
      depth_mm:        19,
      depth_relief_mm: 12,
      weight_kg:       2.4,
      material:        'Gypsum composite with mineral filler',
      price:           2900,
      active:          true,
      sort_order:      3,
    },
  })
  await prisma.panelImage.createMany({ data: [
    { panel_id: loft.id, url: IMG.loft1, caption: 'Loft Brick — dining area wall', sort_order: 0 },
    { panel_id: loft.id, url: IMG.loft2, caption: 'Loft Brick — open-plan office', sort_order: 1 },
  ]})
  await prisma.panelSize.createMany({ data: [
    { panel_id: loft.id, label: '500×250', width_mm: 500, height_mm: 250, depth_mm: 19, price: 2900, sort_order: 0 },
  ]})
  console.log('✅ Loft Brick created')

  // ── Panel 4: Classico ───────────────────────────────────────────
  const classico = await prisma.panel.create({
    data: {
      tenant_id:       tid,
      category_id:     catCls.id,
      name:            'Classico',
      description:     'Timeless baroque-inspired ornamental relief. Intricate floral and scroll motifs hand-cast in premium gypsum. Elevates any space with heritage elegance — from grand lobbies to luxurious master bedrooms.',
      width_mm:        600,
      height_mm:       600,
      depth_mm:        25,
      depth_relief_mm: 22,
      weight_kg:       5.0,
      material:        'Premium white gypsum with natural polymer binders',
      price:           4500,
      active:          true,
      sort_order:      4,
    },
  })
  await prisma.panelImage.createMany({ data: [
    { panel_id: classico.id, url: IMG.classico1, caption: 'Classico — grand lobby installation', sort_order: 0 },
    { panel_id: classico.id, url: IMG.classico2, caption: 'Classico — bedroom feature wall',     sort_order: 1 },
    { panel_id: classico.id, url: IMG.classico3, caption: 'Classico — ornamental detail',        sort_order: 2 },
  ]})
  await prisma.panelSize.createMany({ data: [
    { panel_id: classico.id, label: '600×600', width_mm: 600, height_mm: 600, depth_mm: 25, price: 4500, sort_order: 0 },
    { panel_id: classico.id, label: '300×300', width_mm: 300, height_mm: 300, depth_mm: 25, price: 1300, sort_order: 1 },
  ]})
  console.log('✅ Classico created')

  // ── Summary ────────────────────────────────────────────────────
  const count = await prisma.panel.count({ where: { tenant_id: tid } })
  const imgCount = await prisma.panelImage.count()
  console.log(`\n🎉 Done! ${count} panels, ${imgCount} images seeded.`)
  console.log('  Wave 3D     — 3 images, 2 sizes, 3200 AMD/m²')
  console.log('  Diamond     — 3 images, 2 sizes, 3800 AMD/m²')
  console.log('  Loft Brick  — 2 images, 1 size,  2900 AMD/m²')
  console.log('  Classico    — 3 images, 2 sizes, 4500 AMD/m²')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
