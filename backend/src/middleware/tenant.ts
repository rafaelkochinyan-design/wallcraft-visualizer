import { Request, Response, NextFunction } from 'express'
import { prisma } from '../utils/prisma'
import { fail } from '../utils/response'

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  let slug: string | undefined

  // 1. Subdomain: wallcraft.yourdomain.com → slug = 'wallcraft'
  const host = req.hostname
  const parts = host.split('.')
  if (parts.length >= 3 && parts[0] !== 'www') {
    slug = parts[0]
  }

  // 2. Header (useful for mobile apps or server-to-server)
  if (!slug) {
    slug = req.headers['x-tenant-slug'] as string | undefined
  }

  // 3. Query param (fallback for single-tenant deploys without custom domain)
  if (!slug) {
    slug = req.query.store as string | undefined
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
