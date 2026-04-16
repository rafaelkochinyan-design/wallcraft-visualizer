import { Request, Response } from 'express'
import { uploadFile } from '../services/r2'
import { ok, fail } from './response'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Standard image upload handler: JPG/PNG/WebP, 10MB default.
 * Pass allowSvg or maxBytes to override.
 */
export async function handleImageUpload(
  req: Request,
  res: Response,
  folder: string,
  options?: { allowSvg?: boolean; maxBytes?: number }
): Promise<Response> {
  if (!req.file) return fail(res, 400, 'No file uploaded')
  const allowed = options?.allowSvg ? [...IMAGE_TYPES, 'image/svg+xml'] : IMAGE_TYPES
  if (!allowed.includes(req.file.mimetype)) {
    const types = options?.allowSvg ? 'JPG, PNG, WebP, or SVG' : 'JPG, PNG, or WebP'
    return fail(res, 400, `Invalid file type. Use ${types}.`)
  }
  const maxBytes = options?.maxBytes ?? 10 * 1024 * 1024
  if (req.file.size > maxBytes)
    return fail(res, 400, `File too large. Max ${Math.round(maxBytes / 1024 / 1024)}MB.`)
  const url = await uploadFile(req.file.buffer, folder, req.file.originalname, req.file.mimetype)
  return ok(res, { url })
}
