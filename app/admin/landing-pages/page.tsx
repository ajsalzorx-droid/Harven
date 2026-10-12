"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Plus, Edit, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { adminFetch } from '@/lib/admin/api-client'

export default function LandingPagesList() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPages = async () => {
    setLoading(true)
    try {
      const { items } = await adminFetch<{ items: any[] }>('/api/admin/data/landing_pages')
      setPages(items || [])
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    try {
      await adminFetch(`/api/admin/data/landing_pages/${id}`, { method: 'DELETE' })
    } catch (err: any) {
      alert("Error deleting page: " + (err.message || 'Unknown error'))
    }
    fetchPages()
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-dark">Landing Pages</h1>
          <p className="text-text-muted mt-2">Create customizable marketing pages for specific stock or offers.</p>
        </div>
        <Link href="/admin/landing-pages/new">
          <Button variant="primary" className="py-2.5 px-6"><Plus size={16} /> Create Page</Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-cream/50 font-medium text-text-dark border-b border-black/5">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">URL Slug</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-forest"><Loader2 className="animate-spin inline mr-2" size={20} /> Loading pages...</td>
                </tr>
              ) : (
                pages.map((row) => (
                  <tr key={row.id} className="border-b border-black/5 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4 text-text-dark font-medium">{row.title}</td>
                    <td className="px-6 py-4 font-mono text-xs">/{row.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {row.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 px-6">
                       <Link href={`/admin/landing-pages/${row.id}`} className="p-2 text-text-muted hover:text-forest transition-colors rounded-lg hover:bg-cream"><Edit size={16} /></Link>
                       {row.is_published && (
                         <Link href={`/${row.slug}`} target="_blank" className="p-2 text-text-muted hover:text-forest transition-colors rounded-lg hover:bg-cream"><ExternalLink size={16} /></Link>
                       )}
                       <button onClick={() => handleDelete(row.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && pages.length === 0 && (
          <div className="p-12 text-center text-text-muted">No landing pages found.</div>
        )}
      </div>
    </>
  )
}
