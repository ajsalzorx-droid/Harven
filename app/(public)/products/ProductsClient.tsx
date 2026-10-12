"use client";

import React, { useState } from 'react'
import { http, isHttpError } from '@/lib/http'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ArrowRight, CheckCircle2 } from 'lucide-react'



export function ProductsClient({ initialProducts, tabs }: { initialProducts: any[]; tabs: string[] }) {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  // Products are loaded from the database by the server page (page.tsx)
  const productsData = initialProducts

  const filteredProducts = activeTab === 'All' 
    ? productsData 
    : productsData.filter(p => p.category === activeTab)

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
        product_interest: selectedProduct?.name,
        source: 'product_modal'
      })

        setIsSubmitted(true)
        setTimeout(() => {
          setSelectedProduct(null)
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

  const inputClasses = "p-4 border border-cream-dark/60 rounded-xl bg-white focus:outline-forest focus:ring-1 focus:ring-forest transition-all placeholder:text-text-muted/50 text-text-dark"

  return (
    <div className="min-h-screen bg-cream-warm font-body">
      <section className="bg-forest-deep pt-40 pb-28 px-8 lg:px-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,112,75,0.15)_0%,transparent_60%)] pointer-events-none" />
        <h1 className="font-display text-5xl md:text-6xl text-white font-light tracking-tight mb-6 relative z-10">Premium Food <strong className="font-semibold italic text-wheat-light">Commodities.</strong></h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto font-light leading-relaxed relative z-10">Explore our extensive range of high-quality products sourced directly from trusted global farms, rigorously tested, and ready for global delivery.</p>
      </section>

      <div className="bg-white py-6 px-8 lg:px-16 border-b border-cream-dark flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-[80px] z-40">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-colors ${
              activeTab === tab 
                ? 'bg-forest text-white border border-forest shadow-md' 
                : 'bg-cream text-text-muted border border-transparent hover:border-cream-dark hover:text-forest-darker'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="bg-cream-warm py-20 px-8 lg:px-16 min-h-[50vh]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((p: any) => (
            <div key={p.id} className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-black/5 hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(45,90,61,0.08)] transition-all duration-500 group flex flex-col">
              <div className="w-full h-56 overflow-hidden relative">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover saturate-[0.8] transition-all duration-700 group-hover:scale-[1.08] group-hover:saturate-100" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 font-mono text-[0.55rem] uppercase tracking-widest text-forest rounded-full">
                  {p.category}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="font-display text-2xl font-semibold text-text-dark mb-3">{p.name}</h3>
                <p className="text-text-muted text-[0.85rem] font-light leading-relaxed mb-6 flex-1">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-8">
                  {p.tags.map((t: string) => (
                    <span key={t} className="font-mono text-[0.55rem] px-2.5 py-1 rounded bg-cream text-text-mid border border-cream-dark">
                      {t}
                    </span>
                  ))}
                </div>
                <Button variant="outline-dark" className="w-full justify-center group-hover:bg-forest group-hover:text-white" onClick={() => setSelectedProduct(p)}>
                  Inquire Now <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={`Inquire about ${selectedProduct?.name}`}>
        <div className="flex flex-col gap-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center text-forest">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-display text-2xl font-semibold text-text-dark">Inquiry Sent!</h3>
              <p className="text-text-muted">Thank you for your interest in {selectedProduct?.name}. Our team will contact you shortly.</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4 items-center bg-cream-warm p-4 rounded-xl border border-cream-dark">
                 <img src={selectedProduct?.img} alt="" className="w-16 h-16 rounded-lg object-cover" />
                 <div>
                   <div className="font-display text-lg font-semibold">{selectedProduct?.name}</div>
                   <div className="text-xs text-text-muted font-mono">{selectedProduct?.category}</div>
                 </div>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <p className="text-[0.85rem] text-text-muted font-light">Please fill out this quick form to request wholesale pricing, technical specifications, and shipping availability.</p>
                <div className="grid grid-cols-2 gap-5">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className={inputClasses} 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Company Name" 
                    className={inputClasses} 
                    required 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <input 
                    type="tel" 
                    placeholder="Phone / Mobile Number *" 
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
                <textarea 
                  placeholder="Additional Details (e.g. Origin preference, packing, delivery port)" 
                  rows={4} 
                  className={inputClasses + " resize-none"} 
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
                <Button 
                  variant="primary" 
                  className="mt-2" 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
                </Button>
              </form>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
