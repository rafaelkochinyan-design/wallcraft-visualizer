import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { tenantMiddleware } from './middleware/tenant'
import { errorHandler } from './middleware/errorHandler'
import publicRouter from './routes/public'
import adminRouter from './routes/admin'

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check (no tenant required) ────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))

// ── Tenant resolution (all routes below require tenant) ────────
app.use(tenantMiddleware)

// ── Routes ────────────────────────────────────────────────────
app.use('/api', publicRouter)
app.use('/admin', adminRouter)

// ── Error handler (must be last) ─────────────────────────────
app.use(errorHandler)

// ── Listen ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV}`)
})

export default app
