"use client";

import React, { useState, Suspense } from 'react'
import { http, isHttpError } from '@/lib/http'
import { Button } from '@/components/ui/Button'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function ContactForm({ productOptions }: { productOptions: string[] }) {
  const searchParams = useSearchParams()
  const requestedProduct = (searchParams.get('product') || '').trim().toLowerCase()
  // Match ?product= against the option names (case-insensitive), else "Other"
  const prefillProduct = requestedProduct
    ? productOptions.find(p => p.toLowerCase() === requestedProduct) || 'Other'
    : ''
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.target as HTMLFormElement)
    const payload = {
      name: formData.get('name'),
      company: formData.get('company'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      product_interest: formData.get('product_interest'),
      quantity: formData.get('quantity'),
      message: formData.get('message'),
      source: 'contact_form'
    }

    try {
      await http.post('/api/inquiries', payload)
      setSuccess(true)
    } catch (err) {
      setError(isHttpError(err) && err.response
        ? (err.response.data as { error?: string })?.error || 'Failed to submit inquiry'
        : 'Connection error. Please check your internet and try again.')
    }finally {
      setLoading(false)
    }
  }

  const inputClasses = "p-4 bg-white rounded-xl border border-cream-dark focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage text-text-dark transition-all"

  return (
    <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-black/5">
      <h3 className="font-display text-2xl text-text-dark font-semibold mb-8">Send an Inquiry</h3>
      {success ? (
        <div className="bg-sage/10 border border-sage p-8 rounded-2xl text-center">
          <div className="text-4xl mb-4">✅</div>
          <h4 className="font-display text-xl font-semibold text-forest mb-2">Inquiry Received</h4>
          <p className="text-text-muted font-light mb-6">Our trading team will review your request and get back to you shortly.</p>
          <a href="https://wa.me/971561625698" target="_blank" rel="noreferrer" className="inline-block bg-forest text-white px-6 py-3 rounded-full hover:bg-forest-deep transition-colors text-sm font-medium">Follow up on WhatsApp</a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <div className="bg-terracotta/10 text-terracotta text-sm p-4 rounded-xl">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input name="name" type="text" placeholder="Full Name *" required className={inputClasses} />
            <input name="company" type="text" placeholder="Company Name *" required className={inputClasses} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input name="email" type="email" placeholder="Email Address *" required className={inputClasses} />
            <input name="phone" type="tel" placeholder="Phone / WhatsApp *" required className={inputClasses} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <select 
              name="product_interest" 
              required 
              className={inputClasses} 
              defaultValue={prefillProduct}
            >
              <option value="" disabled>Product Interest *</option>
              {productOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            <input name="quantity" type="text" placeholder="Quantity Required *" required className={inputClasses} />
          </div>
          <textarea 
            name="message" 
            rows={5} 
            placeholder="Your Message *" 
            required 
            className={inputClasses + " resize-none"} 
            defaultValue={prefillProduct ? `Interested in ${prefillProduct}. Please provide wholesale details.` : ''}
          />
          <Button variant="primary" type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Sending...' : 'Submit Inquiry'}
          </Button>
        </form>
      )}
    </div>
  )
}

export function ContactClient({ productOptions }: { productOptions: string[] }) {
  return (
    <>
      <section className="bg-forest-deep pt-36 pb-24 px-8 lg:px-16 text-center text-white">
        <h1 className="font-display text-5xl md:text-6xl font-light tracking-tight">Let's Talk <strong className="font-semibold italic text-terracotta-light">Trade.</strong></h1>
      </section>

      <section className="bg-cream-warm py-24 px-8 lg:px-16 border-b border-cream-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="font-display text-3xl text-forest-darker mb-6">Get in Touch</h2>
              <p className="text-text-muted font-light leading-relaxed max-w-md">Our global trading team is ready to assist you with product inquiries, wholesale contract pricing, and logistics operations.</p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-cream-dark flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-forest" />
                </div>
                <div>
                  <div className="font-mono text-xs tracking-widest text-text-muted uppercase mb-1">Phone / WhatsApp</div>
                  <div className="flex flex-col gap-1 mt-2">
                    <a href="tel:+971561625698" className="text-forest-darker font-semibold text-lg hover:text-terracotta transition-colors">+971 56 162 5698</a>
                    <a href="tel:+971547226003" className="text-forest-darker font-semibold text-lg hover:text-terracotta transition-colors">+971 54 722 6003</a>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-cream-dark flex items-center justify-center shrink-0">
                  <Mail size={20} className="text-forest" />
                </div>
                <div>
                  <div className="font-mono text-xs tracking-widest text-text-muted uppercase mb-1">Email</div>
                  <a href="mailto:harvenllc@gmail.com" className="text-forest-darker font-semibold text-lg hover:text-terracotta transition-colors">harvenllc@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white border border-cream-dark flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-forest" />
                </div>
                <div>
                  <div className="font-mono text-xs tracking-widest text-text-muted uppercase mb-1">Headquarters</div>
                  <div className="text-forest-darker font-medium text-base">Dubai, United Arab Emirates</div>
                  <div className="text-text-muted text-sm mt-1">Operating Hours: Mon-Fri, 9am - 6pm</div>
                </div>
              </div>
            </div>

            <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-black/5 bg-gray-200">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d462560.3011317075!2d54.947285623098525!3d25.076381471377852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f43496ad9c645%3A0xbde66e5084295162!2sDubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sus!4v1714578160010!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <Suspense fallback={<div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl border border-black/5 animate-pulse h-[600px]" />}>
            <ContactForm productOptions={productOptions} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
