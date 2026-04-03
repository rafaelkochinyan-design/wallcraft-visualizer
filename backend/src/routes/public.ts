import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'

const router = Router()

// GET /api/tenant — branding info for current tenant
router.get('/tenant', async (req, res, next) => {
  try {
    const { id, slug, name, logo_url, primary_color } = req.tenant
    ok(res, { id, slug, name, logo_url, primary_color })
  } catch (err) {
    next(err)
  }
})

// GET /api/panels — active panels for this tenant
router.get('/panels', async (req, res, next) => {
  try {
    const panels = await prisma.panel.findMany({
      where: { tenant_id: req.tenant.id, active: true },
      select: {
        id: true,
        name: true,
        sku: true,
        texture_url: true,
        thumb_url: true,
        model_url: true,
        width_mm: true,
        height_mm: true,
        depth_mm: true,
        weight_kg: true,
        price: true,
        sort_order: true,
        category: { select: { id: true, name: true } },
      },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, panels)
  } catch (err) {
    next(err)
  }
})

// GET /api/panels/:id — single panel with category
router.get('/panels/:id', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id, active: true },
      select: {
        id: true,
        name: true,
        sku: true,
        texture_url: true,
        thumb_url: true,
        model_url: true,
        width_mm: true,
        height_mm: true,
        depth_mm: true,
        weight_kg: true,
        price: true,
        sort_order: true,
        category: { select: { id: true, name: true } },
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

export default router
