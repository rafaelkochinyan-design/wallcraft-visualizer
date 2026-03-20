/**
 * routes/leads.ts
 * POST /api/leads  — публичный endpoint, принимает заявку
 * GET  /admin/leads — список заявок (admin only)
 * PATCH /admin/leads/:id — обновить статус
 */

import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'
import { authMiddleware } from '../middleware/auth'

const router = Router()

const LeadSchema = z.object({
  name:        z.string().min(1).max(100),
  phone:       z.string().min(5).max(30),
  comment:     z.string().max(500).optional(),
  wall_config: z.object({
    width:        z.number(),
    height:       z.number(),
    color:        z.string(),
    panels:       z.array(z.object({ id: z.string().optional(), sku: z.string().nullable().optional(), name: z.string() })),
    accessories:  z.array(z.object({ name: z.string() })).optional(),
    total_panels: z.number().optional(),
    total_cost:   z.number().optional(),
    share_url:    z.string().optional(),
  }),
})

// ── POST /api/leads ────────────────────────────────────────
router.post('/api/leads', async (req, res) => {
  const parsed = LeadSchema.safeParse(req.body)
  if (!parsed.success) {
    return fail(res, 400, parsed.error.errors[0].message)
  }

  const { name, phone, comment, wall_config } = parsed.data

  const lead = await prisma.lead.create({
    data: {
      tenant_id:   req.tenant.id,
      name,
      phone,
      comment,
      wall_config: wall_config as any,
      status:      'new',
    },
  })

  return ok(res, { id: lead.id })
})

// ── GET /admin/leads ───────────────────────────────────────
router.get('/admin/leads', authMiddleware, async (req, res) => {
  const leads = await prisma.lead.findMany({
    where:   { tenant_id: req.tenant.id },
    orderBy: { created_at: 'desc' },
    take:    200,
  })

  return ok(res, leads)
})

// ── PATCH /admin/leads/:id ─────────────────────────────────
router.patch('/admin/leads/:id', authMiddleware, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!['new', 'contacted', 'sold', 'cancelled'].includes(status)) {
    return fail(res, 400, 'Invalid status')
  }

  const lead = await prisma.lead.findFirst({
    where: { id, tenant_id: req.tenant.id },
  })
  if (!lead) return fail(res, 404, 'Lead not found')

  const updated = await prisma.lead.update({
    where: { id },
    data:  { status, updated_at: new Date() },
  })

  return ok(res, updated)
})

export default router
