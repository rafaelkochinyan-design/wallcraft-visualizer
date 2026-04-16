import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { join } from 'path'
import cookieParser from 'cookie-parser'
import { tenantMiddleware } from './middleware/tenant'
import { errorHandler } from './middleware/errorHandler'
import publicRouter from './routes/public'
import adminRouter from './routes/admin'
import leadsRouter from './routes/leads'
import contentRouter from './routes/content'
import adminContentRouter from './routes/adminContent'
import instagramRouter from './routes/instagram'
import { refreshInstagramTokenIfNeeded } from './jobs/instagramRefresh'
import { setIO } from './utils/socket'

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',').map(o => o.trim())

app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
}))

// ── Socket.io ─────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})
setIO(io)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check (no tenant required) ────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))

// ── Static uploads (fallback when R2 not configured) ─────────
app.use('/uploads', express.static(join(process.cwd(), 'uploads')))

// ── Tenant resolution (all routes below require tenant) ────────
app.use(tenantMiddleware)

// ── Routes ────────────────────────────────────────────────────
app.use('/api', publicRouter)
app.use('/api', contentRouter)
app.use('/admin', adminRouter)
app.use('/admin', adminContentRouter)
app.use('/admin/instagram', instagramRouter)
app.use(leadsRouter)

// ── Error handler (must be last) ─────────────────────────────
app.use(errorHandler)

// ── Listen ────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV}`)
})

// ── Instagram token auto-refresh (daily at 3am) ───────────────
setInterval(() => {
  if (new Date().getHours() === 3) {
    refreshInstagramTokenIfNeeded().catch(console.error)
  }
}, 60 * 60 * 1000)

export default app
