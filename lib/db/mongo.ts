import { MongoClient, type Db } from 'mongodb'
import { ensureSeeded } from './seed'

// Reuse one client across hot reloads / route handlers in the same process.
const globalForMongo = globalThis as unknown as { _harvenMongo?: Promise<MongoClient> }

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI)
}

async function getClient() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI must be set')

  if (!globalForMongo._harvenMongo) {
    globalForMongo._harvenMongo = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })
      .connect()
      .catch((err) => {
        globalForMongo._harvenMongo = undefined // allow retry on next request
        throw err
      })
  }
  return globalForMongo._harvenMongo
}

export async function getDb(): Promise<Db> {
  const client = await getClient()
  const db = client.db(process.env.MONGODB_DB || 'harven')
  await ensureSeeded(db)
  return db
}

// Documents use a string `_id`; the API exposes it as `id`.
export function toApi<T extends { _id?: unknown }>(doc: T | null) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return { id: _id as string, ...rest }
}
