import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { v4 as uuid } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export async function uploadFile(
  buffer: Buffer,
  folder: string,
  originalName: string,
  contentType: string
): Promise<string> {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin'
  const filename = `${uuid()}.${ext}`

  // Dev or no R2 configured — save to backend's own uploads/ dir and serve via Express static
  if (!process.env.R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID === 'skip') {
    const dir = join(process.cwd(), 'uploads', folder)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, filename), buffer)
    // Return full backend URL so Vercel FE can load it from Render
    const base = process.env.API_PUBLIC_URL || 'http://localhost:3001'
    return `${base}/uploads/${folder}/${filename}`
  }

  // Production: Cloudflare R2
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
  const key = `${folder}/${filename}`
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
  return `${process.env.R2_PUBLIC_URL}/${key}`
}
