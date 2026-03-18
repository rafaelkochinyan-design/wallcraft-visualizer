import { Tenant } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      tenant: Tenant
      user?: {
        id: string
        tenant_id: string
        role: string
      }
    }
  }
}

export {}
