import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'

const router = Router()

// ── HERO SLIDES ───────────────────────────────────────────────
router.get('/hero-slides', async (req, res, next) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { tenant_id: req.tenant.id, active: true },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, slides)
  } catch (err) { next(err) }
})

// ── PROJECTS ──────────────────────────────────────────────────
router.get('/projects', async (req, res, next) => {
  try {
    const { space_type } = req.query
    const projects = await prisma.project.findMany({
      where: {
        tenant_id: req.tenant.id,
        active: true,
        ...(space_type ? { space_type: String(space_type) } : {}),
      },
      select: {
        id: true, slug: true, title: true,
        cover_url: true, space_type: true,
        description: true, sort_order: true, created_at: true,
      },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, projects)
  } catch (err) { next(err) }
})

router.get('/projects/:slug', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { tenant_id: req.tenant.id, slug: req.params.slug, active: true },
    })
    if (!project) return fail(res, 404, 'Project not found')
    ok(res, project)
  } catch (err) { next(err) }
})

// ── GALLERY ───────────────────────────────────────────────────
router.get('/gallery', async (req, res, next) => {
  try {
    const { space_type } = req.query
    const items = await prisma.galleryItem.findMany({
      where: {
        tenant_id: req.tenant.id,
        active: true,
        ...(space_type ? { space_type: String(space_type) } : {}),
      },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, items)
  } catch (err) { next(err) }
})

// ── BLOG ──────────────────────────────────────────────────────
router.get('/blog', async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(String(req.query.page  || '1'), 10) || 1)
    const limit = Math.min(50, parseInt(String(req.query.limit || '12'), 10) || 12)
    const { category } = req.query

    const where = {
      tenant_id: req.tenant.id,
      published: true,
      ...(category ? { category: String(category) } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true, slug: true, title: true, excerpt: true,
          cover_url: true, category: true, tags: true,
          published_at: true, created_at: true,
        },
        orderBy: { published_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    ok(res, { items, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

router.get('/blog/:slug', async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { tenant_id: req.tenant.id, slug: req.params.slug, published: true },
    })
    if (!post) return fail(res, 404, 'Post not found')
    ok(res, post)
  } catch (err) { next(err) }
})

// ── DESIGNERS ─────────────────────────────────────────────────
router.get('/designers', async (req, res, next) => {
  try {
    const designers = await prisma.designer.findMany({
      where: { tenant_id: req.tenant.id, active: true },
      select: {
        id: true, slug: true, name: true,
        photo_url: true, bio: true, specialty: true,
        portfolio: true, instagram: true, website: true,
        sort_order: true,
      },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, designers)
  } catch (err) { next(err) }
})

router.get('/designers/:slug', async (req, res, next) => {
  try {
    const designer = await prisma.designer.findFirst({
      where: { tenant_id: req.tenant.id, slug: req.params.slug, active: true },
    })
    if (!designer) return fail(res, 404, 'Designer not found')
    ok(res, designer)
  } catch (err) { next(err) }
})

// ── DEALERS ───────────────────────────────────────────────────
router.get('/dealers', async (req, res, next) => {
  try {
    const { country, region } = req.query
    const dealers = await prisma.dealer.findMany({
      where: {
        tenant_id: req.tenant.id,
        active: true,
        ...(country ? { country: String(country) } : {}),
        ...(region  ? { region:  String(region)  } : {}),
      },
      orderBy: [{ country: 'asc' }, { sort_order: 'asc' }],
    })
    ok(res, dealers)
  } catch (err) { next(err) }
})

// ── PARTNERS ──────────────────────────────────────────────────
router.get('/partners', async (req, res, next) => {
  try {
    const partners = await prisma.partner.findMany({
      where: { tenant_id: req.tenant.id, active: true },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, partners)
  } catch (err) { next(err) }
})

// ── TEAM ──────────────────────────────────────────────────────
router.get('/team', async (req, res, next) => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { tenant_id: req.tenant.id, active: true },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, members)
  } catch (err) { next(err) }
})

// ── PAGE CONTENT (CMS) ────────────────────────────────────────
router.get('/pages/:page_key', async (req, res, next) => {
  try {
    const page = await prisma.pageContent.findUnique({
      where: {
        tenant_id_page_key: {
          tenant_id: req.tenant.id,
          page_key: req.params.page_key,
        },
      },
    })
    // Return empty content object if not yet configured — never 404
    ok(res, page ?? { page_key: req.params.page_key, content: {} })
  } catch (err) { next(err) }
})

export default router
