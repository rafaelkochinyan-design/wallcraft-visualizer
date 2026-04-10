import { Router } from 'express'
import { prisma } from '../utils/prisma'
import { ok, fail } from '../utils/response'

const router = Router()

const APP_ID = process.env.INSTAGRAM_APP_ID
const APP_SECRET = process.env.INSTAGRAM_APP_SECRET
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI

// GET /admin/instagram/auth-url
// Returns the Instagram OAuth URL for the admin to visit
router.get('/auth-url', async (req, res, next) => {
  try {
    if (!APP_ID || !REDIRECT_URI) {
      return fail(res, 500, 'Instagram App credentials not configured. Set INSTAGRAM_APP_ID and INSTAGRAM_REDIRECT_URI in environment variables.')
    }
    const url =
      `https://api.instagram.com/oauth/authorize` +
      `?client_id=${APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=user_profile,user_media` +
      `&response_type=code`
    ok(res, { url })
  } catch (err) {
    next(err)
  }
})

// GET /admin/instagram/callback?code=XXX
// OAuth callback: exchange code for long-lived token, save to DB
router.get('/callback', async (req, res, next) => {
  try {
    const { code } = req.query as { code?: string }
    if (!code) return fail(res, 400, 'Missing code parameter')
    if (!APP_ID || !APP_SECRET || !REDIRECT_URI) {
      return fail(res, 500, 'Instagram App credentials not configured')
    }

    // Step A: exchange code for short-lived token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: APP_ID,
        client_secret: APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })
    const tokenData = await tokenRes.json() as any
    if (!tokenData.access_token) {
      return fail(res, 400, `Instagram token exchange failed: ${tokenData.error_message || JSON.stringify(tokenData)}`)
    }
    const { access_token: shortToken, user_id: userId } = tokenData

    // Step B: exchange for long-lived token (60 days)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_secret=${APP_SECRET}` +
      `&access_token=${shortToken}`
    )
    const longData = await longRes.json() as any
    if (!longData.access_token) {
      return fail(res, 400, `Long-lived token exchange failed: ${JSON.stringify(longData)}`)
    }
    const { access_token: longToken, expires_in: expiresIn } = longData

    // Step C: save to DB
    await prisma.tenant.updateMany({
      where: { id: req.tenant.id },
      data: {
        instagram_access_token: longToken,
        instagram_token_expiry: new Date(Date.now() + expiresIn * 1000),
        instagram_user_id: String(userId),
      },
    })

    res.redirect('/admin/settings?instagram=connected')
  } catch (err) {
    next(err)
  }
})

// GET /admin/instagram/status
// Returns whether Instagram is connected for this tenant
router.get('/status', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenant.id } })
    const connected = !!tenant?.instagram_access_token
    const expiry = tenant?.instagram_token_expiry ?? null
    ok(res, { connected, expiry })
  } catch (err) {
    next(err)
  }
})

// POST /admin/instagram/import
// Fetches latest Instagram photos and imports them to Gallery (skips duplicates)
router.post('/import', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenant.id } })
    if (!tenant?.instagram_access_token) {
      return fail(res, 400, 'Instagram not connected. Connect via /admin/instagram/auth-url first.')
    }

    const mediaRes = await fetch(
      `https://graph.instagram.com/me/media` +
      `?fields=id,caption,media_type,media_url,thumbnail_url,timestamp` +
      `&limit=20` +
      `&access_token=${tenant.instagram_access_token}`
    )
    const mediaData = await mediaRes.json() as any
    if (!mediaData.data) {
      return fail(res, 400, `Instagram API error: ${JSON.stringify(mediaData)}`)
    }

    const images = (mediaData.data as any[]).filter(
      (m) => m.media_type === 'IMAGE' || m.media_type === 'CAROUSEL_ALBUM'
    )

    let imported = 0
    for (const item of images) {
      // Skip duplicates (identified by instagram post ID in caption)
      const existing = await prisma.galleryItem.findFirst({
        where: {
          tenant_id: req.tenant.id,
          caption: { contains: `ig:${item.id}` },
        },
      })
      if (existing) continue

      const rawCaption: string = item.caption ?? ''
      const caption = rawCaption
        ? `${rawCaption.slice(0, 200)} [ig:${item.id}]`
        : `[ig:${item.id}]`

      await prisma.galleryItem.create({
        data: {
          tenant_id: req.tenant.id,
          image_url: item.media_url,
          thumb_url: item.thumbnail_url ?? item.media_url,
          caption,
          active: true,
          sort_order: 0,
          tags: ['instagram'],
          space_type: null,
        },
      })
      imported++
    }

    ok(res, { imported, total: images.length })
  } catch (err) {
    next(err)
  }
})

// POST /admin/instagram/refresh-token
// Refreshes the long-lived token before expiry
router.post('/refresh-token', async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: req.tenant.id } })
    if (!tenant?.instagram_access_token) {
      return fail(res, 400, 'Instagram not connected')
    }

    const refreshRes = await fetch(
      `https://graph.instagram.com/refresh_access_token` +
      `?grant_type=ig_refresh_token` +
      `&access_token=${tenant.instagram_access_token}`
    )
    const data = await refreshRes.json() as any
    if (!data.access_token) {
      return fail(res, 400, `Token refresh failed: ${JSON.stringify(data)}`)
    }

    await prisma.tenant.updateMany({
      where: { id: req.tenant.id },
      data: {
        instagram_access_token: data.access_token,
        instagram_token_expiry: new Date(Date.now() + data.expires_in * 1000),
      },
    })

    ok(res, { refreshed: true, expiry: new Date(Date.now() + data.expires_in * 1000) })
  } catch (err) {
    next(err)
  }
})

export default router
