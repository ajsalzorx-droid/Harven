import { NextResponse } from 'next/server'
import { getPublishedLandingPage } from '@/lib/db/queries'

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params
  if (!/^[a-z0-9-]{1,200}$/i.test(slug)) return NextResponse.json({ item: null }, { status: 404 })
  const item = await getPublishedLandingPage(slug)
  return NextResponse.json({ item }, { status: item ? 200 : 404 })
}
