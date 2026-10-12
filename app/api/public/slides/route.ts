import { NextResponse } from 'next/server'
import { getActiveSlides } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ items: await getActiveSlides() })
}
