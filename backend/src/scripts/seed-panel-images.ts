/**
 * seed-panel-images.ts
 * Adds Unsplash placeholder images to existing WallCraft panels.
 *
 * Run against production (Neon):
 *   DATABASE_URL="postgresql://neondb_owner:..." npx ts-node src/scripts/seed-panel-images.ts
 *
 * Run against local DB:
 *   npx ts-node src/scripts/seed-panel-images.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Each entry: panel name as stored in DB → array of { url, thumb_url, caption }
// All images are from Unsplash (free to use, no attribution required for seed/dev).
// Using two sizes per image: w=800 for thumbnail, w=1600 for full.
const PANEL_IMAGES: Record<string, { url: string; thumb_url: string; caption: string }[]> = {
  'Wave 3D': [
    {
      url:       'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
      caption:   'Wave 3D panel — undulating relief, warm lighting',
    },
    {
      url:       'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
      caption:   'Wave 3D panel — full wall installation',
    },
  ],
  'Diamond': [
    {
      url:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      caption:   'Diamond panel — geometric relief detail',
    },
    {
      url:       'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      caption:   'Diamond panel — accent wall installation',
    },
  ],
  'Hexagon': [
    {
      url:       'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=80',
      caption:   'Hexagon panel — honeycomb 3D texture',
    },
    {
      url:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      caption:   'Hexagon panel — geometric detail with shadows',
    },
  ],
  'Scales': [
    {
      url:       'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
      caption:   'Scales panel — overlapping scale relief',
    },
    {
      url:       'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&q=80',
      caption:   'Scales panel — bedroom accent wall',
    },
  ],
  'Loft Brick': [
    {
      url:       'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
      caption:   'Loft Brick panel — industrial texture close-up',
    },
    {
      url:       'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80',
      caption:   'Loft Brick panel — loft interior installation',
    },
  ],
  'Metro': [
    {
      url:       'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&q=80',
      caption:   'Metro panel — urban modern tile',
    },
    {
      url:       'https://images.unsplash.com/photo-1558905585-24cf272427a0?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1558905585-24cf272427a0?w=800&q=80',
      caption:   'Metro panel — clean stone finish',
    },
  ],
  'Slab': [
    {
      url:       'https://images.unsplash.com/photo-1558905585-24cf272427a0?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1558905585-24cf272427a0?w=800&q=80',
      caption:   'Slab panel — minimalist concrete texture',
    },
    {
      url:       'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      caption:   'Slab panel — modern living room wall',
    },
  ],
  'Linear': [
    {
      url:       'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      caption:   'Linear panel — horizontal line relief',
    },
    {
      url:       'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
      caption:   'Linear panel — contemporary interior',
    },
  ],
  'Classico': [
    {
      url:       'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      caption:   'Classico panel — classic interior detail',
    },
    {
      url:       'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      caption:   'Classico panel — elegant room installation',
    },
  ],
  'Baroque': [
    {
      url:       'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
      caption:   'Baroque panel — ornate high-relief detail',
    },
    {
      url:       'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
      caption:   'Baroque panel — grand room accent wall',
    },
  ],
  'Arabesque': [
    {
      url:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      caption:   'Arabesque panel — geometric ornamental pattern',
    },
    {
      url:       'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80',
      caption:   'Arabesque panel — classic hallway installation',
    },
  ],
  'Lotus': [
    {
      url:       'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
      caption:   'Lotus panel — floral relief in living room',
    },
    {
      url:       'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=85',
      thumb_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      caption:   'Lotus panel — bedroom feature wall',
    },
  ],
}

async function main() {
  // Find wallcraft tenant
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'wallcraft' } })
  if (!tenant) {
    console.error('Tenant "wallcraft" not found. Run the main seed first.')
    process.exit(1)
  }

  // Get all panels for this tenant
  const panels = await prisma.panel.findMany({
    where: { tenant_id: tenant.id },
    include: { panelImages: true },
  })

  console.log(`Found ${panels.length} panels for tenant "${tenant.slug}"`)

  let created = 0
  let skipped = 0

  for (const panel of panels) {
    const images = PANEL_IMAGES[panel.name]

    if (!images) {
      console.log(`  ⚠  No images defined for "${panel.name}" — skipping`)
      skipped++
      continue
    }

    // Skip if already has images
    if (panel.panelImages.length > 0) {
      console.log(`  ✓  "${panel.name}" already has ${panel.panelImages.length} image(s) — skipping`)
      skipped++
      continue
    }

    // Create images with sort_order: 0 = thumbnail
    for (let i = 0; i < images.length; i++) {
      await prisma.panelImage.create({
        data: {
          panel_id:   panel.id,
          url:        images[i].url,
          caption:    images[i].caption,
          sort_order: i,
        },
      })
    }

    console.log(`  ✅ "${panel.name}" — added ${images.length} image(s)`)
    created += images.length
  }

  console.log(`\nDone. Created ${created} images, skipped ${skipped} panels.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
