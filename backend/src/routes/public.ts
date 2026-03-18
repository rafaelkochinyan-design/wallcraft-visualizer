import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { ok } from '../utils/response'

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

export default router
