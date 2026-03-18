// backend/src/services/r2.ts — DEV VERSION (local file storage)
// In production: replace with R2 S3Client version
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { v4 as uuid } from 'uuid'

export async function uploadFile(
  buffer: Buffer,
  folder: string,
  originalName: string,
  _contentType: string
): Promise<string> {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  const filename = `${uuid()}.${ext}`
  const dir = join(process.cwd(), '../frontend/public/uploads', folder)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, filename), buffer)
  return `/uploads/${folder}/${filename}`
}
