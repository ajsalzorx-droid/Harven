import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto'

// Stored format: scrypt$N$r$p$<salt base64>$<hash base64>
const N = 16384
const R = 8
const P = 1
const KEY_LENGTH = 64

function scrypt(password: string, salt: Buffer, keylen: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key)))
  )
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const key = await scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N, r: R, p: P })
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [n, r, p] = parts.slice(1, 4).map(Number)
  const salt = Buffer.from(parts[4], 'base64')
  const expected = Buffer.from(parts[5], 'base64')
  if (!n || !r || !p || salt.length === 0 || expected.length === 0) return false

  const key = await scrypt(password.normalize('NFKC'), salt, expected.length, {
    N: n, r, p, maxmem: 256 * n * r,
  })
  return timingSafeEqual(key, expected)
}

// Used when the email doesn't exist so the response time doesn't reveal it.
const DUMMY_HASH = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64')
export async function verifyDummyPassword(password: string) {
  await verifyPassword(password, DUMMY_HASH)
  return false
}

export function validateNewCredentials(email: unknown, password: unknown):
  { ok: true; email: string; password: string } | { ok: false; error: string } {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.length > 254) {
    return { ok: false, error: 'A valid email is required' }
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
    return { ok: false, error: 'Password must be 8–200 characters' }
  }
  return { ok: true, email: email.trim().toLowerCase(), password }
}
