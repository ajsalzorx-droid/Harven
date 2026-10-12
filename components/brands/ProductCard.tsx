"use client";

import React, { useState } from 'react'
import { http, isHttpError } from '@/lib/http'
import { MapPin, Shield, Package, CheckCircle2, Clock, Thermometer, Droplets, ArrowRight, X } from 'lucide-react'
import { Product } from '@/config/brands.config'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    quantity: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await http.post('/api/inquiries', {
        ...formData,
        product_interest: product.name,
        source: 'signature_brand'
      })

        setIsSubmitted(true)
        setTimeout(() => {
          setShowModal(false)
          setIsSubmitted(false)
          setFormData({ name: '', company: '', email: '', phone: '', quantity: '', message: '' })
        }, 2000)
    } catch (err) {
      console.error(err)
      // Server answered with an error vs. network failure
      alert(isHttpError(err) && err.response ? "Failed to send inquiry. Please try again." : "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSpecIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'origin': return <MapPin size={12} />
      case 'grade': return <Shield size={12} />
      case 'packaging': return <Package size={12} />
      case 'certificate': return <CheckCircle2 size={12} />
      case 'shelflife': return <Clock size={12} />
      case 'storage': return <Thermometer size={12} />
      case 'acidity': return <Droplets size={12} />
      default: return <CheckCircle2 size={12} />
    }
  }

  const inputClasses = "p-4 border border-cream-dark/60 rounded-xl bg-white focus:outline-forest focus:ring-1 focus:ring-forest transition-all placeholder:text-text-muted/50 text-text-dark"

  return (
    <>
      <div className="bg-white border border-cream-dark rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-[0_24px_80px_rgba(45,90,61,0.08)] hover:-translate-y-2 group flex flex-col">
        <div className="aspect-[4/3] overflow-hidden relative">
          <img 
            src={product.image || '/placeholder.jpg'} 
            alt={product.name} 
            className="w-full h-full object-cover saturate-[0.8] group-hover:saturate-100 transition-all duration-700 group-hover:scale-105" 
          />
          {product.badge && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-text-dark shadow-sm">
              {product.badge}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="p-8 flex-grow flex flex-col">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-semibold text-text-dark mb-2">{product.name}</h3>
            <p className={`text-sm font-medium italic mb-4 ${
              product.accent === 'amber' ? 'text-amber-700' : 
              product.accent === 'emerald' ? 'text-emerald-700' : 
              product.accent === 'terracotta' ? 'text-terracotta' :
              'text-forest'
            }`}>{product.tagline}</p>
            <p className="text-text-muted text-[0.85rem] leading-relaxed line-clamp-2">{product.description}</p>
          </div>

          {/* Specs Table */}
          <div className="space-y-3 mb-8 pt-6 border-t border-cream-dark/50">
            {Object.entries(product.specs).map(([key, value]) => {
              if (!value) return null
              return (
                <div key={key} className="flex justify-between items-center text-[0.7rem] uppercase tracking-wider font-mono">
                  <span className="text-text-muted flex items-center gap-1.5">
                    {getSpecIcon(key)} {key}
                  </span>
                  <span className="text-text-dark font-semibold text-right max-w-[150px]">{value}</span>
                </div>
              )
            })}
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className={`mt-auto w-full py-4 rounded-full text-center text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${
              product.accent === 'amber' ? 'bg-amber-600/10 text-amber-900 hover:bg-amber-600 hover:text-white' : 
              product.accent === 'emerald' ? 'bg-emerald-600/10 text-emerald-900 hover:bg-emerald-600 hover:text-white' : 
              product.accent === 'terracotta' ? 'bg-terracotta/10 text-terracotta hover:bg-terracotta hover:text-white' :
              'bg-forest/10 text-forest hover:bg-forest hover:text-white'
            }`}
          >
            {product.ctaText}
          </button>
        </div>
      </div>

      {/* INQUIRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest-darker/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-cream/30">
              <h2 className="font-display text-xl font-bold text-text-dark">
                Inquire about {product.name}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-white/50 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[75vh] overflow-y-auto">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center text-forest">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-text-dark">Inquiry Sent!</h3>
                  <p className="text-text-muted">Thank you for your interest in {product.name}. Our team will contact you shortly.</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 items-center bg-cream-warm p-4 rounded-xl border border-cream-dark mb-6">
                     {product.image && <img src={product.image} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                     <div>
                       <div className="font-display text-lg font-semibold">{product.name}</div>
                       <div className="text-xs text-text-muted font-mono">{product.tagline}</div>
                     </div>
                  </div>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <p className="text-[0.85rem] text-text-muted font-light">Fill out this form to request wholesale pricing, specs, and availability.</p>
                    <div className="grid grid-cols-2 gap-5">
                      <input 
                        type="text" 
                        placeholder="Your Name *" 
                        className={inputClasses} 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Company Name *" 
                        className={inputClasses} 
                        required 
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <input 
                        type="tel" 
                        placeholder="Phone / Mobile *" 
                        className={inputClasses} 
                        required 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Quantity Required *" 
                        className={inputClasses} 
                        required 
                        value={formData.quantity}
                        onChange={e => setFormData({...formData, quantity: e.target.value})}
                      />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className={inputClasses} 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                    <textarea 
                      placeholder="Additional details (origin preference, packing, delivery port)" 
                      rows={3} 
                      className={inputClasses + " resize-none"} 
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-forest text-white py-4 rounded-2xl font-semibold shadow-xl shadow-forest/20 hover:bg-forest-deep transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                      {!isSubmitting && <ArrowRight size={16} />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
