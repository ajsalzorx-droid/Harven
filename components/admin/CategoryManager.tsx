
"use client";

import React, { useState, useEffect } from 'react'
import { adminFetch } from '@/lib/admin/api-client'
import { X, Plus, Trash2, Loader2, Save } from 'lucide-react'

interface CategoryManagerProps {
  tableName: 'product_categories' | 'brand_types'
  label: string
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function CategoryManager({ tableName, label, isOpen, onClose, onUpdate }: CategoryManagerProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) fetchItems()
  }, [isOpen])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const { items } = await adminFetch<{ items: any[] }>(`/api/admin/data/${tableName}`)
      if (items) setItems(items)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setSaving(true)
    try {
      await adminFetch(`/api/admin/categories?table=${tableName}`, {
        method: 'POST',
        body: JSON.stringify({ name: newItem.trim() }),
      })
      setNewItem('')
      fetchItems()
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error(err)
      alert("Failed to add. It might already exist or you don't have permission.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${label.toLowerCase()}? Products using it might show as 'Other'.`)) return
    try {
      await adminFetch(`/api/admin/categories/${id}?table=${tableName}`, { method: 'DELETE' })
      fetchItems()
      if (onUpdate) onUpdate()
    } catch (err) {
      console.error(err)
    }
  }

  if (!isOpen) return null

  const getPluralLabel = (lbl: string) => {
    if (lbl.toLowerCase() === 'category') return 'Categories'
    return lbl + 's'
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-cream/30">
          <h2 className="font-display text-lg font-bold text-text-dark">Manage {getPluralLabel(label)}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-white/50 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input 
              required
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`New ${label} name...`}
              className="flex-1 p-3 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none text-[0.85rem]"
            />
            <button 
              disabled={saving}
              className="bg-forest text-white px-4 rounded-xl hover:bg-forest-deep transition-all flex items-center justify-center min-w-[44px]"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            </button>
          </form>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="py-10 text-center text-text-muted flex flex-col items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-xs">Loading...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-text-muted italic text-xs">No {getPluralLabel(label).toLowerCase()} defined yet.</div>
            ) : items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-cream/30 rounded-xl group hover:bg-cream/50 transition-colors">
                <span className="text-[0.9rem] text-text-dark">{item.name}</span>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-text-muted hover:text-terracotta opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
