import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { fail } from '../utils/response'

interface JwtPayload {
  sub: string
  tenant_id: string
  role: string
  iat: number
  exp: number
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return fail(res, 401, 'Unauthorized — missing or malformed Authorization header')
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = {
      id: payload.sub,
      tenant_id: payload.tenant_id,
      role: payload.role,
    }
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return fail(res, 401, 'Token expired', 'TOKEN_EXPIRED')
    }
    return fail(res, 401, 'Token invalid', 'TOKEN_INVALID')
  }
}
