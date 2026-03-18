import { Response } from 'express'

export const ok = (res: Response, data: unknown, status = 200): Response =>
  res.status(status).json({ data, error: null })

export const fail = (res: Response, status: number, message: string, code?: string): Response =>
  res.status(status).json({ data: null, error: { message, code } })
