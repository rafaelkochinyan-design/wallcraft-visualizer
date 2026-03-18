import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { fail } from '../utils/response'

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  let slug: string | undefined

  // 1. Query param — highest priority (works on any domain, including *.onrender.com)
  slug = req.query.store as string | undefined

  // 2. Header (useful for mobile apps or server-to-server)
  if (!slug) {
    slug = req.headers['x-tenant-slug'] as string | undefined
  }

  // 3. Subdomain: wallcraft.yourdomain.com → slug = 'wallcraft'
  //    Skip *.onrender.com and *.vercel.app (deployment platform domains)
  if (!slug) {
    const host = req.hostname
    const parts = host.split('.')
    const isCustomDomain = parts.length >= 3 && parts[0] !== 'www'
      && !host.endsWith('.onrender.com') && !host.endsWith('.vercel.app')
    if (isCustomDomain) {
      slug = parts[0]
    }
  }

  if (!slug) {
    return fail(res, 400, 'Tenant not identified. Use subdomain, x-tenant-slug header, or ?store= param.')
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug } })
    if (!tenant) {
      return fail(res, 404, `Store "${slug}" not found.`)
    }
    req.tenant = tenant
    next()
  } catch (err) {
    next(err)
  }
}
