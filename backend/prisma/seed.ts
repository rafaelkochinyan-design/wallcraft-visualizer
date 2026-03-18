import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Tenant: Wallcraft
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'wallcraft' },
    update: {},
    create: {
      slug: 'wallcraft',
      name: 'Wallcraft',
      primary_color: '#1a1a1a',
    },
  })
  console.log('✅ Tenant:', tenant.slug)

  // 2. Admin user
  const passwordHash = await bcrypt.hash('admin123', 10)
  const user = await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenant.id, email: 'admin@wallcraft.am' } },
    update: {},
    create: {
      tenant_id: tenant.id,
      email: 'admin@wallcraft.am',
      password_hash: passwordHash,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user:', user.email)

  // 3. Accessory types
  const accessoryTypes = [
    { name: 'socket',  label_ru: 'Розетка' },
    { name: 'switch',  label_ru: 'Выключатель' },
    { name: 'tv',      label_ru: 'Телевизор' },
    { name: 'lamp',    label_ru: 'Лампа' },
    { name: 'picture', label_ru: 'Картина' },
    { name: 'shelf',   label_ru: 'Полка' },
  ]
  for (const at of accessoryTypes) {
    await prisma.accessoryType.upsert({
      where: { name: at.name },
      update: {},
      create: at,
    })
  }
  console.log('✅ Accessory types:', accessoryTypes.length)

  // 4. Panel category
  const category = await prisma.panelCategory.upsert({
    where: { id: 'cat-consul' },
    update: {},
    create: {
      id: 'cat-consul',
      tenant_id: tenant.id,
      name: 'Консул',
      sort_order: 0,
    },
  })

  // 5. Panels — Консул А and Консул Б
  // NOTE: consul_b is the same texture as consul_a but rotated 180° in the frontend.
  // Both point to the same texture file for MVP. Rotation handled in PanelTiling.tsx.
  const panels = [
    {
      id: 'panel-consul-a',
      name: 'Консул А',
      sku: 'CONSUL-A',
      texture_url: '/textures/consul_a.jpg',
      thumb_url: '/textures/consul_a_thumb.jpg',
      sort_order: 0,
    },
    {
      id: 'panel-consul-b',
      name: 'Консул Б',
      sku: 'CONSUL-B',
      texture_url: '/textures/consul_a.jpg', // same file, rotated in frontend
      thumb_url: '/textures/consul_a_thumb.jpg',
      sort_order: 1,
    },
  ]
  for (const p of panels) {
    await prisma.panel.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...p,
        tenant_id: tenant.id,
        category_id: category.id,
        width_mm: 500,
        height_mm: 500,
        depth_mm: 19,
        weight_kg: 3.2,
      },
    })
  }
  console.log('✅ Panels:', panels.length)

  console.log('\n🎉 Seed complete!')
  console.log('   Tenant slug: wallcraft')
  console.log('   Admin login: admin@wallcraft.am / admin123')
  console.log('\n⚠️  Remember to add consul_a.jpg to frontend/public/textures/')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
