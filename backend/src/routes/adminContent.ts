import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'
import { uploadFile } from '../services/r2'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
})

// ── Shared helpers ─────────────────────────────────────────────

const localized = z.object({ en: z.string(), ru: z.string(), am: z.string() })
const localizedOpt = z.object({
  en: z.string().default(''),
  ru: z.string().default(''),
  am: z.string().default(''),
}).optional()

async function imageUpload(req: any, res: any, folder: string) {
  if (!req.file) return fail(res, 400, 'No file uploaded')
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowed.includes(req.file.mimetype)) return fail(res, 400, 'Invalid file type. Use JPG, PNG, or WebP.')
  if (req.file.size > 10 * 1024 * 1024) return fail(res, 400, 'File too large. Max 10MB.')
  const url = await uploadFile(req.file.buffer, folder, req.file.originalname, req.file.mimetype)
  return ok(res, { url })
}

// ── HERO SLIDES ───────────────────────────────────────────────

const heroSlideSchema = z.object({
  image_url:   z.string().url(),
  video_url:   z.string().url().optional().nullable(),
  headline:    localized,
  subheadline: localizedOpt,
  cta_label:   localizedOpt,
  cta_url:     z.string().url().optional().nullable(),
  sort_order:  z.coerce.number().int().default(0),
  active:      z.coerce.boolean().default(true),
})

router.get('/hero-slides', async (req, res, next) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, slides)
  } catch (err) { next(err) }
})

router.post('/hero-slides', async (req, res, next) => {
  try {
    const parsed = heroSlideSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const slide = await prisma.heroSlide.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, slide, 201)
  } catch (err) { next(err) }
})

router.put('/hero-slides/:id', async (req, res, next) => {
  try {
    const existing = await prisma.heroSlide.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Slide not found')
    const parsed = heroSlideSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.heroSlide.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/hero-slides/:id', async (req, res, next) => {
  try {
    const existing = await prisma.heroSlide.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Slide not found')
    await prisma.heroSlide.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.patch('/hero-slides/reorder', async (req, res, next) => {
  try {
    const schema = z.array(z.object({ id: z.string(), sort_order: z.number().int() }))
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, 'Expected array of { id, sort_order }')
    await Promise.all(
      parsed.data.map(({ id, sort_order }) =>
        prisma.heroSlide.updateMany({ where: { id, tenant_id: req.tenant.id }, data: { sort_order } })
      )
    )
    ok(res, { reordered: true })
  } catch (err) { next(err) }
})

router.post('/hero-slides/upload-image', upload.single('file'), async (req, res, next) => {
  try { await imageUpload(req, res, 'hero') } catch (err) { next(err) }
})

// ── PROJECTS ──────────────────────────────────────────────────

const projectSchema = z.object({
  title:       z.string().min(1).max(200),
  slug:        z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens'),
  description: z.string().max(2000).optional().nullable(),
  cover_url:   z.string().url().optional().nullable(),
  images:      z.array(z.string().url()).default([]),
  space_type:  z.string().max(50).optional().nullable(),
  panel_ids:   z.array(z.string()).default([]),
  active:      z.coerce.boolean().default(true),
  sort_order:  z.coerce.number().int().default(0),
})

router.get('/projects', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, projects)
  } catch (err) { next(err) }
})

router.get('/projects/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!project) return fail(res, 404, 'Project not found')
    ok(res, project)
  } catch (err) { next(err) }
})

router.post('/projects', async (req, res, next) => {
  try {
    const parsed = projectSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const project = await prisma.project.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, project, 201)
  } catch (err) { next(err) }
})

router.put('/projects/:id', async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Project not found')
    const parsed = projectSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.project.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/projects/:id', async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Project not found')
    await prisma.project.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/projects/upload-image', upload.single('file'), async (req, res, next) => {
  try { await imageUpload(req, res, 'projects') } catch (err) { next(err) }
})

// ── GALLERY ───────────────────────────────────────────────────

const gallerySchema = z.object({
  image_url:  z.string().url(),
  thumb_url:  z.string().url().optional().nullable(),
  caption:    z.string().max(500).optional().nullable(),
  space_type: z.string().max(50).optional().nullable(),
  tags:       z.array(z.string()).default([]),
  sort_order: z.coerce.number().int().default(0),
  active:     z.coerce.boolean().default(true),
})

router.get('/gallery', async (req, res, next) => {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, items)
  } catch (err) { next(err) }
})

router.post('/gallery', async (req, res, next) => {
  try {
    const parsed = gallerySchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const item = await prisma.galleryItem.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, item, 201)
  } catch (err) { next(err) }
})

router.put('/gallery/:id', async (req, res, next) => {
  try {
    const existing = await prisma.galleryItem.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Gallery item not found')
    const parsed = gallerySchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.galleryItem.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/gallery/:id', async (req, res, next) => {
  try {
    const existing = await prisma.galleryItem.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Gallery item not found')
    await prisma.galleryItem.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/gallery/upload-image', upload.single('file'), async (req, res, next) => {
  try { await imageUpload(req, res, 'gallery') } catch (err) { next(err) }
})

// ── BLOG ──────────────────────────────────────────────────────

const blogSchema = z.object({
  slug:         z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title:        localized,
  excerpt:      localized,
  body:         localized,
  cover_url:    z.string().url().optional().nullable(),
  category:     z.string().max(50).optional().nullable(),
  tags:         z.array(z.string()).default([]),
  published:    z.coerce.boolean().default(false),
  published_at: z.string().datetime().optional().nullable(),
  sort_order:   z.coerce.number().int().default(0),
})

router.get('/blog', async (req, res, next) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { tenant_id: req.tenant.id },
      select: {
        id: true, slug: true, title: true, excerpt: true,
        cover_url: true, category: true, tags: true,
        published: true, published_at: true, sort_order: true, created_at: true,
      },
      orderBy: { created_at: 'desc' },
    })
    ok(res, posts)
  } catch (err) { next(err) }
})

router.get('/blog/:id', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!post) return fail(res, 404, 'Post not found')
    ok(res, post)
  } catch (err) { next(err) }
})

router.post('/blog', async (req, res, next) => {
  try {
    const parsed = blogSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const post = await prisma.blogPost.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, post, 201)
  } catch (err) { next(err) }
})

router.put('/blog/:id', async (req, res, next) => {
  try {
    const existing = await prisma.blogPost.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Post not found')
    const parsed = blogSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.blogPost.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.patch('/blog/:id/publish', async (req, res, next) => {
  try {
    const existing = await prisma.blogPost.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Post not found')
    const published = !existing.published
    const updated = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: { published, published_at: published ? new Date() : null },
    })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/blog/:id', async (req, res, next) => {
  try {
    const existing = await prisma.blogPost.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Post not found')
    await prisma.blogPost.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/blog/upload-cover', upload.single('file'), async (req, res, next) => {
  try { await imageUpload(req, res, 'blog') } catch (err) { next(err) }
})

// ── DESIGNERS ─────────────────────────────────────────────────

const designerSchema = z.object({
  name:      z.string().min(1).max(100),
  slug:      z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  photo_url: z.string().url().optional().nullable(),
  bio:       localizedOpt,
  specialty: z.string().max(100).optional().nullable(),
  portfolio: z.array(z.string().url()).default([]),
  instagram: z.string().max(100).optional().nullable(),
  website:   z.string().url().optional().nullable(),
  active:    z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
})

router.get('/designers', async (req, res, next) => {
  try {
    const designers = await prisma.designer.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, designers)
  } catch (err) { next(err) }
})

router.get('/designers/:id', async (req, res, next) => {
  try {
    const designer = await prisma.designer.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!designer) return fail(res, 404, 'Designer not found')
    ok(res, designer)
  } catch (err) { next(err) }
})

router.post('/designers', async (req, res, next) => {
  try {
    const parsed = designerSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const designer = await prisma.designer.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, designer, 201)
  } catch (err) { next(err) }
})

router.put('/designers/:id', async (req, res, next) => {
  try {
    const existing = await prisma.designer.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Designer not found')
    const parsed = designerSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.designer.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/designers/:id', async (req, res, next) => {
  try {
    const existing = await prisma.designer.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Designer not found')
    await prisma.designer.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/designers/upload-photo', upload.single('file'), async (req, res, next) => {
  try { await imageUpload(req, res, 'designers') } catch (err) { next(err) }
})

// ── DEALERS ───────────────────────────────────────────────────

const dealerSchema = z.object({
  name:      z.string().min(1).max(100),
  country:   z.string().min(1).max(100),
  region:    z.string().max(100).optional().nullable(),
  city:      z.string().min(1).max(100),
  address:   z.string().max(500).optional().nullable(),
  phone:     z.string().max(30).optional().nullable(),
  email:     z.string().email().optional().nullable(),
  website:   z.string().url().optional().nullable(),
  map_url:   z.string().url().optional().nullable(),
  lat:       z.coerce.number().optional().nullable(),
  lng:       z.coerce.number().optional().nullable(),
  logo_url:  z.string().url().optional().nullable(),
  active:    z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
})

router.get('/dealers', async (req, res, next) => {
  try {
    const dealers = await prisma.dealer.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: [{ country: 'asc' }, { sort_order: 'asc' }],
    })
    ok(res, dealers)
  } catch (err) { next(err) }
})

router.get('/dealers/:id', async (req, res, next) => {
  try {
    const dealer = await prisma.dealer.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!dealer) return fail(res, 404, 'Dealer not found')
    ok(res, dealer)
  } catch (err) { next(err) }
})

router.post('/dealers', async (req, res, next) => {
  try {
    const parsed = dealerSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const dealer = await prisma.dealer.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, dealer, 201)
  } catch (err) { next(err) }
})

router.put('/dealers/:id', async (req, res, next) => {
  try {
    const existing = await prisma.dealer.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Dealer not found')
    const parsed = dealerSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.dealer.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/dealers/:id', async (req, res, next) => {
  try {
    const existing = await prisma.dealer.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Dealer not found')
    await prisma.dealer.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

// ── PARTNERS ──────────────────────────────────────────────────

const partnerSchema = z.object({
  name:      z.string().min(1).max(100),
  logo_url:  z.string().url(),
  website:   z.string().url().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
  active:    z.coerce.boolean().default(true),
})

router.get('/partners', async (req, res, next) => {
  try {
    const partners = await prisma.partner.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, partners)
  } catch (err) { next(err) }
})

router.post('/partners', async (req, res, next) => {
  try {
    const parsed = partnerSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const partner = await prisma.partner.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, partner, 201)
  } catch (err) { next(err) }
})

router.put('/partners/:id', async (req, res, next) => {
  try {
    const existing = await prisma.partner.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Partner not found')
    const parsed = partnerSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.partner.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/partners/:id', async (req, res, next) => {
  try {
    const existing = await prisma.partner.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Partner not found')
    await prisma.partner.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/partners/upload-logo', upload.single('file'), async (req, res, next) => {
  try { await imageUpload(req, res, 'partners') } catch (err) { next(err) }
})

// ── TEAM ──────────────────────────────────────────────────────

const teamSchema = z.object({
  name:      z.string().min(1).max(100),
  role:      localized,
  photo_url: z.string().url().optional().nullable(),
  bio:       localizedOpt,
  sort_order: z.coerce.number().int().default(0),
  active:    z.coerce.boolean().default(true),
})

router.get('/team', async (req, res, next) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, members)
  } catch (err) { next(err) }
})

router.get('/team/:id', async (req, res, next) => {
  try {
    const member = await prisma.teamMember.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!member) return fail(res, 404, 'Team member not found')
    ok(res, member)
  } catch (err) { next(err) }
})

router.post('/team', async (req, res, next) => {
  try {
    const parsed = teamSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const member = await prisma.teamMember.create({ data: { ...parsed.data, tenant_id: req.tenant.id } })
    ok(res, member, 201)
  } catch (err) { next(err) }
})

router.put('/team/:id', async (req, res, next) => {
  try {
    const existing = await prisma.teamMember.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Team member not found')
    const parsed = teamSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.teamMember.update({ where: { id: req.params.id }, data: parsed.data })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/team/:id', async (req, res, next) => {
  try {
    const existing = await prisma.teamMember.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!existing) return fail(res, 404, 'Team member not found')
    await prisma.teamMember.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/team/upload-photo', upload.single('file'), async (req, res, next) => {
  try { await imageUpload(req, res, 'team') } catch (err) { next(err) }
})

// ── PAGE CONTENT (CMS) ────────────────────────────────────────

router.get('/pages/:page_key', async (req, res, next) => {
  try {
    const page = await prisma.pageContent.findUnique({
      where: {
        tenant_id_page_key: { tenant_id: req.tenant.id, page_key: req.params.page_key },
      },
    })
    ok(res, page ?? { page_key: req.params.page_key, content: {} })
  } catch (err) { next(err) }
})

router.put('/pages/:page_key', async (req, res, next) => {
  try {
    const schema = z.object({ content: z.record(z.unknown()) })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, 'content must be an object')

    const content = parsed.data.content as Parameters<typeof prisma.pageContent.create>[0]['data']['content']
    const page = await prisma.pageContent.upsert({
      where: {
        tenant_id_page_key: { tenant_id: req.tenant.id, page_key: req.params.page_key },
      },
      create: { tenant_id: req.tenant.id, page_key: req.params.page_key, content },
      update: { content },
    })
    ok(res, page)
  } catch (err) { next(err) }
})

export default router
