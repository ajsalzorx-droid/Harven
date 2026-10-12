import { NextResponse } from 'next/server'
import { requireAdmin, unauthorized } from '@/lib/auth/require-admin'
import { handle } from '@/lib/db/admin-crud'
import { getDb, toApi } from '@/lib/db/mongo'

export async function GET() {
  if (!(await requireAdmin())) return unauthorized()
  return handle(async () => {
    const db = await getDb()
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
    const [totalInquiries, newToday, activeLandingPages, recent] = await Promise.all([
      db.collection('inquiries').countDocuments(),
      db.collection('inquiries').countDocuments({ created_at: { $gte: startOfToday } }),
      db.collection('landing_pages').countDocuments({ is_published: true }),
      db.collection('inquiries').find({}).sort({ created_at: -1 }).limit(5).toArray(),
    ])
    return NextResponse.json({
      totalInquiries,
      newToday,
      activeLandingPages,
      recentInquiries: recent.map((d) => toApi(d)),
    })
  })
}
