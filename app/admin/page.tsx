"use client";

import React, { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin/api-client'
import { LayoutDashboard, FileText, Image as ImageIcon, Box, Bot, Inbox, Settings, Terminal, RefreshCw } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newToday: 0,
    activeLandingPages: 0,
    chatbotInteractions: 0
  })
  const [recentInquiries, setRecentInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminFetch<{ totalInquiries: number; newToday: number; activeLandingPages: number; recentInquiries: any[] }>('/api/admin/dashboard')

      setStats({
        totalInquiries: data.totalInquiries || 0,
        newToday: data.newToday || 0,
        activeLandingPages: data.activeLandingPages || 0,
        chatbotInteractions: 0
      })

      if (data.recentInquiries) setRecentInquiries(data.recentInquiries)

    } catch (err: any) {
      console.error(err)
      setError(`Unexpected error: ${err.message || 'Unknown'}`);
    } finally {
      setLoading(false)
    }
  }

  const statConfig = [
    { title: 'Total Inquiries', val: stats.totalInquiries.toString(), icon: '📥', color: 'bg-blue-50 text-blue-600' },
    { title: 'New Today', val: stats.newToday.toString(), icon: '⚡', color: 'bg-green-50 text-green-600' },
    { title: 'Active Landing Pages', val: stats.activeLandingPages.toString(), icon: '📄', color: 'bg-purple-50 text-purple-600' },
    { title: 'Chatbot Interactions', val: stats.chatbotInteractions.toString(), icon: '🤖', color: 'bg-orange-50 text-orange-600' },
  ]


  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-dark">Overview</h1>
          <p className="text-text-muted mt-2">Welcome back to the HARVEN administrator panel.</p>
        </div>
        <button onClick={fetchDashboardData} className="p-2.5 rounded-lg border border-cream-dark bg-white hover:bg-cream transition-colors text-text-muted shrink-0">
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="mb-10 p-6 bg-terracotta/5 border border-terracotta/20 rounded-[28px] text-terracotta flex items-start gap-4 shadow-sm">
          <Terminal size={24} className="shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-sm font-bold mb-1 uppercase tracking-widest">Connection Diagnostics</p>
            <p className="text-sm font-light leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statConfig.map(s => (
          <div key={s.title} className="bg-white p-7 rounded-[32px] border border-black/5 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-text-muted mb-2">{s.title}</div>
              <div className="text-4xl font-semibold text-text-dark">
                {loading ? <span className="opacity-10">00</span> : s.val}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${s.color} shadow-inner`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-cream/20">
          <h3 className="font-semibold text-text-dark flex items-center gap-2">
            <Inbox size={18} className="text-forest/60" /> Recent Inquiries
          </h3>
          <a href="/admin/inquiries" className="text-[0.65rem] font-bold uppercase tracking-widest text-forest hover:opacity-70 transition-opacity">View Complete Inbox</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-cream/40 font-mono text-[0.6rem] uppercase tracking-widest text-text-dark border-b border-black/5">
              <tr>
                <th className="px-8 py-5">Company / Client</th>
                <th className="px-8 py-5">Product Interest</th>
                <th className="px-8 py-5">Source</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Date Received</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 opacity-20 italic">Synchronizing with database...</td></tr>
              ) : recentInquiries.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-text-muted font-light italic">No inquiries found in the database.</td></tr>
              ) : recentInquiries.map((row, i) => (
                <tr key={i} className="border-b border-black/5 hover:bg-cream/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-semibold text-text-dark text-[0.95rem]">{row.company || 'Private Trading'}</div>
                    <div className="text-xs text-text-muted mt-0.5">{row.name || 'Anonymous'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-text-dark font-medium">{row.product_interest || 'General Inquiry'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-cream-dark/30 px-2 py-0.5 rounded text-[10px] border border-cream-dark uppercase font-bold text-text-muted">
                      {row.source}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[0.65rem] font-bold uppercase tracking-wider ${
                      row.status === 'new' ? 'bg-orange-100 text-orange-700' : 
                      row.status === 'responded' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-mono text-xs">
                    {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
