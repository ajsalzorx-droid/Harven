import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

// Server-only Cloudinary client (uses CLOUDINARY_* env vars from .env.local).
const FOLDER = process.env.CLOUDINARY_FOLDER || 'harven'
let configured = false

export function isCloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
}

function client() {
  if (!isCloudinaryConfigured()) {
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set')
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    })
    configured = true
  }
  return cloudinary
}

// Uploads file bytes, or a remote http(s) URL that Cloudinary fetches itself.
export function uploadToCloudinary(data: Buffer | string, publicId: string): Promise<UploadApiResponse> {
  const options = { folder: FOLDER, public_id: publicId, resource_type: 'auto' as const, overwrite: false }
  if (typeof data === 'string') return client().uploader.upload(data, options)

  return new Promise((resolve, reject) => {
    const stream = client().uploader.upload_stream(options, (err, result) =>
      err || !result ? reject(err ?? new Error('Cloudinary upload failed')) : resolve(result)
    )
    stream.end(data)
  })
}

export async function deleteFromCloudinary(publicId: string, resourceType: string) {
  const result = await client().uploader.destroy(publicId, { resource_type: resourceType, invalidate: true })
  if (result?.result !== 'ok' && result?.result !== 'not found') {
    throw new Error(`Cloudinary delete failed: ${result?.result}`)
  }
}
