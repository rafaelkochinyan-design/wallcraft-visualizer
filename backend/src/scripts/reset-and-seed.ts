import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('🗑  Clearing all data...')

  await prisma.galleryItem.deleteMany()
  await prisma.blogPost.deleteMany()
  await prisma.heroSlide.deleteMany()
  await prisma.panel.deleteMany()
  await prisma.panelCategory.deleteMany()
  await prisma.project.deleteMany()
  await prisma.designer.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.partner.deleteMany()
  await prisma.dealer.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.inquiry.deleteMany()

  console.log('✅ Data cleared')
  console.log('🌱 Seeding demo data...')

  // ── 1. Update tenant ────────────────────────────────────────
  await prisma.tenant.updateMany({
    data: {
      name: 'WallCraft',
      phone: '+374 77 107408',
      email: 'Wallcraftam@gmail.com',
      address: 'Usub Bek Temuryan St. 37, Yerevan, Armenia',
      whatsapp: '+374 98 681966',
      instagram_url: 'https://www.instagram.com/wallcraft_am/',
      facebook_url: 'https://www.facebook.com/WallCraft3d/',
      tiktok_url: 'https://www.tiktok.com/@wallcraftapp',
      pinterest_url: null,
      primary_color: '#D4601A',
    },
  })

  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new Error('No tenant found — run prisma db seed first to create the base tenant')
  const tenantId = tenant.id

  console.log(`  Tenant updated: ${tenant.slug}`)

  // ── 2. Panel categories ─────────────────────────────────────
  const [catGeo, catOrg, catCls, catBrk] = await Promise.all([
    prisma.panelCategory.create({ data: { tenant_id: tenantId, name: 'Geometric', sort_order: 0 } }),
    prisma.panelCategory.create({ data: { tenant_id: tenantId, name: 'Organic', sort_order: 1 } }),
    prisma.panelCategory.create({ data: { tenant_id: tenantId, name: 'Classic', sort_order: 2 } }),
    prisma.panelCategory.create({ data: { tenant_id: tenantId, name: 'Brick & Stone', sort_order: 3 } }),
  ])

  const catMap: Record<string, string> = {
    geometric: catGeo.id,
    organic: catOrg.id,
    classic: catCls.id,
    'brick-stone': catBrk.id,
  }

  console.log('  4 categories created')

  // ── 3. Panels ───────────────────────────────────────────────
  const panelsData = [
    // GEOMETRIC
    {
      name: 'Consul', sku: 'WC-GEO-001', category: 'geometric',
      width_mm: 500, height_mm: 500, depth_mm: 19, depth_relief_mm: 25,
      weight_kg: 3.2, material: 'Natural gypsum', price: 31500,
      description: 'Clean geometric diamond pattern creating deep shadow play. Perfect for accent walls in living rooms and lobbies. Seamless tiling in any direction.',
      thumb_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90',
    },
    {
      name: 'Hexa', sku: 'WC-GEO-002', category: 'geometric',
      width_mm: 500, height_mm: 500, depth_mm: 19, depth_relief_mm: 20,
      weight_kg: 3.0, material: 'Natural gypsum', price: 28000,
      description: 'Hexagonal honeycomb structure inspired by nature. Creates a stunning 3D effect with directional lighting. Ideal for bedrooms and spa areas.',
      thumb_url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1200&q=90',
    },
    {
      name: 'Prism', sku: 'WC-GEO-003', category: 'geometric',
      width_mm: 600, height_mm: 300, depth_mm: 22, depth_relief_mm: 30,
      weight_kg: 3.8, material: 'Natural gypsum', price: 34000,
      description: 'Bold triangular prism pattern with dramatic depth. Statement piece for feature walls. The angular geometry creates ever-changing shadows throughout the day.',
      thumb_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=90',
    },
    {
      name: 'Vault', sku: 'WC-GEO-004', category: 'geometric',
      width_mm: 500, height_mm: 500, depth_mm: 22, depth_relief_mm: 32,
      weight_kg: 3.4, material: 'Natural gypsum', price: 38000,
      description: 'Architectural arch vault pattern with maximum relief depth. Creates a strong visual impact reminiscent of grand cathedral interiors. The deepest relief in the collection.',
      thumb_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1200&q=90',
    },
    // ORGANIC
    {
      name: 'Wave', sku: 'WC-ORG-001', category: 'organic',
      width_mm: 500, height_mm: 500, depth_mm: 19, depth_relief_mm: 22,
      weight_kg: 2.9, material: 'Natural gypsum', price: 26500,
      description: 'Flowing wave pattern inspired by ocean movement. Soft curves create a calming atmosphere. Perfect for bathrooms, bedrooms, and wellness spaces.',
      thumb_url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1200&q=90',
    },
    {
      name: 'Petal', sku: 'WC-ORG-002', category: 'organic',
      width_mm: 500, height_mm: 500, depth_mm: 19, depth_relief_mm: 18,
      weight_kg: 2.7, material: 'Natural gypsum', price: 24000,
      description: 'Delicate floral petal motif with soft overlapping layers. Brings nature indoors with an elegant botanical touch. Beautiful with warm lighting.',
      thumb_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=90',
    },
    {
      name: 'Ripple', sku: 'WC-ORG-003', category: 'organic',
      width_mm: 500, height_mm: 500, depth_mm: 19, depth_relief_mm: 28,
      weight_kg: 3.1, material: 'Natural gypsum', price: 29500,
      description: 'Concentric ripple rings radiating from the center. High relief creates dramatic shadow depth. A bold statement for contemporary dining and reception areas.',
      thumb_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1200&q=90',
    },
    // CLASSIC
    {
      name: 'Acanthus', sku: 'WC-CLS-001', category: 'classic',
      width_mm: 600, height_mm: 600, depth_mm: 25, depth_relief_mm: 35,
      weight_kg: 4.5, material: 'Natural gypsum', price: 42000,
      description: 'Classic Mediterranean acanthus leaf ornament with high relief. Timeless elegance for traditional and neoclassical interiors. A touch of ancient Rome in your home.',
      thumb_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=90',
    },
    {
      name: 'Roma', sku: 'WC-CLS-002', category: 'classic',
      width_mm: 500, height_mm: 500, depth_mm: 20, depth_relief_mm: 28,
      weight_kg: 3.5, material: 'Natural gypsum', price: 36000,
      description: 'Roman-inspired coffered panel with clean border framing. Sophisticated grid pattern perfect for ceilings and grand entrance halls.',
      thumb_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=90',
    },
    // BRICK & STONE
    {
      name: 'Brooklyn', sku: 'WC-BRK-001', category: 'brick-stone',
      width_mm: 600, height_mm: 200, depth_mm: 30, depth_relief_mm: 15,
      weight_kg: 4.2, material: 'Natural gypsum', price: 18500,
      description: 'Industrial-style elongated brick with authentic surface texture. Creates a loft aesthetic without the weight or cost of real brick. Available in any paint finish.',
      thumb_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&q=90',
    },
    {
      name: 'Slate', sku: 'WC-BRK-002', category: 'brick-stone',
      width_mm: 500, height_mm: 500, depth_mm: 25, depth_relief_mm: 20,
      weight_kg: 3.8, material: 'Natural gypsum', price: 22000,
      description: 'Natural slate stone imitation with raw, irregular texture. Perfect for feature walls, fireplaces, and outdoor-inspired interiors. Lightweight alternative to real stone.',
      thumb_url: 'https://images.unsplash.com/photo-1558905585-24cf272427a0?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1558905585-24cf272427a0?w=1200&q=90',
    },
    {
      name: 'Cobble', sku: 'WC-BRK-003', category: 'brick-stone',
      width_mm: 500, height_mm: 500, depth_mm: 28, depth_relief_mm: 22,
      weight_kg: 4.0, material: 'Natural gypsum', price: 25000,
      description: 'Irregular cobblestone pattern evoking old European streets. Warm and rustic character for restaurants, cafes, and boutique hotels.',
      thumb_url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=600&q=80',
      texture_url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1200&q=90',
    },
  ]

  for (let i = 0; i < panelsData.length; i++) {
    const { category, ...rest } = panelsData[i]
    await prisma.panel.create({
      data: {
        ...rest,
        tenant_id: tenantId,
        category_id: catMap[category],
        sort_order: i,
        active: true,
        images: [{ url: rest.texture_url! }],
      },
    })
  }

  console.log('  12 panels created')

  // ── 4. Hero slides ──────────────────────────────────────────
  await Promise.all([
    prisma.heroSlide.create({
      data: {
        tenant_id: tenantId,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=90',
        headline: { en: 'Sculpt Your Walls', ru: 'Скульптурные стены', am: 'Քանդակե՛ք ձեր պատերը' },
        subheadline: { en: 'Premium 3D gypsum panels. Handcrafted in Armenia.', ru: 'Премиальные 3D гипсовые панели. Ручная работа в Армении.', am: 'Պրեմիում 3D գիպսե վահանակներ։ Ձեռագործ Հայաստանում։' },
        cta_label: { en: 'Explore Collection', ru: 'Смотреть коллекцию', am: 'Դիտել հավաքածուն' },
        cta_url: '/products',
        sort_order: 0,
        active: true,
      },
    }),
    prisma.heroSlide.create({
      data: {
        tenant_id: tenantId,
        image_url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1920&q=90',
        headline: { en: 'Design Without Limits', ru: 'Дизайн без границ', am: 'Դիզայն առանց սահմանների' },
        subheadline: { en: 'From geometric precision to organic flow — find your perfect texture.', ru: 'От геометрической точности до органических форм — найдите свою текстуру.', am: 'Երկրաչափական ճշգրտությունից մինչև օրգանական հոսք — գտեք ձեր կատարյալ հյուսվածքը։' },
        cta_label: { en: 'Try 3D Visualizer', ru: 'Попробовать 3D визуализатор', am: 'Փորձել 3D վիզուալիզատոր' },
        cta_url: '/visualizer',
        sort_order: 1,
        active: true,
      },
    }),
    prisma.heroSlide.create({
      data: {
        tenant_id: tenantId,
        image_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1920&q=90',
        headline: { en: 'Made in Armenia', ru: 'Сделано в Армении', am: 'Պատրաստված է Հայաստանում' },
        subheadline: { en: '100% natural gypsum. Eco-friendly. Ready to paint. Since 2013.', ru: '100% натуральный гипс. Экологично. Готово к покраске. С 2013 года.', am: '100% բնական գիպս։ Էկոլոգիապես մաքուր։ Ներկելու պատրաստ։ 2013-ից։' },
        cta_label: { en: 'Our Story', ru: 'Наша история', am: 'Մեր պատմությունը' },
        cta_url: '/about',
        sort_order: 2,
        active: true,
      },
    }),
  ])

  console.log('  3 hero slides created')

  // ── 5. Gallery items ────────────────────────────────────────
  const galleryItems = [
    { image_url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=80', caption: 'Consul panels in living room accent wall', space_type: 'living_room', sort_order: 0 },
    { image_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80', caption: 'Wave panels in master bedroom', space_type: 'bedroom', sort_order: 1 },
    { image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80', caption: 'Prism panels in corporate office reception', space_type: 'office', sort_order: 2 },
    { image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80', caption: 'Roma panels in boutique hotel suite', space_type: 'hotel', sort_order: 3 },
    { image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80', caption: 'Brooklyn brick in upscale restaurant', space_type: 'restaurant', sort_order: 4 },
    { image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80', caption: 'Slate panels in spa bathroom', space_type: 'bathroom', sort_order: 5 },
    { image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80', caption: 'Acanthus panels in classic living room', space_type: 'living_room', sort_order: 6 },
    { image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85', thumb_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80', caption: 'Hexa panels in modern bedroom', space_type: 'bedroom', sort_order: 7 },
  ]

  await Promise.all(
    galleryItems.map((item) =>
      prisma.galleryItem.create({ data: { ...item, tenant_id: tenantId, active: true } })
    )
  )

  console.log('  8 gallery items created')

  // ── 6. Blog posts ───────────────────────────────────────────
  await Promise.all([
    prisma.blogPost.create({
      data: {
        tenant_id: tenantId,
        slug: 'how-to-choose-3d-wall-panels',
        title: { en: 'How to Choose the Right 3D Wall Panel for Your Space', ru: 'Как выбрать правильную 3D панель для вашего интерьера', am: 'Ինչպես ընտրել ճիշտ 3D պատի վահանակ ձեր տարածության համար' },
        excerpt: { en: 'A complete guide to matching panel style, relief depth, and texture to your interior design vision.', ru: 'Полное руководство по подбору стиля панели, глубины рельефа и текстуры под ваш дизайн.', am: 'Ամբողջական ուղեցույց վահանակի ոճը, ռելիեֆի խորությունը և հյուսվածքը ձեր ինտերիերի տեսլականին համապատասխանեցնելու համար։' },
        body: { en: '<p>Choosing the right 3D wall panel transforms a room from ordinary to extraordinary.</p><h2>Relief Depth</h2><p>Shallow relief (15-20mm) works best in smaller rooms. Deep relief (25-35mm) creates maximum drama for large spaces and hotel lobbies.</p><h2>Pattern Style</h2><p>Geometric patterns suit contemporary interiors. Organic patterns work beautifully in bedrooms. Classic ornamental panels bring timeless elegance to traditional homes.</p>', ru: '<p>Правильный выбор 3D-панели превращает комнату из обычной в исключительную...</p>', am: '<p>Ճիշտ 3D պատի վահանակի ընտրությունը սենյակը սովորականից արտակարգ է դարձնում...</p>' },
        category: 'tips',
        published: true,
        published_at: new Date('2024-09-15'),
        cover_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=85',
      },
    }),
    prisma.blogPost.create({
      data: {
        tenant_id: tenantId,
        slug: 'installation-guide-gypsum-panels',
        title: { en: 'Step-by-Step Installation Guide for Gypsum 3D Panels', ru: 'Пошаговое руководство по монтажу гипсовых 3D панелей', am: 'Գիպսե 3D վահանակների տեղադրման քայլ առ քայլ ուղեցույց' },
        excerpt: { en: 'Learn how to install WallCraft gypsum panels like a professional with our detailed step-by-step guide.', ru: 'Узнайте, как монтировать гипсовые панели WallCraft как профессионал.', am: 'Իմացեք, թե ինչպես տեղադրել WallCraft գիպսե վահանակները պրոֆեսիոնալի նման։' },
        body: { en: '<p>Installing WallCraft 3D gypsum panels is straightforward with the right preparation.</p><h2>What You Need</h2><p>Tube adhesive, spirit level, pencil, sandpaper (120 grit), primer, paint.</p><h2>Step 1: Surface Preparation</h2><p>Clean the wall surface and ensure it is smooth, dry, and level.</p><h2>Step 2: Layout Planning</h2><p>Plan your layout before applying adhesive. Start from the center of the wall and work outward.</p>', ru: '<p>Монтаж 3D гипсовых панелей WallCraft прост при правильной подготовке...</p>', am: '<p>WallCraft 3D գիպսե վահանակների տեղադրումը պարզ է ճիշտ նախապատրաստությամբ...</p>' },
        category: 'tips',
        published: true,
        published_at: new Date('2024-10-20'),
        cover_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85',
      },
    }),
    prisma.blogPost.create({
      data: {
        tenant_id: tenantId,
        slug: 'wallcraft-new-collection-2024',
        title: { en: 'WallCraft Launches New Vault Collection — Deepest Relief Yet', ru: 'WallCraft представляет новую коллекцию Vault — самый глубокий рельеф', am: 'WallCraft-ը ներկայացնում է նոր Vault հավաքածուն — ամենախոր ռելիեֆը' },
        excerpt: { en: 'Our new Vault panel pushes the boundaries of gypsum relief with 32mm depth — the most dramatic panel in our history.', ru: 'Наша новая панель Vault раздвигает границы гипсового рельефа до 32 мм.', am: 'Մեր նոր Vault վահանակը գիպսե ռելիեֆի սահմաններն է հրում 32 մմ խորությամբ։' },
        body: { en: '<p>We are excited to announce the launch of our most ambitious panel to date — the Vault. With 32mm of relief depth, it creates shadows unlike anything in our previous collections.</p>', ru: '<p>Рады объявить о запуске нашей самой амбициозной панели — Vault...</p>', am: '<p>Ուրախ ենք հայտարարել մեր ամենաամբիցիոզ վահանակի մեկնարկի մասին — Vault...</p>' },
        category: 'news',
        published: true,
        published_at: new Date('2024-11-05'),
        cover_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=85',
      },
    }),
  ])

  console.log('  3 blog posts created')

  // ── 7. Projects ─────────────────────────────────────────────
  await Promise.all([
    prisma.project.create({
      data: {
        tenant_id: tenantId,
        title: 'Cascade Boutique Hotel — Yerevan',
        slug: 'cascade-boutique-hotel',
        description: 'Full lobby and suite wall paneling using Roma and Acanthus panels. 480 sqm covered.',
        cover_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85',
        space_type: 'hotel',
        active: true,
        sort_order: 0,
      },
    }),
    prisma.project.create({
      data: {
        tenant_id: tenantId,
        title: 'Private Villa — Tsakhkadzor',
        slug: 'private-villa-tsakhkadzor',
        description: 'Custom bedroom and living room installation with Wave and Consul panels throughout.',
        cover_url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=85',
        space_type: 'living_room',
        active: true,
        sort_order: 1,
      },
    }),
    prisma.project.create({
      data: {
        tenant_id: tenantId,
        title: 'Antares Restaurant — Yerevan',
        slug: 'antares-restaurant-yerevan',
        description: 'Industrial loft concept using Brooklyn brick panels across 200 sqm dining area.',
        cover_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=85',
        space_type: 'restaurant',
        active: true,
        sort_order: 2,
      },
    }),
  ])

  console.log('  3 projects created')

  console.log('\n✅ Demo data seeded successfully!')
  console.log('📊 Summary:')
  console.log('  - 4 categories')
  console.log('  - 12 panels')
  console.log('  - 3 hero slides')
  console.log('  - 8 gallery items')
  console.log('  - 3 blog posts')
  console.log('  - 3 projects')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
