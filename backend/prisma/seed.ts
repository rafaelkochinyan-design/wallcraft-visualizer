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

  // 4. Delete old texture-based panels
  await prisma.panel.deleteMany({ where: { tenant_id: tenant.id } })
  console.log('🗑️  Deleted old panels')

  // 5. Panel categories
  const cats = {
    drop:    await prisma.panelCategory.upsert({ where: { id: 'cat-drop'    }, update: { name: 'Drop'    }, create: { id: 'cat-drop',    tenant_id: tenant.id, name: 'Drop',    sort_order: 0 } }),
    asia:    await prisma.panelCategory.upsert({ where: { id: 'cat-asia'    }, update: { name: 'Asia'    }, create: { id: 'cat-asia',    tenant_id: tenant.id, name: 'Asia',    sort_order: 1 } }),
    klips:   await prisma.panelCategory.upsert({ where: { id: 'cat-klips'   }, update: { name: 'Klips'   }, create: { id: 'cat-klips',   tenant_id: tenant.id, name: 'Klips',   sort_order: 2 } }),
    metax:   await prisma.panelCategory.upsert({ where: { id: 'cat-metax'   }, update: { name: 'Metax'   }, create: { id: 'cat-metax',   tenant_id: tenant.id, name: 'Metax',   sort_order: 3 } }),
    classic: await prisma.panelCategory.upsert({ where: { id: 'cat-classic' }, update: { name: 'Classic' }, create: { id: 'cat-classic', tenant_id: tenant.id, name: 'Classic', sort_order: 4 } }),
  }

  // 6. 3D Model Panels (OBJ → GLB converted from Files 05)
  const panels = [
    { id: 'panel-drop',     name: 'Drop',          sku: 'WC-DROP',     category_id: cats.drop.id,    model_url: '/uploads/panels/drop.glb',      thumb_url: '/uploads/panels/drop_thumb.jpg',      width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 0 },
    { id: 'panel-c03',      name: 'C-03',           sku: 'WC-C03',      category_id: cats.asia.id,    model_url: '/uploads/panels/c03.glb',       thumb_url: '/uploads/panels/c03_thumb.png',       width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 1 },
    { id: 'panel-artpole',  name: 'Artpole',        sku: 'WC-ARTPOLE',  category_id: cats.classic.id, model_url: '/uploads/panels/artpole.glb',   thumb_url: '/uploads/panels/artpole_thumb.jpg',   width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 2 },
    { id: 'panel-blade',    name: 'Blade',          sku: 'WC-BLADE',    category_id: cats.klips.id,   model_url: '/uploads/panels/blade.glb',     thumb_url: '/uploads/panels/blade_thumb.png',     width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 3 },
    { id: 'panel-wave',     name: 'Wave',           sku: 'WC-WAVE',     category_id: cats.metax.id,   model_url: '/uploads/panels/wave.glb',      thumb_url: '/uploads/panels/wave_thumb.jpg',      width_mm: 600, height_mm: 400, depth_mm: 80, sort_order: 4 },
    { id: 'panel-m35',      name: 'M-35',           sku: 'WC-M35',      category_id: cats.classic.id, model_url: '/uploads/panels/m35.glb',       thumb_url: '/uploads/panels/m35_thumb.jpg',       width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 5 },
    { id: 'panel-omega2',   name: 'Omega 2',        sku: 'WC-OMEGA2',   category_id: cats.classic.id, model_url: '/uploads/panels/omega2.glb',    thumb_url: '/uploads/panels/omega2_thumb.png',    width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 6 },
    { id: 'panel-d03',      name: 'D-03',           sku: 'WC-D03',      category_id: cats.classic.id, model_url: '/uploads/panels/d03.glb',       thumb_url: '/uploads/panels/d03_thumb.jpg',       width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 7 },
    { id: 'panel-decoline', name: 'Deco Line M-50', sku: 'WC-DECOLINE', category_id: cats.classic.id, model_url: '/uploads/panels/decoLine.glb',  thumb_url: '/uploads/panels/decoLine_thumb.png',  width_mm: 500, height_mm: 500, depth_mm: 19, sort_order: 8 },
  ]

  for (const p of panels) {
    await prisma.panel.upsert({
      where: { id: p.id },
      update: p,
      create: { ...p, tenant_id: tenant.id, texture_url: null, active: true },
    })
  }
  console.log('✅ Panels:', panels.length)

  console.log('\n🎉 Seed complete!')
  console.log('   Admin login: admin@wallcraft.am / admin123')
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
