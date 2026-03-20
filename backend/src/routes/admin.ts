import { Router } from 'express'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'
import { authMiddleware } from '../middleware/auth'
import { uploadFile } from '../services/r2'

const router = Router()

// multer: memory storage, validate in controller
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
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

    ok(res, { accessToken, refreshToken })
  } catch (err) {
    next(err)
  }
})

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
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
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, role: true, tenant_id: true },
    })
    ok(res, user)
  } catch (err) {
    next(err)
  }
})

// All routes below require auth
router.use(authMiddleware)

// ── PANELS ────────────────────────────────────────────────────

router.get('/panels', async (req, res, next) => {
  try {
    const panels = await prisma.panel.findMany({
      where: { tenant_id: req.tenant.id },
      orderBy: { sort_order: 'asc' },
    })
    ok(res, panels)
  } catch (err) { next(err) }
})

const panelSchema = z.object({
  name: z.string().min(1).max(100),
  sku: z.string().max(50).optional(),
  texture_url: z.string().url(),
  thumb_url: z.string().url(),
  width_mm: z.coerce.number().int().positive().default(500),
  height_mm: z.coerce.number().int().positive().default(500),
  depth_mm: z.coerce.number().int().positive().default(19),
  weight_kg: z.coerce.number().positive().optional(),
  price: z.coerce.number().positive().optional(),
  active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().default(0),
  category_id: z.string().optional(),
})

router.post('/panels', async (req, res, next) => {
  try {
    const parsed = panelSchema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)
    const panel = await prisma.panel.create({
      data: { ...parsed.data, tenant_id: req.tenant.id },
    })
    ok(res, panel, 201)
  } catch (err) { next(err) }
})

router.put('/panels/:id', async (req, res, next) => {
  try {
    const panel = await prisma.panel.findFirst({
      where: { id: req.params.id, tenant_id: req.tenant.id },
    })
    if (!panel) return fail(res, 404, 'Panel not found')

    const parsed = panelSchema.partial().safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)

    const updated = await prisma.panel.update({
      where: { id: req.params.id },
      data: parsed.data,
    })
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

router.post('/panels/upload-texture', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 400, 'No file uploaded')
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(req.file.mimetype)) return fail(res, 400, 'Invalid file type. Use JPG, PNG, or WebP.')
    if (req.file.size > 5 * 1024 * 1024) return fail(res, 400, 'File too large. Max 5MB.')
    const url = await uploadFile(req.file.buffer, 'textures', req.file.originalname, req.file.mimetype)
    ok(res, { url })
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

// Accept full URLs (https://...) or relative paths (/uploads/...) or data URIs
const urlOrPath = z.string().min(1).refine(
  (v) => v.startsWith('/') || v.startsWith('http') || v.startsWith('data:'),
  { message: 'Must be a URL, relative path, or data URI' }
)

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
    const allowed = ['model/gltf-binary', 'application/octet-stream']
    const ext = req.file.originalname.split('.').pop()?.toLowerCase()
    if (ext !== 'glb') return fail(res, 400, 'Invalid file type. Only .glb files allowed.')
    if (req.file.size > 20 * 1024 * 1024) return fail(res, 400, 'File too large. Max 20MB.')
    const url = await uploadFile(req.file.buffer, 'models', req.file.originalname, 'model/gltf-binary')
    ok(res, { url })
  } catch (err) { next(err) }
})

router.post('/accessories/upload-thumb', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 400, 'No file uploaded')
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(req.file.mimetype)) return fail(res, 400, 'Invalid file type.')
    const url = await uploadFile(req.file.buffer, 'thumbs', req.file.originalname, req.file.mimetype)
    ok(res, { url })
  } catch (err) { next(err) }
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
    const { id, slug, name, logo_url, primary_color, domain } = req.tenant
    ok(res, { id, slug, name, logo_url, primary_color, domain })
  } catch (err) { next(err) }
})

router.put('/settings', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100).optional(),
      primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be hex color').optional(),
      logo_url: urlOrPath.optional().nullable(),
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return fail(res, 400, parsed.error.errors[0].message)

    const updated = await prisma.tenant.update({
      where: { id: req.tenant.id },
      data: parsed.data,
      select: { id: true, slug: true, name: true, logo_url: true, primary_color: true },
    })
    ok(res, updated)
  } catch (err) { next(err) }
})

router.post('/settings/upload-logo', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 400, 'No file uploaded')
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowed.includes(req.file.mimetype)) return fail(res, 400, 'Invalid file type. Use JPG, PNG, WebP, or SVG.')
    if (req.file.size > 2 * 1024 * 1024) return fail(res, 400, 'File too large. Max 2MB.')
    const url = await uploadFile(req.file.buffer, 'logos', req.file.originalname, req.file.mimetype)
    ok(res, { url })
  } catch (err) { next(err) }
})

export default router
