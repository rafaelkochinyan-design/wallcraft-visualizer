import { Router } from 'express'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'

const router = Router()

// GET /api/tenant — branding + contact + social info for current tenant
router.get('/tenant', async (req, res, next) => {
  try {
    const {
      id, slug, name, logo_url, primary_color,
      phone, email, address, whatsapp,
      instagram_url, facebook_url, tiktok_url, pinterest_url,
    } = req.tenant
    ok(res, {
      id, slug, name, logo_url, primary_color,
      phone, email, address, whatsapp,
      instagram_url, facebook_url, tiktok_url, pinterest_url,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/panel-categories — active panel categories for navbar dropdown
router.get('/panel-categories', async (req, res, next) => {
  try {
    const cats = await prisma.panelCategory.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, cats)
  } catch (err) {
    next(err)
  }
})

// GET /api/panels — active panels with search, filter, sort, pagination
router.get('/panels', async (req, res, next) => {
  try {
    const schema = z.object({
      q:             z.string().optional(),
      category_id:   z.string().optional(),
      collection_id: z.string().optional(),
      sort:          z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
      min_price:     z.coerce.number().positive().optional(),
      max_price:     z.coerce.number().positive().optional(),
      page:          z.coerce.number().int().min(1).default(1),
      limit:         z.coerce.number().int().min(1).max(100).default(24),
    })
    const parsed = schema.safeParse(req.query)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const { q, category_id, collection_id, sort, min_price, max_price, page, limit } = parsed.data

    // Build where clause
    const where: Prisma.PanelWhereInput = { tenant_id: req.tenant.id, active: true }
    if (q) {
      where.OR = [
        { name:        { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }
    if (category_id) where.category_id = category_id
    if (collection_id) {
      const col = await prisma.collection.findFirst({
        where: { id: collection_id, tenant_id: req.tenant.id, active: true },
        select: { panel_ids: true },
      })
      const ids = (col?.panel_ids as string[]) ?? []
      where.id = { in: ids }
    }
    if (min_price !== undefined || max_price !== undefined) {
      where.price = {}
      if (min_price !== undefined) where.price.gte = min_price
      if (max_price !== undefined) where.price.lte = max_price
    }

    // Build orderBy
    const orderByMap = {
      newest:     { created_at: 'desc' },
      price_asc:  { price: 'asc' },
      price_desc: { price: 'desc' },
      name_asc:   { name: 'asc' },
    } as const
    const orderBy = orderByMap[sort]

    const [total, panels] = await prisma.$transaction([
      prisma.panel.count({ where }),
      prisma.panel.findMany({
        where,
        select: {
          id: true, name: true, zip_url: true,
          width_mm: true, height_mm: true, depth_mm: true,
          weight_kg: true, price: true, sort_order: true,
          category: { select: { id: true, name: true } },
          panelImages: { orderBy: { sort_order: 'asc' }, take: 1 },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    ok(res, { data: panels, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (err) {
    next(err)
  }
})

// GET /api/panels/:id — single panel with full details
router.get('/panels/:id', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id, active: true },
      select: {
        id: true,
        name: true,
        zip_url: true,
        width_mm: true,
        height_mm: true,
        depth_mm: true,
        weight_kg: true,
        price: true,
        description: true,
        material: true,
        depth_relief_mm: true,
        sort_order: true,
        category: { select: { id: true, name: true } },
        sizes: { orderBy: { sort_order: 'asc' } },
        panelImages: { orderBy: { sort_order: 'asc' } },
      },
    })
    if (!panel) return fail(res, 404, 'Panel not found')
    ok(res, panel)
  } catch (err) {
    next(err)
  }
})

// GET /api/accessories — active accessories grouped by type
router.get('/accessories', async (req, res, next) => {
  try {
    const accessories = await prisma.accessory.findMany({
      where: { tenant_id: req.tenant.id, active: true },
      include: { type: true },
      orderBy: [{ type_id: 'asc' }, { sort_order: 'asc' }],
    })
    ok(res, accessories)
  } catch (err) {
    next(err)
  }
})

// GET /api/accessory-types — all types (global, not tenant-scoped)
router.get('/accessory-types', async (_req, res, next) => {
  try {
    const types = await prisma.accessoryType.findMany({
      orderBy: { name: 'asc' },
    })
    ok(res, types)
  } catch (err) {
    next(err)
  }
})

// POST /api/inquiry — submit quote/sample request
router.post('/inquiry', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      phone: z.string().min(5).max(30),
      email: z.string().email().optional().or(z.literal('')),
      message: z.string().max(1000).optional(),
      wall_width: z.coerce.number().positive().optional(),
      wall_height: z.coerce.number().positive().optional(),
      panel_names: z.string().max(500).optional(),
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)

    const { email, ...rest } = parsed.data
    const inquiry = await prisma.inquiry.create({
      data: {
        ...rest,
        email: email || null,
        tenant_id: req.tenant.id,
      },
    })
    ok(res, { id: inquiry.id }, 201)
  } catch (err) {
    next(err)
  }
})

// GET /api/collections — active collections with panel data
router.get('/collections', async (req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { tenant_id: req.tenant.id, active: true },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, collections)
  } catch (err) {
    next(err)
  }
})

export default router
