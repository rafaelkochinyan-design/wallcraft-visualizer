/**
 * seed.ts — демо данные для Wallcraft
 *
 * Запуск: cd backend && npx ts-node prisma/seed.ts
 *
 * Добавляет / обновляет:
 * - 1 tenant (Wallcraft Yerevan)
 * - 1 admin user
 * - 11 панелей (реальные текстуры из /public/textures/)
 * - 6 типов аксессуаров
 * - 6 аксессуаров (GLB из /public/uploads/models/)
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const PLACEHOLDER_THUMB = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg=='

async function main() {
  console.log('Seeding WallCraft demo data...')

  // ── 1. Tenant ──────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'wallcraft' },
    update: { primary_color: '#c4622d' },
    create: {
      slug:          'wallcraft',
      name:          'Wallcraft',
      logo_url:      '/wallcraft_logo.png',
      primary_color: '#c4622d',
      email:         'info@wallcraft.am',
      phone:         '+374 77 123456',
      address:       'Ереван, Армения',
      active:        true,
    },
  })
  console.log('Tenant:', tenant.slug)

  // ── 2. Admin user ──────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenant.id, email: 'admin@wallcraft.am' } },
    update: {},
    create: {
      tenant_id:     tenant.id,
      email:         'admin@wallcraft.am',
      password_hash: passwordHash,
    },
  })
  console.log('User:', user.email)

  // ── 3. Accessory types (глобальные) ──────────────────
  const accTypes = await Promise.all([
    { name: 'shelf',   label_ru: 'Полки'       },
    { name: 'socket',  label_ru: 'Розетки'     },
    { name: 'switch',  label_ru: 'Выключатели' },
    { name: 'lamp',    label_ru: 'Светильники' },
    { name: 'tv',      label_ru: 'Телевизоры'  },
    { name: 'picture', label_ru: 'Картины'     },
  ].map(t =>
    prisma.accessoryType.upsert({
      where:  { name: t.name },
      update: { label_ru: t.label_ru },
      create: t,
    })
  ))
  console.log('Accessory types:', accTypes.length)

  const typeMap = Object.fromEntries(accTypes.map(t => [t.name, t.id]))

  // ── 4. Панели — 11 реальных панелей ───────────────────
  // texture_url и thumb_url должны совпадать с файлами в frontend/public/textures/
  const panels = [
    {
      sku:         'KON-A',
      name:        'Консул А',
      texture_url: '/textures/consul_a.jpg',
      thumb_url:   '/textures/consul_a_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 19,
      price: 450, active: true, sort_order: 1,
    },
    {
      sku:         'KON-B',
      name:        'Консул Б',
      texture_url: '/textures/consul_b.jpg',
      thumb_url:   '/textures/consul_b_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 19,
      price: 450, active: true, sort_order: 2,
    },
    {
      sku:         'DROP-01',
      name:        'Drop',
      texture_url: '/textures/002_drop.jpg',
      thumb_url:   '/textures/002_drop_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 25,
      price: 680, active: true, sort_order: 3,
    },
    {
      sku:         'ASIA-03',
      name:        'Asia C-03',
      texture_url: '/textures/003_asia_c03.jpg',
      thumb_url:   '/textures/003_asia_c03_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 20,
      price: 590, active: true, sort_order: 4,
    },
    {
      sku:         'TAZA-01',
      name:        'Taza Gic',
      texture_url: '/textures/004_taza_gic.jpg',
      thumb_url:   '/textures/004_taza_gic_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 22,
      price: 520, active: true, sort_order: 5,
    },
    {
      sku:         'ALIQ-AT',
      name:        'Aliq Atlantic',
      texture_url: '/textures/005_atlantic.jpg',
      thumb_url:   '/textures/005_atlantic_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 20,
      price: 560, active: true, sort_order: 6,
    },
    {
      sku:         'KLIPS-BL',
      name:        'Klips Blade',
      texture_url: '/textures/007_blade.jpg',
      thumb_url:   '/textures/007_blade_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 30,
      price: 780, active: true, sort_order: 7,
    },
    {
      sku:         'OMEGA-2',
      name:        'Hin Gic Omega',
      texture_url: '/textures/010_omega2.jpg',
      thumb_url:   '/textures/010_omega2_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 20,
      price: 540, active: true, sort_order: 8,
    },
    {
      sku:         'D-03',
      name:        'D-03',
      texture_url: '/textures/011_d03.jpg',
      thumb_url:   '/textures/011_d03.jpg',       // no separate thumb — use texture
      width_mm: 500, height_mm: 500, depth_mm: 18,
      price: 480, active: true, sort_order: 9,
    },
    {
      sku:         'DECO-50',
      name:        'Deco Line M-50',
      texture_url: '/textures/012_deco_m50.jpg',
      thumb_url:   '/textures/012_deco_m50.jpg',  // no separate thumb — use texture
      width_mm: 500, height_mm: 500, depth_mm: 50,
      price: 890, active: true, sort_order: 10,
    },
    {
      sku:         'PARG-01',
      name:        'Декор Паргев',
      texture_url: '/textures/001_pargev.jpg',
      thumb_url:   '/textures/001_pargev_thumb.jpg',
      width_mm: 500, height_mm: 500, depth_mm: 22,
      price: 510, active: true, sort_order: 11,
    },
  ]

  let panelCount = 0
  for (const p of panels) {
    const existing = await prisma.panel.findFirst({
      where: { tenant_id: tenant.id, sku: p.sku },
    })
    if (existing) {
      await prisma.panel.update({ where: { id: existing.id }, data: { ...p, tenant_id: tenant.id } })
    } else {
      await prisma.panel.create({ data: { ...p, tenant_id: tenant.id } })
    }
    panelCount++
    process.stdout.write(`\r  Panels: ${panelCount}/${panels.length}`)
  }
  console.log(`\nPanels: ${panelCount}`)

  // ── 5. Аксессуары — GLB из /public/uploads/models/ ────
  // Upsert by name (sku may be null in existing DB rows)
  const accessories = [
    {
      name:      'Розетка EU',
      sku:       'ACC-SOCK-01',
      type_id:   typeMap['socket'],
      model_url: '/uploads/models/socket.glb',
      thumb_url: PLACEHOLDER_THUMB,
      scale: 0.8, price: 350, active: true, sort_order: 1,
    },
    {
      name:      'Выключатель',
      sku:       'ACC-SWIT-01',
      type_id:   typeMap['switch'],
      model_url: '/uploads/models/switch.glb',
      thumb_url: PLACEHOLDER_THUMB,
      scale: 0.8, price: 280, active: true, sort_order: 2,
    },
    {
      name:      'Телевизор 55"',
      sku:       'ACC-TV-55',
      type_id:   typeMap['tv'],
      model_url: '/uploads/models/tv.glb',
      thumb_url: PLACEHOLDER_THUMB,
      scale: 1.5, price: 35000, active: true, sort_order: 3,
    },
    {
      name:      'Настенная лампа',
      sku:       'ACC-LAMP-01',
      type_id:   typeMap['lamp'],
      model_url: '/uploads/models/wall_lamp.glb',
      thumb_url: PLACEHOLDER_THUMB,
      scale: 1.2, price: 4500, active: true, sort_order: 4,
    },
    {
      name:      'Рамка для картины',
      sku:       'ACC-PIC-01',
      type_id:   typeMap['picture'],
      model_url: '/uploads/models/picture_frame.glb',
      thumb_url: PLACEHOLDER_THUMB,
      scale: 1.0, price: 1800, active: true, sort_order: 5,
    },
    {
      name:      'Настенная полка',
      sku:       'ACC-SHELF-01',
      type_id:   typeMap['shelf'],
      model_url: '/uploads/models/shelf.glb',
      thumb_url: PLACEHOLDER_THUMB,
      scale: 1.0, price: 2500, active: true, sort_order: 6,
    },
  ]

  let accCount = 0
  for (const a of accessories) {
    // Upsert by name — safe even if sku was null in DB
    const existing = await prisma.accessory.findFirst({
      where: { tenant_id: tenant.id, name: a.name },
    })
    if (existing) {
      await prisma.accessory.update({ where: { id: existing.id }, data: { ...a, tenant_id: tenant.id } })
    } else {
      await prisma.accessory.create({ data: { ...a, tenant_id: tenant.id } })
    }
    accCount++
  }
  console.log('Accessories:', accCount)

  // ── 6. Демо заявка (для показа в admin) ────────────────
  await prisma.lead.upsert({
    where: { id: 'demo-lead-001' },
    update: {},
    create: {
      id:        'demo-lead-001',
      tenant_id: tenant.id,
      name:      'Аршак Петросян',
      phone:     '+374 91 234567',
      comment:   'Хочу панели в гостиную, стена 4×2.7м',
      status:    'new',
      wall_config: {
        width:  4.0,
        height: 2.7,
        color:  '#f0ede4',
        panels: [{ sku: 'KON-A', name: 'Консул А' }, { sku: 'KON-B', name: 'Консул Б' }],
        total_panels: 108,
        total_cost: 48600,
        share_url: 'http://localhost:5173/?w=4.0&h=2.7&c=%23f0ede4&p0=KON-A&p1=KON-B',
      },
    },
  })
  console.log('Demo lead: ok')

  console.log('\nSeed completed!')
  console.log('  Admin: admin@wallcraft.am / admin123')
  console.log('  Store: ?store=wallcraft')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
