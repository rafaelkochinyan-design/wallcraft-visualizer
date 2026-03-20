/**
 * seed.ts — демо данные для Wallcraft
 * 
 * Запуск: cd backend && npx prisma db seed
 * или:    npx ts-node prisma/seed.ts
 * 
 * Добавляет:
 * - 1 tenant (Wallcraft Yerevan)
 * - 1 admin user
 * - 13 панелей (все из каталога клиента)
 * - 6 типов аксессуаров
 * - 6 аксессуаров
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding WallCraft demo data...')

  // ── 1. Tenant ──────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'wallcraft' },
    update: {},
    create: {
      slug:          'wallcraft',
      name:          'Wallcraft',
      logo_url:      '/wallcraft_logo.png',
      primary_color: '#1c1c1e',
      email:         'info@wallcraft.am',
      phone:         '+374 77 123456',
      address:       'Ереван, Армения',
      active:        true,
    },
  })
  console.log('✅ Tenant:', tenant.slug)

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
  console.log('✅ User:', user.email)

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
  console.log('✅ Accessory types:', accTypes.length)

  const typeMap = Object.fromEntries(accTypes.map(t => [t.name, t.id]))

  // ── 4. Панели ─────────────────────────────────────────
  const panels = [
    {
      name:        'Консул А',
      sku:         'KON-A',
      description:'Классический рифлёный гипс. Оригинальный паттерн.',
      texture_url: '/textures/consul_a.jpg',
      thumb_url:   '/textures/consul_a_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 19,
      price:       450, active: true, sort_order: 1,
    },
    {
      name:        'Консул Б',
      sku:         'KON-B',
      description:'Консул повёрнутый 180° — для шахматного паттерна.',
      texture_url: '/textures/consul_b.jpg',
      thumb_url:   '/textures/consul_b_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 19,
      price:       450, active: true, sort_order: 2,
    },
    {
      name:        'Drop',
      sku:         'DROP-01',
      description:'Объёмные капли. Эффектный акцент на любой стене.',
      texture_url: '/textures/drop.jpg',
      thumb_url:   '/textures/drop_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 25,
      price:       680, active: true, sort_order: 3,
    },
    {
      name:        'Asia C-03',
      sku:         'ASIA-03',
      description:'Геометрический восточный орнамент.',
      texture_url: '/textures/asia_c03.jpg',
      thumb_url:   '/textures/asia_c03_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 20,
      price:       590, active: true, sort_order: 4,
    },
    {
      name:        'Taza Gic',
      sku:         'TAZA-01',
      description:'Плавные изогнутые линии.',
      texture_url: '/textures/taza_gic.jpg',
      thumb_url:   '/textures/taza_gic_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 22,
      price:       520, active: true, sort_order: 5,
    },
    {
      name:        'Aliq Atlantic',
      sku:         'ALIQ-AT',
      description:'Волновой рельеф в морском стиле.',
      texture_url: '/textures/aliq_atlantic.jpg',
      thumb_url:   '/textures/aliq_atlantic_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 20,
      price:       560, active: true, sort_order: 6,
    },
    {
      name:        'Klips Blade',
      sku:         'KLIPS-BL',
      description:'Острые лезвия. Максимальный 3D-эффект.',
      texture_url: '/textures/klips_blade.jpg',
      thumb_url:   '/textures/klips_blade_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 30,
      price:       780, active: true, sort_order: 7,
    },
    {
      name:        'Metax Wave',
      sku:         'META-WV',
      description:'Глубокие волны 600×400мм. Премиум сегмент.',
      texture_url: '/textures/metax_wave.jpg',
      thumb_url:   '/textures/metax_wave_thumb.jpg',
      width_mm:    600, height_mm: 400, depth_mm: 80,
      price:       1200, active: true, sort_order: 8,
    },
    {
      name:        'Tuxt M-35',
      sku:         'TUXT-35',
      description:'Пирамидальный рельеф M-35.',
      texture_url: '/textures/tuxt_m35.jpg',
      thumb_url:   '/textures/tuxt_m35_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 35,
      price:       690, active: true, sort_order: 9,
    },
    {
      name:        'Hin Gic Omega',
      sku:         'OMEGA-2',
      description:'Лаконичный геометрический орнамент.',
      texture_url: '/textures/omega2.jpg',
      thumb_url:   '/textures/omega2_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 20,
      price:       540, active: true, sort_order: 10,
    },
    {
      name:        'D-03',
      sku:         'D-03',
      description:'Классическая ромбовидная сетка.',
      texture_url: '/textures/d03.jpg',
      thumb_url:   '/textures/d03_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 18,
      price:       480, active: true, sort_order: 11,
    },
    {
      name:        'Deco Line M-50',
      sku:         'DECO-50',
      description:'Глубокие рейки M-50. Максимальная глубина рельефа.',
      texture_url: '/textures/deco_m50.jpg',
      thumb_url:   '/textures/deco_m50_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 50,
      price:       890, active: true, sort_order: 12,
    },
    {
      name:        'Декор Паргев',
      sku:         'PARG-01',
      description:'Армянский декоративный мотив. Эксклюзивный дизайн.',
      texture_url: '/textures/pargev.jpg',
      thumb_url:   '/textures/pargev_thumb.jpg',
      width_mm:    500, height_mm: 500, depth_mm: 22,
      price:       510, active: true, sort_order: 13,
    },
  ]

  let panelCount = 0
  for (const p of panels) {
    const { description: _d, ...panelData } = p as any
    const existing = await prisma.panel.findFirst({ where: { tenant_id: tenant.id, sku: panelData.sku } })
    if (existing) {
      await prisma.panel.update({ where: { id: existing.id }, data: { ...panelData, tenant_id: tenant.id } })
    } else {
      await prisma.panel.create({ data: { ...panelData, tenant_id: tenant.id } })
    }
    panelCount++
    process.stdout.write(`\r  Panels: ${panelCount}/${panels.length}`)
  }
  console.log('\n✅ Panels:', panelCount)

  // ── 5. Аксессуары ─────────────────────────────────────
  const accessories = [
    {
      name:      'Настенная полка',
      sku:       'ACC-SHELF-01',
      type_id:   typeMap['shelf'],
      model_url: '/models/shelf.glb',
      thumb_url: '/models/thumbs/shelf.jpg',
      scale:     1.0,
      price:     2500, active: true,
    },
    {
      name:      'Розетка',
      sku:       'ACC-SOCK-01',
      type_id:   typeMap['socket'],
      model_url: '/models/socket.glb',
      thumb_url: '/models/thumbs/socket.jpg',
      scale:     0.8,
      price:     350, active: true,
    },
    {
      name:      'Выключатель',
      sku:       'ACC-SWIT-01',
      type_id:   typeMap['switch'],
      model_url: '/models/switch.glb',
      thumb_url: '/models/thumbs/switch.jpg',
      scale:     0.8,
      price:     280, active: true,
    },
    {
      name:      'Настенное бра',
      sku:       'ACC-LAMP-01',
      type_id:   typeMap['lamp'],
      model_url: '/models/wall_lamp.glb',
      thumb_url: '/models/thumbs/lamp.jpg',
      scale:     1.2,
      price:     4500, active: true,
    },
    {
      name:      'Телевизор 55"',
      sku:       'ACC-TV-55',
      type_id:   typeMap['tv'],
      model_url: '/models/tv.glb',
      thumb_url: '/models/thumbs/tv.jpg',
      scale:     1.5,
      price:     35000, active: true,
    },
    {
      name:      'Картина в раме',
      sku:       'ACC-PIC-01',
      type_id:   typeMap['picture'],
      model_url: '/models/picture_frame.glb',
      thumb_url: '/models/thumbs/picture.jpg',
      scale:     1.0,
      price:     1800, active: true,
    },
  ]

  let accCount = 0
  for (const a of accessories) {
    const existing = await prisma.accessory.findFirst({ where: { tenant_id: tenant.id, sku: a.sku } })
    if (existing) {
      await prisma.accessory.update({ where: { id: existing.id }, data: { ...a, tenant_id: tenant.id } })
    } else {
      await prisma.accessory.create({ data: { ...a, tenant_id: tenant.id } })
    }
    accCount++
  }
  console.log('✅ Accessories:', accCount)

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
  console.log('✅ Demo lead created')

  console.log('\n🎉 Seed completed!')
  console.log('   Admin: admin@wallcraft.am / admin123')
  console.log('   Store: ?store=wallcraft (dev) or wallcraft.yourdomain.com')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
