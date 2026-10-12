import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getDb, toApi } from './mongo'
import { getCollectionDef, validateDoc } from './collections'

// Shared admin CRUD handlers. Callers must run requireAdmin() first.

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isId = (v: unknown): v is string => typeof v === 'string' && ID_RE.test(v)

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

function resolve(collection: string) {
  return getCollectionDef(collection)
}

function afterWrite(def: { revalidate?: boolean }) {
  if (def.revalidate) revalidatePath('/', 'layout')
}

export async function listDocs(collection: string) {
  const def = resolve(collection)
  if (!def) return bad('Unknown collection', 404)
  const db = await getDb()
  const docs = await db.collection(def.name).find({}).sort(def.defaultSort).limit(2000).toArray()
  return NextResponse.json({ items: docs.map((d) => toApi(d)) })
}

export async function getDoc(collection: string, id: string) {
  const def = resolve(collection)
  if (!def) return bad('Unknown collection', 404)
  if (!isId(id)) return bad('Invalid id')
  const db = await getDb()
  const doc = await db.collection(def.name).findOne({ _id: id as any })
  if (!doc) return bad('Not found', 404)
  return NextResponse.json({ item: toApi(doc) })
}

export async function createDoc(collection: string, body: unknown) {
  const def = resolve(collection)
  if (!def) return bad('Unknown collection', 404)
  if (def.allowCreate === false) return bad('Not allowed', 405)

  const parsed = validateDoc(def, body, { partial: false })
  if (!parsed.ok) return bad(parsed.error)

  const now = new Date()
  const doc = { _id: crypto.randomUUID(), ...parsed.data, created_at: now, updated_at: now }
  const db = await getDb()
  try {
    await db.collection(def.name).insertOne(doc as any)
  } catch (err: any) {
    if (err?.code === 11000) return bad(def.unique ? `This ${def.unique} already exists` : 'It already exists', 409)
    throw err
  }
  afterWrite(def)
  return NextResponse.json({ item: toApi(doc) }, { status: 201 })
}

export async function updateDoc(collection: string, id: string, body: unknown) {
  const def = resolve(collection)
  if (!def) return bad('Unknown collection', 404)
  if (!isId(id)) return bad('Invalid id')

  const parsed = validateDoc(def, body, { partial: true })
  if (!parsed.ok) return bad(parsed.error)

  const db = await getDb()
  let doc
  try {
    doc = await db.collection(def.name).findOneAndUpdate(
      { _id: id as any },
      { $set: { ...parsed.data, updated_at: new Date() } },
      { returnDocument: 'after' }
    )
  } catch (err: any) {
    if (err?.code === 11000) return bad(def.unique ? `This ${def.unique} already exists` : 'It already exists', 409)
    throw err
  }
  if (!doc) return bad('Not found', 404)
  afterWrite(def)
  return NextResponse.json({ item: toApi(doc) })
}

export async function deleteDoc(collection: string, id: string) {
  const def = resolve(collection)
  if (!def) return bad('Unknown collection', 404)
  if (!isId(id)) return bad('Invalid id')
  const db = await getDb()
  await db.collection(def.name).deleteOne({ _id: id as any })
  afterWrite(def)
  return NextResponse.json({ success: true })
}

export async function reorderDocs(collection: string, body: any) {
  const def = resolve(collection)
  if (!def) return bad('Unknown collection', 404)
  if (!('sort_order' in def.fields)) return bad('This collection cannot be reordered')

  const items = body?.items
  const valid =
    Array.isArray(items) && items.length > 0 && items.length <= 1000 &&
    items.every((i: any) => isId(i?.id) && Number.isInteger(i?.sort_order) && i.sort_order >= 0 && i.sort_order <= 100000)
  if (!valid) return bad('Invalid reorder payload')

  const db = await getDb()
  await db.collection(def.name).bulkWrite(
    items.map((i: { id: string; sort_order: number }) => ({
      updateOne: { filter: { _id: i.id as any }, update: { $set: { sort_order: i.sort_order } } },
    }))
  )
  afterWrite(def)
  return NextResponse.json({ success: true })
}

// Wraps a handler so unexpected DB errors become a JSON 500 instead of a crash.
export async function handle(fn: () => Promise<NextResponse>) {
  try {
    return await fn()
  } catch (err: any) {
    console.error('Admin API error:', err)
    const detail = process.env.NODE_ENV === 'development' ? `: ${err?.message || err}` : ''
    return NextResponse.json({ error: `Database error${detail}` }, { status: 500 })
  }
}
