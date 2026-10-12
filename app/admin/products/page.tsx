"use client";

import React, { useState, useEffect, useRef } from 'react'
import { adminFetch } from '@/lib/admin/api-client'
import { X, Plus, Edit2, Trash2, Loader2, Save, Settings, GripVertical, CheckCircle2 } from 'lucide-react'
import { CategoryManager } from '@/components/admin/CategoryManager'
import { ImagePicker } from '@/components/admin/ImagePicker'

export default function ProductsCMS() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderSaved, setOrderSaved] = useState(false)

  // Drag state (native HTML drag API - same pattern as brands page)
  const dragIndexRef = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { items } = await adminFetch<{ items: any[] }>('/api/admin/products')
      if (items) setProducts(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { items } = await adminFetch<{ items: any[] }>('/api/admin/data/product_categories')
      if (items) setCategories(items)
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenModal = (product: any = null) => {
    setCurrentProduct(product || { 
      name: '', 
      category: categories.length > 0 ? categories[0].name : 'Spices', 
      image_url: '', 
      description: '', 
      tags: [], 
      is_active: true, 
      sort_order: products.length + 1 
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (currentProduct.id) {
        await adminFetch(`/api/admin/products/${currentProduct.id}`, {
          method: 'PATCH',
          body: JSON.stringify(currentProduct),
        })
      } else {
        await adminFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(currentProduct),
        })
      }
      setIsModalOpen(false)
      fetchProducts()
    } catch (error: any) {
      console.error('Save error:', error)
      alert(`Failed to save product. ${error?.message || ''}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
       await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE' })
       setIsModalOpen(false)
       fetchProducts()
    } catch (err: any) {
       console.error(err)
       alert(`Failed to delete product. ${err?.message || ''}`)
    }
  }

  // ─── NATIVE DRAG AND DROP ──────────────────────────────────────────────
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

    const newProducts = [...products]
    const [moved] = newProducts.splice(dragIdx, 1)
    newProducts.splice(dropIndex, 0, moved)

    const reordered = newProducts.map((p, i) => ({ ...p, sort_order: i + 1 }))
    setProducts(reordered)
    handleDragEnd()

    // Persist via the admin API
    setSavingOrder(true)
    try {
      await adminFetch('/api/admin/products/reorder', {
        method: 'PATCH',
        body: JSON.stringify({ items: reordered.map(p => ({ id: p.id, sort_order: p.sort_order })) }),
      })
      setOrderSaved(true)
      setTimeout(() => setOrderSaved(false), 2500)
    } catch (err) {
      console.error('Order save error:', err)
      alert('Failed to save order. Please try again.')
      fetchProducts()
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-dark">Products Manager</h1>
          <p className="text-text-muted mt-2">Manage the commodity stock and brands displayed on the website.</p>
        </div>
        <div className="flex items-center gap-4">
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
          <div className="flex gap-2">
            <button 
              onClick={() => setIsCatManagerOpen(true)}
              className="bg-white text-text-muted px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-dark hover:bg-cream transition-all flex items-center gap-2"
            >
              <Settings size={18} /> Categories
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-forest text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-deep transition-all shadow-lg shadow-forest/10 flex items-center gap-2"
            >
              <Plus size={18} /> Add New Product
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-muted">
            <thead className="bg-cream/50 font-medium text-text-dark border-b border-black/5">
              <tr>
                <th className="px-4 py-4 w-8 text-center">
                  <GripVertical size={14} className="mx-auto text-text-muted/40" />
                </th>
                <th className="px-6 py-4 w-12">Preview</th>
                <th className="px-6 py-4">Name & Description</th>
                <th className="px-6 py-4">Category</th>
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
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <div className="text-text-dark font-medium">No Products Found</div>
                    <div className="text-text-muted text-xs mt-1">Start by adding your first commodity or signature brand.</div>
                  </td>
                </tr>
              ) : products.map((row, index) => (
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
                    <div className="text-[0.75rem] text-text-muted line-clamp-1 max-w-xs">{row.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-cream-warm border border-cream-dark rounded-full text-[0.7rem] text-text-mid font-medium">
                      {row.category}
                    </span>
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

      {/* CATEGORY MANAGER MODAL */}
      <CategoryManager 
        tableName="product_categories" 
        label="Category" 
        isOpen={isCatManagerOpen} 
        onClose={() => setIsCatManagerOpen(false)}
        onUpdate={fetchCategories}
      />

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest-darker/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-cream/30">
              <h2 className="font-display text-xl font-bold text-text-dark">
                {currentProduct?.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-white/50 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Product Name *</label>
                  <input 
                    required
                    value={currentProduct.name}
                    onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})}
                    placeholder="e.g. Kerala Green Cardamom"
                    className="w-full p-4 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={currentProduct.category}
                    onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})}
                    className="w-full p-4 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {categories.length === 0 && <option value="Other">Other</option>}
                  </select>
                </div>
              </div>

              <ImagePicker 
                label="Product Image"
                value={currentProduct.image_url}
                onChange={(url) => setCurrentProduct({...currentProduct, image_url: url})}
              />

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  rows={4}
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})}
                  placeholder="Tell buyers why this commodity is premium..."
                  className="w-full p-4 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.9rem]"
                />
              </div>

              <div className="flex items-center gap-6 p-4 bg-cream/50 rounded-2xl border border-cream-dark">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={currentProduct.is_active}
                    onChange={(e) => setCurrentProduct({...currentProduct, is_active: e.target.checked})}
                    className="w-5 h-5 accent-forest rounded"
                  />
                  <span className="text-sm font-medium text-text-dark">Publicly Visible</span>
                </label>
                
                <div className="flex items-center gap-3 ml-auto">
                    <span className="text-xs font-bold text-text-muted uppercase">Sort Order</span>
                    <input 
                      type="number"
                      value={currentProduct.sort_order}
                      onChange={(e) => setCurrentProduct({...currentProduct, sort_order: parseInt(e.target.value) || 0})}
                      className="w-20 p-2 bg-white rounded-lg border border-cream-dark text-center text-sm"
                    />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {currentProduct.id && (
                  <button 
                    type="button"
                    onClick={() => handleDelete(currentProduct.id)}
                    className="flex-1 bg-terracotta/10 text-terracotta py-4 rounded-2xl font-semibold hover:bg-terracotta hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} /> Delete Product
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={saving}
                  className={`${currentProduct.id ? 'flex-[2]' : 'w-full'} bg-forest text-white py-4 rounded-2xl font-semibold shadow-xl shadow-forest/20 hover:bg-forest-deep transition-all flex items-center justify-center gap-2`}
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {currentProduct.id ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
