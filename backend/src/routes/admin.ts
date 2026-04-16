import { Router } from 'express'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'
import { authMiddleware } from '../middleware/auth'
import { uploadFile } from '../services/r2'
import { handleImageUpload } from '../utils/upload'

const router = Router()

// Single multer instance — per-handler validation enforces specific limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB ceiling (zip uploads need this)
})

// ── AUTH ──────────────────────────────────────────────────────

router.post('/auth/login', async (req, res, next) => {
  try {
    const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, 'Invalid email or password')

    const { email, password } = parsed.data
    const user = await prisma.user.findUnique({
      where: { tenant_id_email: { tenant_id: req.tenant.id, email } },
    })
    if (!user) return fail(res, 401, 'Invalid email or password')

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return fail(res, 401, 'Invalid email or password')

    const accessToken = jwt.sign(
      { sub: user.id, tenant_id: user.tenant_id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
      { sub: user.id, tenant_id: user.tenant_id, role: user.role },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'strict', // 'none' required for cross-domain (Vercel ↔ Render)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    ok(res, { accessToken })
  } catch (err) {
    next(err)
  }
})

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return fail(res, 401, 'No refresh token')

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      sub: string; tenant_id: string; role: string
    }
    const accessToken = jwt.sign(
      { sub: payload.sub, tenant_id: payload.tenant_id, role: payload.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )
    ok(res, { accessToken })
  } catch {
    fail(res, 401, 'Invalid or expired refresh token')
  }
})

router.get('/auth/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user!.id, tenant_id: req.tenant.id },
      select: { id: true, email: true, role: true, tenant_id: true },
    })
    ok(res, user)
  } catch (err) {
    next(err)
  }
})

// All routes below require auth
router.use(authMiddleware)

// Accept full URLs (https://...) or relative paths (/uploads/...) or data URIs
const urlOrPath = z.string().min(1).refine(
  (v) => v.startsWith('/') || v.startsWith('http') || v.startsWith('data:'),
  { message: 'Must be a URL, relative path, or data URI' }
)

// ── PANEL CATEGORIES ─────────────────────────────────────────

router.get('/panel-categories', async (req, res, next) => {
  try {
    const cats = await prisma.panelCategory.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, cats)
  } catch (err) { next(err) }
})

router.post('/panel-categories', async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string().min(1).max(100), sort_order: z.coerce.number().int().default(0) })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const cat = await prisma.panelCategory.create({
      data: { ...parsed.data, tenant_id: req.tenant.id },
    })
    ok(res, cat, 201)
  } catch (err) { next(err) }
})

// ── PANELS ────────────────────────────────────────────────────

router.get('/panels', async (req, res, next) => {
  try {
    const panels = await prisma.panel.findMany({
      where: { tenant_id: req.tenant.id },
      include: {
        sizes: { orderBy: { sort_order: 'asc' } },
        panelImages: { orderBy: { sort_order: 'asc' }, take: 1 },
      },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, panels)
  } catch (err) { next(err) }
})

const panelSizeSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(50),
  width_mm: z.coerce.number().positive(),
  height_mm: z.coerce.number().positive(),
  depth_mm: z.coerce.number().positive(),
  price: z.coerce.number().positive().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
})

const panelSchema = z.object({
  name: z.string().min(1).max(100),
  zip_url: z.string().optional().nullable(),
  width_mm: z.coerce.number().int().positive().default(500),
  height_mm: z.coerce.number().int().positive().default(500),
  depth_mm: z.coerce.number().int().positive().default(19),
  weight_kg: z.coerce.number().positive().optional(),
  price: z.coerce.number().positive().optional(),
  description: z.string().optional(),
  material: z.string().optional(),
  depth_relief_mm: z.coerce.number().int().positive().optional(),
  active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
  category_id: z.string().optional(),
  sizes: z.array(panelSizeSchema).optional().default([]),
})

router.post('/panels', async (req, res, next) => {
  try {
    const parsed = panelSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const { sizes, ...panelData } = parsed.data
    const panel = await prisma.panel.create({
      data: {
        ...panelData,
        tenant_id: req.tenant.id,
        sizes: sizes && sizes.length > 0
          ? { create: sizes.map(({ id: _id, ...s }) => s) }
          : undefined,
      },
      include: {
        sizes: { orderBy: { sort_order: 'asc' } },
        panelImages: { orderBy: { sort_order: 'asc' } },
      },
    })
    ok(res, panel, 201)
  } catch (err) { next(err) }
})

router.put('/panels/:id', async (req, res, next) => {
  try {
    const existing = await prisma.panel.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id },
    })
    if (!existing) return fail(res, 404, 'Panel not found')

    const parsed = panelSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)

    const { sizes, ...panelData } = parsed.data

    // Delete all existing sizes and recreate atomically to prevent data loss on crash
    let updated
    if (sizes !== undefined) {
      updated = await prisma.$transaction(async (tx) => {
        await tx.panelSize.deleteMany({ where: { panel_id: req.params.id } })
        return tx.panel.update({
          where: { id: req.params.id },
          data: {
            ...panelData,
            ...(sizes.length > 0
              ? { sizes: { create: sizes.map(({ id: _id, ...s }) => s) } }
              : {}),
          },
          include: {
            sizes: { orderBy: { sort_order: 'asc' } },
            panelImages: { orderBy: { sort_order: 'asc' } },
          },
        })
      })
    } else {
      updated = await prisma.panel.update({
        where: { id: req.params.id },
        data: panelData,
        include: {
          sizes: { orderBy: { sort_order: 'asc' } },
          panelImages: { orderBy: { sort_order: 'asc' } },
        },
      })
    }
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/panels/:id', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id },
    })
    if (!panel) return fail(res, 404, 'Panel not found')
    // Soft delete
    await prisma.panel.update({ where: { id: req.params.id }, data: { active: false } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/panels/upload-image', upload.single('file'), async (req, res, next) => {
  try { await handleImageUpload(req, res, 'panel-images') } catch (err) { next(err) }
})

router.post('/panels/upload-zip', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 400, 'No file uploaded')
    const ext = req.file.originalname.split('.').pop()?.toLowerCase()
    const isZip = req.file.mimetype === 'application/zip'
      || req.file.mimetype === 'application/x-zip-compressed'
      || ext === 'zip'
    if (!isZip) return fail(res, 400, 'Only ZIP files allowed.')
    if (req.file.size > 100 * 1024 * 1024) return fail(res, 400, 'File too large. Max 100MB.')
    const url = await uploadFile(req.file.buffer, 'panel-zips', req.file.originalname, 'application/zip')
    ok(res, { url })
  } catch (err) { next(err) }
})

// Panel images CRUD
router.post('/panels/:id/images', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!panel) return fail(res, 404, 'Panel not found')
    const schema = z.object({ url: z.string().min(1), caption: z.string().optional().nullable(), sort_order: z.coerce.number().int().default(0) })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const img = await prisma.panelImage.create({ data: { ...parsed.data, panel_id: req.params.id } })
    ok(res, img, 201)
  } catch (err) { next(err) }
})

router.delete('/panels/:id/images/:imageId', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findFirst({ where: { id: req.params.id, tenant_id: req.tenant.id } })
    if (!panel) return fail(res, 404, 'Panel not found')
    await prisma.panelImage.deleteMany({ where: { id: req.params.imageId, panel_id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

// ── ACCESSORIES ───────────────────────────────────────────────

router.get('/accessories', async (req, res, next) => {
  try {
    const accessories = await prisma.accessory.findMany({
      where: { tenant_id: req.tenant.id },
      include: { type: true },
      orderBy: [{ type_id: 'asc' }, { sort_order: 'asc' }],
    })
    ok(res, accessories)
  } catch (err) { next(err) }
})

const accessorySchema = z.object({
  type_id: z.string().min(1),
  name: z.string().min(1).max(100),
  model_url: urlOrPath,
  thumb_url: urlOrPath,
  scale: z.coerce.number().min(0.01).max(10).default(1.0),
  active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
})

router.post('/accessories', async (req, res, next) => {
  try {
    const parsed = accessorySchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const accessory = await prisma.accessory.create({
      data: { ...parsed.data, tenant_id: req.tenant.id },
      include: { type: true },
    })
    ok(res, accessory, 201)
  } catch (err) { next(err) }
})

router.put('/accessories/:id', async (req, res, next) => {
  try {
    const existing = await prisma.accessory.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id },
    })
    if (!existing) return fail(res, 404, 'Accessory not found')

    const parsed = accessorySchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)

    const updated = await prisma.accessory.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: { type: true },
    })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/accessories/:id', async (req, res, next) => {
  try {
    const existing = await prisma.accessory.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id },
    })
    if (!existing) return fail(res, 404, 'Accessory not found')
    await prisma.accessory.update({ where: { id: req.params.id }, data: { active: false } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

router.post('/accessories/upload-model', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 400, 'No file uploaded')
    const ext = req.file.originalname.split('.').pop()?.toLowerCase()
    if (ext !== 'glb') return fail(res, 400, 'Invalid file type. Only .glb files allowed.')
    if (req.file.size > 20 * 1024 * 1024) return fail(res, 400, 'File too large. Max 20MB.')
    const url = await uploadFile(req.file.buffer, 'models', req.file.originalname, 'model/gltf-binary')
    ok(res, { url })
  } catch (err) { next(err) }
})

router.post('/accessories/upload-thumb', upload.single('file'), async (req, res, next) => {
  try { await handleImageUpload(req, res, 'thumbs') } catch (err) { next(err) }
})

// ── INQUIRIES ─────────────────────────────────────────────────

router.get('/inquiries', async (req, res, next) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { created_at: 'desc' },
    })
    ok(res, inquiries)
  } catch (err) { next(err) }
})

// ── STORE SETTINGS ────────────────────────────────────────────

router.get('/settings', async (req, res, next) => {
  try {
    const { id, slug, name, logo_url, primary_color, domain, email, phone, address, whatsapp, instagram_url, facebook_url, tiktok_url, pinterest_url } = req.tenant
    ok(res, { id, slug, name, logo_url, primary_color, domain, email, phone, address, whatsapp, instagram_url, facebook_url, tiktok_url, pinterest_url })
  } catch (err) { next(err) }
})

router.put('/settings', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color').optional(),
      logo_url: urlOrPath.optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      email: z.string().email().optional().nullable(),
      address: z.string().max(200).optional().nullable(),
      whatsapp: z.string().max(50).optional().nullable(),
      instagram_url: z.string().url().optional().nullable(),
      facebook_url: z.string().url().optional().nullable(),
      tiktok_url: z.string().url().optional().nullable(),
      pinterest_url: z.string().url().optional().nullable(),
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)

    const updated = await prisma.tenant.update({
      where: { id: req.tenant.id },
      data: parsed.data,
      select: { id: true, slug: true, name: true, logo_url: true, primary_color: true, email: true, phone: true, address: true, whatsapp: true, instagram_url: true, facebook_url: true, tiktok_url: true, pinterest_url: true },
    })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.post('/settings/upload-logo', upload.single('file'), async (req, res, next) => {
  try { await handleImageUpload(req, res, 'logos', { allowSvg: true, maxBytes: 2 * 1024 * 1024 }) } catch (err) { next(err) }
})

// ── COLLECTIONS ───────────────────────────────────────────────

const collectionSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional(),
  cover_url: z.string().optional().nullable(),
  panel_ids: z.array(z.string()).default([]),
  active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
})

router.get('/collections', async (req, res, next) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, collections)
  } catch (err) { next(err) }
})

router.post('/collections', async (req, res, next) => {
  try {
    const parsed = collectionSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const collection = await prisma.collection.create({
      data: { ...parsed.data, tenant_id: req.tenant.id },
    })
    ok(res, collection, 201)
  } catch (err) { next(err) }
})

router.put('/collections/:id', async (req, res, next) => {
  try {
    const existing = await prisma.collection.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id },
    })
    if (!existing) return fail(res, 404, 'Collection not found')
    const parsed = collectionSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const updated = await prisma.collection.update({
      where: { id: req.params.id },
      data: parsed.data,
    })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.delete('/collections/:id', async (req, res, next) => {
  try {
    const existing = await prisma.collection.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id },
    })
    if (!existing) return fail(res, 404, 'Collection not found')
    await prisma.collection.delete({ where: { id: req.params.id } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

export default router
