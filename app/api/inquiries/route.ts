import { getDb } from '@/lib/db/mongo'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FIELDS = { name: 200, company: 200, country: 100, email: 254, phone: 50, product_interest: 300, quantity: 200, message: 5000, source: 200, landing_page_slug: 200 } as const

const escapeHtml = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const inquiry: Record<string, string | null> = {}
    for (const [field, max] of Object.entries(FIELDS)) {
      const value = body[field]
      inquiry[field] = typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null
    }
    const { name, company, email, phone, product_interest, quantity, message, source } = inquiry

    // 1. Insert into MongoDB
    const db = await getDb()
    await db.collection('inquiries').insertOne({
      _id: crypto.randomUUID() as any,
      ...inquiry,
      source: source || 'direct',
      status: 'new',
      created_at: new Date(),
    })

    // 2. Send Email Notification (if API key is present)
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Harven Inquiries <onboarding@resend.dev>', // Update this with client's domain later
          to: ['harvenllc@gmail.com'],
          subject: `New Trade Inquiry: ${name} (${company})`.replace(/[\r\n]+/g, ' ').slice(0, 200),
          html: `
            <h2>New Inquiry Received</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Company:</strong> ${escapeHtml(company)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Interest:</strong> ${escapeHtml(product_interest)}</p>
            <p><strong>Quantity:</strong> ${escapeHtml(quantity)}</p>
            <p><strong>Message:</strong> ${escapeHtml(message)}</p>
            <hr />
            <p>This inquiry was captured from: ${escapeHtml(source)}</p>
          `
        })
      } catch (emailError) {
        console.error('Email Notification Error:', emailError)
        // We don't return error here because DB was successful
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Inquiry API Error:', error)
    return NextResponse.json({ error: 'Failed to process inquiry' }, { status: 500 })
  }
}
