"use client";

import React, { useState, useEffect } from 'react'
import { adminFetch, uploadAdminFile } from '@/lib/admin/api-client'
import { Terminal, AlertCircle, RefreshCw, Plus, Image as ImageIcon, Video, Trash2, Edit2, Loader2, UploadCloud } from 'lucide-react'
import { ImagePicker } from '@/components/admin/ImagePicker'

export default function HomepageCMS() {
  const [activeTab, setActiveTab] = useState('slider')
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Slide Editing State
  const [editingSlide, setEditingSlide] = useState<any>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  const fetchSlides = async () => {
    setLoading(true)
    setError(null)
    try {
      const { items } = await adminFetch<{ items: any[] }>('/api/admin/data/slides')
      if (items) {
        setSlides(items)
      }
    } catch (e: any) {
      console.log(e)
      setError(`Unexpected error: ${e.message || 'Unknown error'}`);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlides()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this slide?")) return
    try {
       await adminFetch(`/api/admin/data/slides/${id}`, { method: 'DELETE' })
       fetchSlides()
    } catch (err: any) {
       console.error(err)
       alert("Failed to delete slide: " + (err.message || 'Unknown error'))
    }
  }

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSlide.id) {
        await adminFetch(`/api/admin/data/slides/${editingSlide.id}`, { method: 'PATCH', body: JSON.stringify(editingSlide) })
      } else {
        await adminFetch('/api/admin/data/slides', { method: 'POST', body: JSON.stringify(editingSlide) })
      }
      setEditingSlide(null)
      fetchSlides()
    } catch (err: any) {
      console.error(err)
      alert("Error saving slide: " + (err.message || 'Unknown error'))
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setUploadingVideo(true)
    
    try {
      const file = e.target.files[0]
      const { publicUrl } = await uploadAdminFile(file)
      setEditingSlide({...editingSlide, video_url: publicUrl})
    } catch (err) {
      console.error(err)
      alert("Failed to upload video. Ensure 'harven_assets' bucket exists and allows uploads.")
    } finally {
      setUploadingVideo(false)
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-dark">Homepage Configuration</h1>
          <p className="text-text-muted mt-2">Manage the hero slider and site-wide content blocks.</p>
        </div>
        <button 
          onClick={() => setEditingSlide({ title: '', subtitle: '', cta_text: 'Explore', cta_link: '/products', media_type: 'image', is_active: true, sort_order: (slides.length + 1) })}
          className="flex items-center gap-2 bg-forest text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-forest-deep transition-colors shadow-sm"
        >
          <Plus size={18} /> Add New Slide
        </button>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-terracotta/5 border border-terracotta/20 rounded-[24px] text-terracotta flex items-start gap-4 shadow-sm">
          <Terminal size={24} className="shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-sm font-bold mb-2 uppercase tracking-widest">Database Sync Error</p>
            <p className="text-sm font-light leading-relaxed mb-4">{error}</p>
            <div className="flex gap-4">
               <button onClick={fetchSlides} className="flex items-center gap-2 px-4 py-2 bg-terracotta/10 rounded-lg text-xs font-bold hover:bg-terracotta/20 transition-colors">
                 <RefreshCw size={14} /> Try Again
               </button>
               <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer"className="flex items-center gap-2 px-4 py-2 border border-terracotta/20 rounded-lg text-xs font-bold hover:bg-terracotta/5 transition-colors">
                 Open MongoDB Atlas
               </a>
            </div>
          </div>
        </div>
      )}

      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setEditingSlide(null)} />
          <form onSubmit={handleSaveSlide} className="relative bg-white rounded-[32px] border border-black/5 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 lg:p-12 animate-in fade-in zoom-in duration-300">
            <h2 className="font-display text-2xl font-semibold mb-8">{editingSlide.id ? 'Edit Slide' : 'Add New Slide'}</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex bg-cream p-1 rounded-2xl border border-cream-dark w-fit">
                <button 
                  type="button"
                  onClick={() => setEditingSlide({ ...editingSlide, media_type: 'image' })}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-xs font-bold transition-all ${editingSlide.media_type === 'image' ? 'bg-white text-forest shadow-sm' : 'text-text-muted hover:text-text-dark'}`}
                >
                  <ImageIcon size={16} /> Image
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingSlide({ ...editingSlide, media_type: 'video' })}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-[14px] text-xs font-bold transition-all ${editingSlide.media_type === 'video' ? 'bg-white text-forest shadow-sm' : 'text-text-muted hover:text-text-dark'}`}
                >
                  <Video size={16} /> Video
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1.5">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">Title (HTML allowed)</label>
                   <input type="text" required value={editingSlide.title} onChange={e => setEditingSlide({...editingSlide, title: e.target.value})} className="w-full p-4 bg-cream/50 border border-cream-dark rounded-xl focus:outline-forest" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">Badge Text</label>
                   <input type="text" value={editingSlide.badge_text || ''} onChange={e => setEditingSlide({...editingSlide, badge_text: e.target.value})} className="w-full p-4 bg-cream/50 border border-cream-dark rounded-xl focus:outline-forest" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">Subtitle</label>
                   <textarea rows={2} value={editingSlide.subtitle || ''} onChange={e => setEditingSlide({...editingSlide, subtitle: e.target.value})} className="w-full p-4 bg-cream/50 border border-cream-dark rounded-xl focus:outline-forest" />
                </div>
                
                <div className="sm:col-span-2">
                  <ImagePicker 
                    label="Poster Image URL"
                    value={editingSlide.image_url || ''}
                    onChange={(url) => setEditingSlide({...editingSlide, image_url: url})}
                  />
                </div>

                {editingSlide.media_type === 'video' && (
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">Video File URL/Path</label>
                    <div className="flex gap-4 items-start">
                      <div className="flex-1">
                        <input type="text" required value={editingSlide.video_url || ''} onChange={e => setEditingSlide({...editingSlide, video_url: e.target.value})} className="w-full p-4 bg-cream/50 border border-forest/30 rounded-xl focus:outline-forest text-forest font-medium" placeholder="/videos/hero-1.mov" />
                      </div>
                      <div className="relative shrink-0">
                        <input 
                          type="file" 
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={uploadingVideo}
                        />
                        <button type="button" className="px-6 py-4 bg-forest/10 text-forest border border-forest/20 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-forest/20 transition-colors h-[54px]">
                          {uploadingVideo ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                          {uploadingVideo ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">CTA Text</label>
                   <input type="text" value={editingSlide.cta_text || ''} onChange={e => setEditingSlide({...editingSlide, cta_text: e.target.value})} className="w-full p-4 bg-cream/50 border border-cream-dark rounded-xl focus:outline-forest" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">CTA Link</label>
                   <input type="text" value={editingSlide.cta_link || ''} onChange={e => setEditingSlide({...editingSlide, cta_link: e.target.value})} className="w-full p-4 bg-cream/50 border border-cream-dark rounded-xl focus:outline-forest" />
                </div>
                
                <div className="sm:col-span-2 mt-4 pt-4 border-t border-cream-dark">
                   <label className="flex items-center gap-3 cursor-pointer p-4 bg-cream rounded-xl">
                     <input 
                       type="checkbox" 
                       className="w-5 h-5 rounded text-forest focus:ring-forest" 
                       checked={editingSlide.is_active ?? true} 
                       onChange={e => setEditingSlide({...editingSlide, is_active: e.target.checked})} 
                     />
                     <div>
                       <span className="text-sm font-bold block text-text-dark">Slide is Active</span>
                       <span className="text-[0.7rem] text-text-muted font-light">If unchecked, this slide will not appear on the public homepage slider.</span>
                     </div>
                   </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-10">
               <button type="button" onClick={() => setEditingSlide(null)} className="px-6 py-3 text-sm font-bold text-text-muted hover:text-text-dark transition-colors">Cancel</button>
               {editingSlide.id && (
                 <button 
                   type="button" 
                   onClick={() => handleDelete(editingSlide.id)} 
                   className="bg-terracotta/10 text-terracotta px-6 py-3 rounded-xl text-sm font-bold hover:bg-terracotta hover:text-white transition-all"
                 >
                   Delete Slide
                 </button>
               )}
               <button type="submit" className="bg-forest text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-forest-deep transition-all shadow-xl shadow-forest/10">Save Slide</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="flex border-b border-black/5 px-6 pt-4 gap-6">
           <button onClick={() => setActiveTab('slider')} className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'slider' ? 'border-forest text-forest' : 'border-transparent text-text-muted hover:text-text-dark'}`}>Hero Slider</button>
           <button onClick={() => setActiveTab('content')} className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'content' ? 'border-forest text-forest' : 'border-transparent text-text-muted hover:text-text-dark'}`}>Content Blocks</button>
        </div>

        <div className="p-6 md:p-10 min-h-[50vh]">
          {activeTab === 'slider' && (
             <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center bg-cream/30 p-4 rounded-xl border border-cream-dark/50">
                   <span className="text-xs font-mono uppercase text-text-muted tracking-widest">{slides.length} SLIDES CONFIGURED</span>
                   <button onClick={fetchSlides} className="text-forest hover:opacity-70 transition-opacity">
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                   </button>
                </div>
                
                {loading && slides.length === 0 ? (
                   <div className="text-center py-20 flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-2 border-forest/20 border-t-forest animate-spin rounded-full"></div>
                      <p className="text-text-muted font-light">Checking database for slides...</p>
                   </div>
                ) : slides.length === 0 ? (
                   <div className="text-center py-20 bg-cream/20 rounded-[32px] border border-dashed border-cream-dark">
                      <AlertCircle size={48} className="mx-auto text-text-muted opacity-20 mb-4" />
                      <p className="text-text-muted font-light">No slides found in the database.<br/>Try adding one or running the seed script.</p>
                   </div>
                ) : slides.map(slide => (
                   <div key={slide.id} className="border border-cream-dark rounded-xl p-4 flex flex-col md:flex-row gap-6 items-start hover:bg-cream-warm transition-colors group relative">
                      <div className="relative shrink-0">
                        {slide.media_type === 'video' ? (
                          <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden bg-black shadow-sm flex items-center justify-center">
                             {slide.video_url && <video src={slide.video_url} className="absolute inset-0 w-full h-full object-cover opacity-60" muted loop />}
                             <Video className="relative z-10 text-white" size={32} />
                          </div>
                        ) : (
                          slide.image_url ? (
                            <img src={slide.image_url} alt="" className="w-full md:w-48 h-32 object-cover rounded-lg bg-cream shadow-sm" />
                          ) : (
                            <div className="w-full md:w-48 h-32 rounded-lg bg-cream flex items-center justify-center text-text-muted">No Image</div>
                          )
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-text-muted bg-white border border-cream-dark px-2.5 py-1 rounded">ORDER {slide.sort_order}</span>
                          <span className={`text-[0.6rem] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{slide.is_active ? 'Active' : 'Draft'}</span>
                          {slide.media_type === 'video' && <span className="bg-forest/10 text-forest text-[0.6rem] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Video Slide</span>}
                        </div>
                        <h3 className="font-display text-xl leading-tight text-text-dark" dangerouslySetInnerHTML={{__html: slide.title}} />
                        <p className="text-text-muted text-sm line-clamp-2 font-light">{slide.subtitle}</p>
                      </div>
                      <div className="flex flex-row md:flex-col gap-3 self-start md:self-stretch justify-center pl-4 md:border-l border-cream-dark/50">
                         <button onClick={() => setEditingSlide(slide)} className="text-[0.7rem] font-bold uppercase tracking-widest text-forest hover:opacity-70 transition-opacity p-1 flex items-center gap-1.5"><Edit2 size={12} /> Edit</button>
                         <button onClick={() => handleDelete(slide.id)} className="text-[0.7rem] font-bold uppercase tracking-widest text-terracotta hover:opacity-70 transition-opacity p-1 flex items-center gap-1.5"><Trash2 size={12} /> Delete</button>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {activeTab === 'content' && (
             <div className="flex flex-col gap-8 max-w-3xl">
                <div className="space-y-2">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">CTA Headline</label>
                   <input type="text" className="w-full p-4 bg-cream/50 border border-cream-dark rounded-2xl focus:outline-forest transition-all" defaultValue="Ready to trade with **confidence**?" />
                </div>
                <div className="space-y-2">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">About Purpose Text</label>
                   <textarea rows={4} className="w-full p-4 bg-cream/50 border border-cream-dark rounded-2xl focus:outline-forest transition-all" defaultValue="Born in the UAE — a global crossroads of trade — HARVEN exists to connect the world's finest producers with markets that demand quality, reliability, and scale." />
                </div>
                <div className="space-y-2">
                   <label className="text-[0.65rem] font-mono uppercase tracking-widest text-text-muted ml-1">Vision Quote</label>
                   <textarea rows={3} className="w-full p-4 bg-cream/50 border border-cream-dark rounded-2xl focus:outline-forest transition-all" defaultValue='"A supply chain is only as strong as its **integrity**. At Harven, we guarantee ours."' />
                </div>
                <button className="bg-forest text-white px-8 py-4 rounded-2xl text-sm font-medium w-full sm:w-auto self-start mt-4 shadow-xl shadow-forest/10 hover:bg-forest-deep transition-all">Save Changes</button>
             </div>
          )}
        </div>
      </div>
    </>
  )
}
