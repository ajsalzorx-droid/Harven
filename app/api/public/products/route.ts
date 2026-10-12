import { NextResponse } from 'next/server'
import { getActiveProducts } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ items: await getActiveProducts() })
}
