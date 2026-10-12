"use client";

import React, { useState, useEffect, useRef } from 'react'
import { adminFetch } from '@/lib/admin/api-client'
import { X, Plus, Edit2, Trash2, Loader2, Save, Settings, GripVertical, CheckCircle2 } from 'lucide-react'
import { CategoryManager } from '@/components/admin/CategoryManager'
import { ImagePicker } from '@/components/admin/ImagePicker'

export default function BrandsCMS() {
  const [brands, setBrands] = useState<any[]>([])
  const [brandTypes, setBrandTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTypeManagerOpen, setIsTypeManagerOpen] = useState(false)
  const [currentBrand, setCurrentBrand] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderSaved, setOrderSaved] = useState(false)

  // Filter state
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('All')

  // Drag state
  const dragIndexRef = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)


  useEffect(() => {
    fetchBrands()
    fetchBrandTypes()
  }, [])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const { items } = await adminFetch<{ items: any[] }>('/api/admin/data/signature_brands')
      if (items) setBrands(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBrandTypes = async () => {
    try {
      const { items } = await adminFetch<{ items: any[] }>('/api/admin/data/brand_types')
      if (items) setBrandTypes(items)
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenModal = (brand: any = null) => {
    setCurrentBrand(brand || {
      name: '',
      tagline: '',
      description: '',
      origin: '',
      packaging: '',
      certification: '',
      moq: '',
      grade: '',
      image_url: '',
      accent: 'forest',
      badge: '',
      cta_text: 'Inquire Now',
      is_active: true,
      sort_order: brands.length + 1,
      brand_type: brandTypes.length > 0 ? brandTypes[0].name : 'KeraZone'
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (currentBrand.id) {
        await adminFetch(`/api/admin/data/signature_brands/${currentBrand.id}`, { method: 'PATCH', body: JSON.stringify(currentBrand) })
      } else {
        await adminFetch('/api/admin/data/signature_brands', { method: 'POST', body: JSON.stringify(currentBrand) })
      }
      setIsModalOpen(false)
      fetchBrands()
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Failed to save brand. ${error?.message || ''}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand?")) return
    try {
      await adminFetch(`/api/admin/data/signature_brands/${id}`, { method: 'DELETE' })
      fetchBrands()
    } catch (err) {
      console.error(err)
    }
  }

  // ─── DRAG AND DROP ────────────────────────────────────────────────────────

  // The filtered list shown in the table
  const filteredBrands = activeBrandFilter === 'All'
    ? brands
    : brands.filter(b => b.brand_type === activeBrandFilter)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index
    setDraggingIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    dragOverIndexRef.current = index
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDraggingIndex(null)
    setDragOverIndex(null)
    dragIndexRef.current = null
    dragOverIndexRef.current = null
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    const dragIdx = dragIndexRef.current
    if (dragIdx === null || dragIdx === dropIndex) {
      handleDragEnd()
      return
    }

    // Reorder the filtered list
    const newFiltered = [...filteredBrands]
    const [moved] = newFiltered.splice(dragIdx, 1)
    newFiltered.splice(dropIndex, 0, moved)

    // Merge back into the full brands list preserving non-filtered positions
    let filteredPointer = 0
    const newBrands = brands.map(b => {
      if (activeBrandFilter === 'All' || b.brand_type === activeBrandFilter) {
        return newFiltered[filteredPointer++]
      }
      return b
    })

    // Reassign sort_order sequentially
    const reordered = newBrands.map((b, i) => ({ ...b, sort_order: i + 1 }))
    setBrands(reordered)
    handleDragEnd()

    // Persist via the admin API
    setSavingOrder(true)
    try {
      await adminFetch('/api/admin/data/signature_brands/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items: reordered.map(b => ({ id: b.id, sort_order: b.sort_order })) }),
      })
      setOrderSaved(true)
      setTimeout(() => setOrderSaved(false), 2500)
    } catch (err) {
      console.error('Order save error:', err)
      alert('Failed to save order. Please try again.')
      fetchBrands() // revert
    } finally {
      setSavingOrder(false)
    }
  }

  // ─── UNIQUE BRAND TYPES from loaded brands ─────────────────────────────
  const uniqueBrandTypes = ['All', ...Array.from(new Set(brands.map(b => b.brand_type).filter(Boolean)))]

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-dark">Signature Brands</h1>
          <p className="text-text-muted mt-2">Manage your KeraZone, Fióri, and other signature brand portfolios.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTypeManagerOpen(true)}
            className="bg-white text-text-muted px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-dark hover:bg-cream transition-all flex items-center gap-2"
          >
            <Settings size={18} /> Brands
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-forest text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-deep transition-all shadow-lg shadow-forest/10 flex items-center gap-2"
          >
            <Plus size={18} /> Add New Brand Item
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      {!loading && brands.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-[0.65rem] font-bold text-text-muted uppercase tracking-widest mr-1">Filter:</span>
          {uniqueBrandTypes.map(type => (
            <button
              key={type}
              onClick={() => { setActiveBrandFilter(type); handleDragEnd() }}
              className={`px-4 py-1.5 rounded-full text-[0.75rem] font-semibold transition-all border ${
                activeBrandFilter === type
                  ? 'bg-forest text-white border-forest shadow-sm shadow-forest/20'
                  : 'bg-white text-text-muted border-cream-dark hover:border-forest/40 hover:text-forest'
              }`}
            >
              {type}
              {type !== 'All' && (
                <span className={`ml-1.5 text-[0.6rem] ${activeBrandFilter === type ? 'opacity-60' : 'opacity-40'}`}>
                  ({brands.filter(b => b.brand_type === type).length})
                </span>
              )}
            </button>
          ))}

          {/* Save order indicator */}
          <div className="ml-auto flex items-center gap-2">
            {savingOrder && (
              <span className="flex items-center gap-1.5 text-[0.7rem] text-text-muted">
                <Loader2 size={12} className="animate-spin" /> Saving order...
              </span>
            )}
            {orderSaved && (
              <span className="flex items-center gap-1.5 text-[0.7rem] text-forest font-semibold">
                <CheckCircle2 size={13} /> Order saved
              </span>
            )}
            {!savingOrder && !orderSaved && (
              <span className="text-[0.65rem] text-text-muted/60 italic">Drag rows to reorder</span>
            )}
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-cream/50 font-medium text-text-dark border-b border-black/5">
              <tr>
                <th className="px-4 py-4 w-8 text-center">
                  <GripVertical size={14} className="mx-auto text-text-muted/40" />
                </th>
                <th className="px-6 py-4 w-12">Image</th>
                <th className="px-6 py-4">Brand & Name</th>
                <th className="px-6 py-4">Specs summary</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-forest" />
                      <span>Loading brands...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="text-4xl mb-3">🏅</div>
                    <div className="text-text-dark font-medium">
                      {activeBrandFilter === 'All' ? 'No Brands Found' : `No ${activeBrandFilter} items found`}
                    </div>
                    <div className="text-text-muted text-xs mt-1">
                      {activeBrandFilter === 'All'
                        ? 'Start by adding your first signature brand item.'
                        : 'Try switching to a different brand filter.'}
                    </div>
                  </td>
                </tr>
              ) : filteredBrands.map((row, index) => (
                <tr
                  key={row.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`border-b border-black/5 transition-all group select-none ${
                    draggingIndex === index
                      ? 'opacity-40 bg-cream/50'
                      : dragOverIndex === index && draggingIndex !== index
                      ? 'bg-forest/5 border-t-2 border-t-forest/30'
                      : 'hover:bg-cream/30'
                  }`}
                >
                  {/* Drag Handle */}
                  <td className="px-4 py-4 text-center cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} className="mx-auto text-text-muted/30 group-hover:text-text-muted/70 transition-colors" />
                  </td>

                  <td className="px-6 py-4">
                    {row.image_url ? (
                      <img src={row.image_url} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-cream flex items-center justify-center text-text-muted italic text-[0.6rem]">No Img</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-text-dark text-[0.95rem]">{row.name}</div>
                    <div className="text-[0.75rem] font-bold text-forest uppercase tracking-wider">{row.brand_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[0.75rem] text-text-muted line-clamp-2 max-w-xs">{row.origin} • {row.packaging} • MOQ: {row.moq}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {row.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(row)}
                        className="p-2 text-text-muted hover:text-forest hover:bg-forest/5 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 text-text-muted hover:text-terracotta hover:bg-terracotta/5 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BRAND TYPE MANAGER MODAL */}
      <CategoryManager
        tableName="brand_types"
        label="Brand"
        isOpen={isTypeManagerOpen}
        onClose={() => setIsTypeManagerOpen(false)}
        onUpdate={fetchBrandTypes}
      />

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest-darker/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-cream/30 shrink-0">
              <h2 className="font-display text-xl font-bold text-text-dark">
                {currentBrand?.id ? 'Edit Brand Item' : 'Add New Brand Item'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-white/50 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Item Name *</label>
                  <input
                    required
                    value={currentBrand.name}
                    onChange={(e) => setCurrentBrand({ ...currentBrand, name: e.target.value })}
                    placeholder="e.g. Black Stingless Bee Honey"
                    className="w-full p-3 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Brand Type</label>
                  <select
                    value={currentBrand.brand_type}
                    onChange={(e) => setCurrentBrand({ ...currentBrand, brand_type: e.target.value })}
                    className="w-full p-3 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                  >
                    {brandTypes.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                    {brandTypes.length === 0 && <option value="Other">Other</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Tagline</label>
                  <input
                    value={currentBrand.tagline}
                    onChange={(e) => setCurrentBrand({ ...currentBrand, tagline: e.target.value })}
                    placeholder="e.g. Nature's Rare Sweetness"
                    className="w-full p-3 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Badge Text (Optional)</label>
                  <input
                    value={currentBrand.badge}
                    onChange={(e) => setCurrentBrand({ ...currentBrand, badge: e.target.value })}
                    placeholder="e.g. Rare, Export Grade"
                    className="w-full p-3 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                  />
                </div>
              </div>

              <ImagePicker 
                label="Item Image"
                value={currentBrand.image_url}
                onChange={(url) => setCurrentBrand({ ...currentBrand, image_url: url })}
              />

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={3}
                  value={currentBrand.description}
                  onChange={(e) => setCurrentBrand({ ...currentBrand, description: e.target.value })}
                  className="w-full p-3 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">Origin</label>
                  <input value={currentBrand.origin} onChange={e => setCurrentBrand({ ...currentBrand, origin: e.target.value })} className="w-full p-2 bg-cream rounded-lg text-sm" placeholder="e.g. Kerala, India" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">Packaging</label>
                  <input value={currentBrand.packaging} onChange={e => setCurrentBrand({ ...currentBrand, packaging: e.target.value })} className="w-full p-2 bg-cream rounded-lg text-sm" placeholder="e.g. 1L Glass Bottle" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">MOQ</label>
                  <input value={currentBrand.moq} onChange={e => setCurrentBrand({ ...currentBrand, moq: e.target.value })} className="w-full p-2 bg-cream rounded-lg text-sm" placeholder="e.g. 50 units" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">Certification</label>
                  <input value={currentBrand.certification} onChange={e => setCurrentBrand({ ...currentBrand, certification: e.target.value })} className="w-full p-2 bg-cream rounded-lg text-sm" placeholder="e.g. Organic, FSSAI" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">Grade (Optional)</label>
                  <input value={currentBrand.grade} onChange={e => setCurrentBrand({ ...currentBrand, grade: e.target.value })} className="w-full p-2 bg-cream rounded-lg text-sm" placeholder="e.g. 8mm+ Bold Pods" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-text-muted uppercase tracking-wider mb-1">Theme Accent</label>
                  <select value={currentBrand.accent} onChange={e => setCurrentBrand({ ...currentBrand, accent: e.target.value })} className="w-full p-2 bg-cream rounded-lg text-sm">
                    <option value="forest">Forest</option>
                    <option value="emerald">Emerald</option>
                    <option value="amber">Amber</option>
                    <option value="terracotta">Terracotta</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 bg-cream/50 rounded-2xl border border-cream-dark">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentBrand.is_active}
                    onChange={(e) => setCurrentBrand({ ...currentBrand, is_active: e.target.checked })}
                    className="w-5 h-5 accent-forest rounded"
                  />
                  <span className="text-sm font-medium text-text-dark">Publicly Visible</span>
                </label>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-xs font-bold text-text-muted uppercase">Sort Order</span>
                  <input
                    type="number"
                    value={currentBrand.sort_order}
                    onChange={(e) => setCurrentBrand({ ...currentBrand, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-16 p-2 bg-white rounded-lg border border-cream-dark text-center text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                {currentBrand.id && (
                  <button 
                    type="button"
                    onClick={() => handleDelete(currentBrand.id)}
                    className="flex-1 bg-terracotta/10 text-terracotta py-4 rounded-2xl font-semibold hover:bg-terracotta hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} /> Delete Item
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className={`${currentBrand.id ? 'flex-[2]' : 'w-full'} bg-forest text-white py-4 rounded-2xl font-semibold shadow-xl shadow-forest/20 hover:bg-forest-deep transition-all flex items-center justify-center gap-2`}
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {currentBrand.id ? 'Save Changes' : 'Create Brand Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
