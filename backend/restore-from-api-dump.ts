/**
 * Restores production data from API dump JSON into any PostgreSQL DB.
 * Usage: npx ts-node restore-from-api-dump.ts
 * For Neon: DATABASE_URL=<neon_url> npx ts-node restore-from-api-dump.ts
 */
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const apiDump = JSON.parse(fs.readFileSync('D:/Wallcraft/wallcraft-api-dump.json', 'utf-8'));

async function main() {
  const targetDb = process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'local';
  console.log('Restoring production data into:', targetDb);

  // 1. Tenant (from settings)
  const s = apiDump.settings || {};
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'wallcraft' },
    update: {
      name: s.name || 'WallCraft',
      logo_url: s.logo_url || null,
      primary_color: s.primary_color || '#D4601A',
      phone: s.phone || null,
      email: s.email || null,
      address: s.address || null,
      whatsapp: s.whatsapp || null,
      facebook_url: s.facebook_url || s.facebook || null,
      instagram_url: s.instagram_url || null,
      tiktok_url: s.tiktok_url || s.tiktok || null,
    },
    create: {
      slug: 'wallcraft',
      name: s.name || 'WallCraft',
      logo_url: s.logo_url || null,
      primary_color: s.primary_color || '#D4601A',
      phone: s.phone || null,
      email: s.email || null,
      address: s.address || null,
      whatsapp: s.whatsapp || null,
    }
  });
  console.log(`  tenant: ${tenant.slug} (id: ${tenant.id})`);

  // 2. Panel categories
  for (const c of apiDump.panel_categories || []) {
    await prisma.panelCategory.upsert({
      where: { id: c.id },
      update: { name: c.name, sort_order: c.sort_order, tenant_id: tenant.id },
      create: { id: c.id, name: c.name, sort_order: c.sort_order ?? 0, tenant_id: tenant.id }
    });
  }
  console.log(`  panel_categories: ${(apiDump.panel_categories || []).length}`);

  // 3. Panels + images + sizes
  for (const p of apiDump.panels || []) {
    await prisma.panel.upsert({
      where: { id: p.id },
      update: {
        name: p.name, description: p.description,
        category_id: p.category_id || null, zip_url: p.zip_url || null,
        width_mm: p.width_mm || null, height_mm: p.height_mm || null, depth_mm: p.depth_mm || null,
        price: p.price || null, active: p.active ?? true, sort_order: p.sort_order ?? 0,
        tenant_id: tenant.id,
      },
      create: {
        id: p.id, name: p.name, description: p.description || null,
        category_id: p.category_id || null, zip_url: p.zip_url || null,
        width_mm: p.width_mm || null, height_mm: p.height_mm || null, depth_mm: p.depth_mm || null,
        price: p.price || null, active: p.active ?? true, sort_order: p.sort_order ?? 0,
        tenant_id: tenant.id,
      }
    });
    for (const img of (p.images || [])) {
      await prisma.panelImage.upsert({
        where: { id: img.id },
        update: { panel_id: p.id, url: img.url, caption: img.caption || null, sort_order: img.sort_order ?? 0 },
        create: { id: img.id, panel_id: p.id, url: img.url, caption: img.caption || null, sort_order: img.sort_order ?? 0 }
      });
    }
    for (const sz of (p.sizes || [])) {
      await prisma.panelSize.upsert({
        where: { id: sz.id },
        update: { panel_id: p.id, label: sz.label, width_mm: sz.width_mm || null, height_mm: sz.height_mm || null, depth_mm: sz.depth_mm || null, price: sz.price || null, sort_order: sz.sort_order ?? 0 },
        create: { id: sz.id, panel_id: p.id, label: sz.label, width_mm: sz.width_mm || null, height_mm: sz.height_mm || null, depth_mm: sz.depth_mm || null, price: sz.price || null, sort_order: sz.sort_order ?? 0 }
      });
    }
  }
  console.log(`  panels: ${(apiDump.panels || []).length}`);

  // 4. Collections
  for (const c of apiDump.collections || []) {
    await prisma.collection.upsert({
      where: { id: c.id },
      update: { name: c.name, slug: c.slug, description: c.description || null, cover_url: c.cover_url || null, panel_ids: c.panel_ids ?? [], active: c.active ?? true, sort_order: c.sort_order ?? 0, tenant_id: tenant.id },
      create: { id: c.id, name: c.name, slug: c.slug, description: c.description || null, cover_url: c.cover_url || null, panel_ids: c.panel_ids ?? [], active: c.active ?? true, sort_order: c.sort_order ?? 0, tenant_id: tenant.id }
    });
  }
  console.log(`  collections: ${(apiDump.collections || []).length}`);

  // 5. Hero slides
  for (const h of apiDump.hero_slides || []) {
    await prisma.heroSlide.upsert({
      where: { id: h.id },
      update: { image_url: h.image_url, headline: h.headline ?? {}, subheadline: h.subheadline ?? {}, cta_label: h.cta_label ?? {}, cta_url: h.cta_url || null, sort_order: h.sort_order ?? 0, active: h.active ?? true, tenant_id: tenant.id },
      create: { id: h.id, image_url: h.image_url, headline: h.headline ?? {}, subheadline: h.subheadline ?? {}, cta_label: h.cta_label ?? {}, cta_url: h.cta_url || null, sort_order: h.sort_order ?? 0, active: h.active ?? true, tenant_id: tenant.id }
    });
  }
  console.log(`  hero_slides: ${(apiDump.hero_slides || []).length}`);

  // 6. Gallery items
  for (const g of apiDump.gallery_items || []) {
    await prisma.galleryItem.upsert({
      where: { id: g.id },
      update: { image_url: g.image_url, thumb_url: g.thumb_url || null, caption: g.caption || null, space_type: g.space_type || null, tags: g.tags ?? [], sort_order: g.sort_order ?? 0, active: g.active ?? true, tenant_id: tenant.id },
      create: { id: g.id, image_url: g.image_url, thumb_url: g.thumb_url || null, caption: g.caption || null, space_type: g.space_type || null, tags: g.tags ?? [], sort_order: g.sort_order ?? 0, active: g.active ?? true, tenant_id: tenant.id }
    });
  }
  console.log(`  gallery_items: ${(apiDump.gallery_items || []).length}`);

  // 7. Blog posts
  for (const b of apiDump.blog_posts || []) {
    await prisma.blogPost.upsert({
      where: { id: b.id },
      update: { slug: b.slug, title: b.title ?? {}, excerpt: b.excerpt ?? {}, body: b.body ?? {}, cover_url: b.cover_url || null, published: b.published ?? false, tenant_id: tenant.id },
      create: { id: b.id, slug: b.slug, title: b.title ?? {}, excerpt: b.excerpt ?? {}, body: b.body ?? {}, cover_url: b.cover_url || null, published: b.published ?? false, tenant_id: tenant.id }
    });
  }
  console.log(`  blog_posts: ${(apiDump.blog_posts || []).length}`);

  // 8. Projects
  for (const p of apiDump.projects || []) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: { title: p.title ?? {}, slug: p.slug, description: p.description ?? {}, cover_url: p.cover_url || null, images: p.images ?? [], space_type: p.space_type || null, panel_ids: p.panel_ids ?? [], active: p.active ?? true, tenant_id: tenant.id },
      create: { id: p.id, title: p.title ?? {}, slug: p.slug, description: p.description ?? {}, cover_url: p.cover_url || null, images: p.images ?? [], space_type: p.space_type || null, panel_ids: p.panel_ids ?? [], active: p.active ?? true, tenant_id: tenant.id }
    });
  }
  console.log(`  projects: ${(apiDump.projects || []).length}`);

  // 9. Designers
  for (const d of apiDump.designers || []) {
    await prisma.designer.upsert({
      where: { id: d.id },
      update: { name: d.name, slug: d.slug, photo_url: d.photo_url || null, bio: d.bio ?? {}, portfolio: d.portfolio ?? [], instagram: d.instagram || null, website: d.website || null, active: d.active ?? true, tenant_id: tenant.id },
      create: { id: d.id, name: d.name, slug: d.slug, photo_url: d.photo_url || null, bio: d.bio ?? {}, portfolio: d.portfolio ?? [], instagram: d.instagram || null, website: d.website || null, active: d.active ?? true, tenant_id: tenant.id }
    });
  }
  console.log(`  designers: ${(apiDump.designers || []).length}`);

  // 10. Dealers
  for (const d of apiDump.dealers || []) {
    await prisma.dealer.upsert({
      where: { id: d.id },
      update: { name: d.name, country: d.country || '', city: d.city || '', address: d.address || null, phone: d.phone || null, email: d.email || null, lat: d.lat || null, lng: d.lng || null, logo_url: d.logo_url || null, active: d.active ?? true, tenant_id: tenant.id },
      create: { id: d.id, name: d.name, country: d.country || '', city: d.city || '', address: d.address || null, phone: d.phone || null, email: d.email || null, lat: d.lat || null, lng: d.lng || null, logo_url: d.logo_url || null, active: d.active ?? true, tenant_id: tenant.id }
    });
  }
  console.log(`  dealers: ${(apiDump.dealers || []).length}`);

  // 11. Partners
  for (const p of apiDump.partners || []) {
    await prisma.partner.upsert({
      where: { id: p.id },
      update: { name: p.name, logo_url: p.logo_url || null, website: p.website || null, sort_order: p.sort_order ?? 0, active: p.active ?? true, tenant_id: tenant.id },
      create: { id: p.id, name: p.name, logo_url: p.logo_url || null, website: p.website || null, sort_order: p.sort_order ?? 0, active: p.active ?? true, tenant_id: tenant.id }
    });
  }
  console.log(`  partners: ${(apiDump.partners || []).length}`);

  // 12. Team members
  for (const t of apiDump.team_members || []) {
    await prisma.teamMember.upsert({
      where: { id: t.id },
      update: { name: t.name, role: t.role ?? {}, photo_url: t.photo_url || null, bio: t.bio ?? {}, sort_order: t.sort_order ?? 0, active: t.active ?? true, tenant_id: tenant.id },
      create: { id: t.id, name: t.name, role: t.role ?? {}, photo_url: t.photo_url || null, bio: t.bio ?? {}, sort_order: t.sort_order ?? 0, active: t.active ?? true, tenant_id: tenant.id }
    });
  }
  console.log(`  team_members: ${(apiDump.team_members || []).length}`);

  // 13. Leads
  for (const l of apiDump.leads || []) {
    await prisma.lead.upsert({
      where: { id: l.id },
      update: { name: l.name, phone: l.phone, comment: l.comment || null, status: l.status ?? 'new', wall_config: l.wall_config ?? {}, tenant_id: tenant.id },
      create: { id: l.id, name: l.name, phone: l.phone, comment: l.comment || null, status: l.status ?? 'new', wall_config: l.wall_config ?? {}, tenant_id: tenant.id }
    });
  }
  console.log(`  leads: ${(apiDump.leads || []).length}`);

  // 14. Admin user
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { tenant_id_email: { email: 'admin@wallcraft.am', tenant_id: tenant.id } },
    update: {},
    create: { email: 'admin@wallcraft.am', password_hash: hash, role: 'ADMIN', tenant_id: tenant.id }
  });
  console.log(`  admin user: admin@wallcraft.am`);

  console.log('\nRESTORE COMPLETE!');
}

main()
  .catch(e => { console.error('ERROR:', e.message, '\n', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
