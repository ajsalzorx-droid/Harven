"use client";

import React, { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin/api-client'
import { Search, Mail, Phone, Building2, Package, Globe, ExternalLink, RefreshCw, Terminal, Trash2 } from 'lucide-react'

export default function InquiriesCMS() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchInquiries = async () => {
    setLoading(true)
    setError(null)
    try {
      const { items: data } = await adminFetch<{ items: any[] }>('/api/admin/data/inquiries')

      if (data) {
        setInquiries(data)
        if (data.length > 0 && !selectedInquiry) {
          setSelectedInquiry(data[0])
        } else if (data.length === 0) {
          setSelectedInquiry(null)
        }
      }
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
     try {
       await adminFetch(`/api/admin/data/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) })
       setInquiries(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv))
       if (selectedInquiry?.id === id) {
         setSelectedInquiry({ ...selectedInquiry, status: newStatus })
       }
     } catch (err) {
       console.error(err)
     }
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry? This action cannot be undone.")) return
    try {
      await adminFetch(`/api/admin/data/inquiries/${id}`, { method: 'DELETE' })
      setInquiries(prev => prev.filter(inv => inv.id !== id))
      setSelectedInquiry(null)
    } catch (err: any) {
      console.error(err)
      alert("Failed to delete inquiry: " + (err.message || 'Unknown error'))
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const filteredInquiries = inquiries.filter(inv => 
    (inv.company?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.product_interest?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-dark">Inquiries Inbox</h1>
          <p className="text-text-muted mt-2">Manage wholesale requests from the chatbot, contact form, and landing pages.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchInquiries} className="p-2.5 rounded-lg border border-cream-dark bg-white hover:bg-cream transition-colors text-text-muted">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="px-6 py-2.5 rounded-lg border border-cream-dark bg-white text-sm font-medium hover:bg-cream transition-colors text-text-dark">
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-terracotta/10 border border-terracotta/20 rounded-xl text-terracotta flex items-center gap-3">
          <Terminal size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[70vh]">
         {/* List View */}
         <div className="w-full md:w-1/2 lg:w-2/5 border-r border-cream-dark flex flex-col">
           <div className="p-4 border-b border-cream-dark bg-cream-warm flex gap-2">
             <div className="relative w-full">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
               <input 
                 type="text" 
                 placeholder="Search inquiries..." 
                 className="p-2 pl-10 text-sm w-full bg-white border border-black/10 rounded-lg focus:outline-forest" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
           </div>
           <div className="overflow-y-auto flex-1 h-[600px] bg-white">
             {loading && inquiries.length === 0 ? (
               <div className="p-10 text-center opacity-30">Loading inbox...</div>
             ) : filteredInquiries.length === 0 ? (
               <div className="p-10 text-center text-text-muted italic">No inquiries found.</div>
             ) : filteredInquiries.map((inv) => (
                <div 
                  key={inv.id} 
                  onClick={() => setSelectedInquiry(inv)}
                  className={`p-5 border-b border-cream-dark cursor-pointer transition-colors ${selectedInquiry?.id === inv.id ? 'bg-forest/5 border-l-4 border-l-forest' : 'hover:bg-cream/50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-text-dark text-sm truncate pr-2">{inv.company || inv.name || 'Anonymous'}</h4>
                    <span className="text-[0.6rem] text-text-muted uppercase font-medium shrink-0">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted mb-3 line-clamp-1">{inv.message || 'No message content'}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="bg-cream px-2 py-0.5 rounded text-[10px] font-mono uppercase text-text-muted border border-cream-dark/50">
                      {inv.source}
                    </span>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                      inv.status === 'new' ? 'bg-orange-100 text-orange-700' : 
                      inv.status === 'responded' ? 'bg-blue-100 text-blue-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
           </div>
         </div>

         {/* Detail View */}
         <div className="w-full md:w-1/2 lg:w-3/5 p-4 lg:p-8 bg-cream-warm">
           {selectedInquiry ? (
             <div className="bg-white p-6 lg:p-10 rounded-2xl border border-black/5 shadow-sm h-full flex flex-col">
                <div className="flex flex-col lg:flex-row justify-between lg:items-start border-b border-cream-dark pb-6 mb-8 gap-4">
                   <div>
                     <h2 className="font-display text-3xl font-semibold text-text-dark">{selectedInquiry.company || 'Not Provided'}</h2>
                     <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2 text-sm text-text-mid">
                           <Mail size={16} className="text-forest/60" /> {selectedInquiry.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-mid">
                           <Phone size={16} className="text-forest/60" /> {selectedInquiry.phone || 'N/A'}
                        </div>
                     </div>
                   </div>
                   <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => deleteInquiry(selectedInquiry.id)}
                      className="p-2.5 text-terracotta hover:bg-terracotta/10 rounded-lg transition-colors border border-terracotta/20"
                      title="Delete Inquiry"
                    >
                      <Trash2 size={18} />
                    </button>
                    <select 
                      value={selectedInquiry.status}
                      onChange={(e) => updateStatus(selectedInquiry.id, e.target.value)}
                      className={`p-2.5 text-[0.65rem] font-bold border-none rounded-lg outline-none cursor-pointer shadow-sm transition-colors ${
                        selectedInquiry.status === 'new' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' : 
                        selectedInquiry.status === 'responded' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                        'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                        <option value="new">MARK AS NEW</option>
                        <option value="responded">MARK AS RESPONDED</option>
                        <option value="closed">MARK AS CLOSED</option>
                    </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                   <div className="bg-cream/40 p-5 rounded-2xl border border-black/5">
                     <div className="text-[0.65rem] font-mono uppercase text-text-muted tracking-widest mb-2 flex items-center gap-2">
                       <Package size={12} className="text-sage" /> Product Interest
                     </div>
                     <div className="font-medium text-text-dark">{selectedInquiry.product_interest || 'N/A'}</div>
                   </div>
                   <div className="bg-cream/40 p-5 rounded-2xl border border-black/5">
                     <div className="text-[0.65rem] font-mono uppercase text-text-muted tracking-widest mb-2 flex items-center gap-2">
                       <RefreshCw size={12} className="text-sage" /> Quantity
                     </div>
                     <div className="font-medium text-text-dark">{selectedInquiry.quantity || 'N/A'}</div>
                   </div>
                   <div className="bg-cream/40 p-5 rounded-2xl border border-black/5">
                     <div className="text-[0.65rem] font-mono uppercase text-text-muted tracking-widest mb-2 flex items-center gap-2">
                       <Globe size={12} className="text-sage" /> Country / Region
                     </div>
                     <div className="font-medium text-text-dark">{selectedInquiry.country || 'N/A'}</div>
                   </div>
                   <div className="bg-cream/40 p-5 rounded-2xl border border-black/5">
                     <div className="text-[0.65rem] font-mono uppercase text-text-muted tracking-widest mb-2 flex items-center gap-2">
                       <ExternalLink size={12} className="text-sage" /> Lead Source
                     </div>
                     <div className="font-medium text-text-dark capitalize">{selectedInquiry.source}</div>
                   </div>
                </div>

                <div className="bg-cream/50 p-6 lg:p-8 rounded-[32px] border border-cream-dark flex-1 shadow-inner">
                  <div className="text-[0.65rem] font-mono uppercase text-text-muted tracking-widest mb-6 border-b border-cream-dark pb-2">Message Content</div>
                  <p className="text-[1.05rem] text-text-dark leading-relaxed font-light whitespace-pre-wrap">
                    {selectedInquiry.message || 'No additional details provided.'}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-cream-dark flex flex-col sm:flex-row justify-between items-center gap-2">
                   <div className="text-[0.65rem] text-text-muted font-mono">
                      REF: {selectedInquiry.id}
                   </div>
                   <div className="text-[0.65rem] text-text-muted uppercase tracking-wider">
                      Timestamp: {new Date(selectedInquiry.created_at).toLocaleString()}
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex items-center justify-center text-text-muted italic opacity-40">
               Select an inquiry from the list to view details
             </div>
           )}
         </div>
      </div>
    </>
  )
}
