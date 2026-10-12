// Whitelisted collections for the admin data API, with the fields each one
// accepts. Unknown fields (id, _id, created_at, ...) are dropped on write.

type FieldType =
  | { type: 'string'; max: number; required?: boolean }
  | { type: 'url'; required?: boolean }
  | { type: 'enum'; values: readonly string[]; required?: boolean }
  | { type: 'boolean'; default: boolean }
  | { type: 'int'; default: number }
  | { type: 'tags' }
  | { type: 'json' }
  | { type: 'date' }

type CollectionDef = {
  fields: Record<string, FieldType>
  defaultSort: Record<string, 1 | -1>
  unique?: string            // field with a unique index (for friendly 409s)
  revalidate?: boolean       // affects public pages
  allowCreate?: boolean
}

const text = (max: number, required = false): FieldType => ({ type: 'string', max, required })

export const COLLECTIONS = {
  products: {
    fields: {
      name: text(200, true),
      category: text(100),
      image_url: { type: 'url' },
      description: text(5000),
      tags: { type: 'tags' },
      is_active: { type: 'boolean', default: true },
      sort_order: { type: 'int', default: 0 },
    },
    defaultSort: { sort_order: 1 },
    revalidate: true,
  },
  signature_brands: {
    fields: {
      name: text(200, true),
      tagline: text(300),
      description: text(5000),
      origin: text(200),
      packaging: text(300),
      certification: text(300),
      moq: text(200),
      grade: text(200),
      image_url: { type: 'url' },
      accent: { type: 'enum', values: ['amber', 'emerald', 'forest', 'terracotta'] },
      badge: text(100),
      cta_text: text(100),
      is_active: { type: 'boolean', default: true },
      sort_order: { type: 'int', default: 0 },
      brand_type: text(100),
    },
    defaultSort: { sort_order: 1 },
    revalidate: true,
  },
  slides: {
    fields: {
      title: text(500, true),
      subtitle: text(1000),
      cta_text: text(100),
      cta_link: text(500),
      media_type: { type: 'enum', values: ['image', 'video'] },
      image_url: { type: 'url' },
      video_url: { type: 'url' },
      badge_text: text(200),
      is_active: { type: 'boolean', default: true },
      sort_order: { type: 'int', default: 0 },
    },
    defaultSort: { sort_order: 1 },
    revalidate: true,
  },
  landing_pages: {
    fields: {
      slug: text(200, true),
      title: text(300, true),
      meta_description: text(1000),
      hero_headline: text(500),
      hero_subtext: text(2000),
      hero_image_url: { type: 'url' },
      hero_badge: text(100),
      hero_cta_text: text(100),
      content_blocks: { type: 'json' },
      seo_title: text(300),
      is_published: { type: 'boolean', default: false },
      show_chatbot: { type: 'boolean', default: true },
      show_inquiry_form: { type: 'boolean', default: true },
      expires_at: { type: 'date' },
    },
    defaultSort: { created_at: -1 },
    unique: 'slug',
    revalidate: true,
  },
  inquiries: {
    // Created only by the public /api/inquiries route; admins update status / delete.
    fields: {
      status: { type: 'enum', values: ['new', 'responded', 'closed'], required: true },
    },
    defaultSort: { created_at: -1 },
    allowCreate: false,
  },
  product_categories: {
    fields: { name: text(100, true) },
    defaultSort: { name: 1 },
    unique: 'name',
    revalidate: true, // products page tabs
  },
  brand_types: {
    fields: { name: text(100, true) },
    defaultSort: { name: 1 },
    unique: 'name',
  },
} satisfies Record<string, CollectionDef>

export type CollectionName = keyof typeof COLLECTIONS

export function getCollectionDef(name: string): (CollectionDef & { name: CollectionName }) | null {
  if (!Object.prototype.hasOwnProperty.call(COLLECTIONS, name)) return null
  return { name: name as CollectionName, ...(COLLECTIONS as Record<string, CollectionDef>)[name] }
}

type Result = { ok: true; data: Record<string, unknown> } | { ok: false; error: string }

const label = (field: string) => field.replace(/_/g, ' ')

// `partial` = update: only fields present in the input are validated/returned.
export function validateDoc(def: CollectionDef, input: unknown, { partial }: { partial: boolean }): Result {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'Invalid request body' }
  const body = input as Record<string, unknown>
  const out: Record<string, unknown> = {}

  for (const [field, spec] of Object.entries(def.fields)) {
    const present = field in body && body[field] !== undefined
    if (partial && !present) continue
    const value = body[field]

    switch (spec.type) {
      case 'string': {
        if (value === null || value === undefined || value === '') {
          if (spec.required) return { ok: false, error: `${label(field)} is required` }
          out[field] = null
          break
        }
        if (typeof value !== 'string') return { ok: false, error: `${label(field)} must be text` }
        const v = value.trim()
        if (spec.required && !v) return { ok: false, error: `${label(field)} is required` }
        if (v.length > spec.max) return { ok: false, error: `${label(field)} must be at most ${spec.max} characters` }
        out[field] = v || null
        break
      }
      case 'url': {
        if (value === null || value === undefined || value === '') {
          if (spec.required) return { ok: false, error: `${label(field)} is required` }
          out[field] = null
          break
        }
        if (typeof value !== 'string' || value.length > 2000) return { ok: false, error: `${label(field)} is invalid` }
        const v = value.trim()
        if (!/^https?:\/\//i.test(v) && !v.startsWith('/')) {
          return { ok: false, error: `${label(field)} must start with http(s):// or /` }
        }
        out[field] = v
        break
      }
      case 'enum': {
        if (value === null || value === undefined || value === '') {
          if (spec.required) return { ok: false, error: `${label(field)} is required` }
          out[field] = null
          break
        }
        if (typeof value !== 'string' || !spec.values.includes(value)) {
          return { ok: false, error: `${label(field)} must be one of: ${spec.values.join(', ')}` }
        }
        out[field] = value
        break
      }
      case 'boolean':
        if (value === undefined || value === null) out[field] = spec.default
        else if (typeof value !== 'boolean') return { ok: false, error: `${label(field)} must be true or false` }
        else out[field] = value
        break
      case 'int': {
        const n = value === undefined || value === null || value === '' ? spec.default : value
        if (!Number.isInteger(n) || (n as number) < 0 || (n as number) > 100000) {
          return { ok: false, error: `${label(field)} must be a whole number between 0 and 100000` }
        }
        out[field] = n
        break
      }
      case 'tags': {
        const tags = value ?? []
        if (!Array.isArray(tags) || tags.length > 30 || tags.some((t) => typeof t !== 'string' || t.length > 50)) {
          return { ok: false, error: `${label(field)} must be a list of up to 30 short texts` }
        }
        out[field] = (tags as string[]).map((t) => t.trim()).filter(Boolean)
        break
      }
      case 'json': {
        if (value === undefined || value === null) { out[field] = null; break }
        if (typeof value !== 'object') return { ok: false, error: `${label(field)} is invalid` }
        if (JSON.stringify(value).length > 500_000) return { ok: false, error: `${label(field)} is too large` }
        out[field] = value
        break
      }
      case 'date': {
        if (value === null || value === undefined || value === '') { out[field] = null; break }
        const d = new Date(value as string)
        if (typeof value !== 'string' || Number.isNaN(d.getTime())) return { ok: false, error: `${label(field)} must be a date` }
        out[field] = d
        break
      }
    }
  }

  if (partial && Object.keys(out).length === 0) return { ok: false, error: 'Nothing to update' }
  return { ok: true, data: out }
}
