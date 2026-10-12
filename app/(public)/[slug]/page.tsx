"use client";

import React, { useState, useEffect } from 'react'
import { http } from '@/lib/http'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const { slug } = useParams()
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({ name: '', company: '', email: '', quantity: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      try {
        const { data } = await http.get(`/api/public/landing-pages/${encodeURIComponent(String(slug))}`)
        const item = data.item
        if (item) {
          setPageData(item)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchPage()
  }, [slug])

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await http.post('/api/inquiries', {
        ...formData,
        product_interest: pageData.title || pageData.hero_headline || 'Landing Page Inquiry',
        source: `landing_page_${slug}`
      });

      setSubmitStatus('success');
      setFormData({ name: '', company: '', email: '', quantity: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-forest bg-cream-warm"><Loader2 className="animate-spin" size={32} /></div>
  }

  if (!pageData) {
    return <div className="min-h-screen flex items-center justify-center font-display text-2xl text-forest bg-cream-warm">Page Not Found</div>
  }

  const renderBlock = (block: any, i: number) => {
    switch (block.type) {
      case 'text':
        return (
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.1}} key={i} className="prose prose-lg prose-forest text-text-dark font-light mb-12 max-w-none leading-relaxed tracking-wide" dangerouslySetInnerHTML={{ __html: block.content }} />
        )
      case 'specs_table':
        if (!block.rows || !Array.isArray(block.rows)) return null;
        return (
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.1}} key={i} className="mb-12 rounded-[24px] border border-cream-dark overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            {block.rows.map((row: any, idx: number) => (
              <div key={idx} className={`flex flex-col sm:flex-row border-b border-cream-dark last:border-b-0 p-5 ${idx % 2 === 0 ? 'bg-cream/30' : 'bg-white'}`}>
                <div className="w-full sm:w-1/3 font-mono text-[0.7rem] tracking-[0.15em] uppercase text-text-muted mb-1 sm:mb-0 pt-1">{row.key}</div>
                <div className="w-full sm:w-2/3 font-medium text-forest-darker">{row.value}</div>
              </div>
            ))}
          </motion.div>
        )
      case 'highlight_box':
        const bgColors: any = { sage: 'bg-[#F2F7F4] border-[#E2EFE7] text-forest-deep', terracotta: 'bg-[#FCF5F3] border-[#F7E6DF] text-terracotta' }
        const applyCol = bgColors[block.color] || bgColors.sage
        return (
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.1}} key={i} className={`flex items-start gap-5 p-8 rounded-[24px] border mb-12 shadow-sm ${applyCol}`}>
            <div className="text-3xl mt-[-2px]">{block.icon}</div>
            <div className="font-medium text-[1.1rem] leading-relaxed">{block.text}</div>
          </motion.div>
        )
      case 'bullet_list':
        if (!block.items || !Array.isArray(block.items)) return null;
        return (
          <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: 0.1}} key={i} className="mb-12 p-10 bg-cream/50 border border-black/5 rounded-[32px] shadow-sm">
            <h4 className="font-display text-2xl font-semibold text-forest-darker mb-6">{block.title}</h4>
            <ul className="list-none flex flex-col gap-4 p-0 m-0">
              {block.items.map((it: string, idx: number) => (
                <li key={idx} className="flex gap-4 items-start text-text-dark text-[1.05rem] font-light leading-relaxed">
                  <CheckCircle2 className="text-terracotta flex-shrink-0 mt-1" size={20} />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )
      case 'image':
        if (!block.url) return null;
        return (
          <motion.div initial={{opacity:0, scale:0.98}} whileInView={{opacity:1, scale:1}} viewport={{once:true}} transition={{delay: 0.1, duration: 0.6}} key={i} className="mb-12 w-full rounded-[32px] overflow-hidden border border-black/5 shadow-xl group">
             <img src={block.url} alt="Content block" className="w-full h-auto max-h-[700px] object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <section className="relative pt-40 pb-32 px-8 lg:px-16 min-h-[85vh] flex items-center bg-forest-darker text-white overflow-hidden">
        {pageData.hero_image_url && (
          <motion.div initial={{scale:1.05}} animate={{scale:1}} transition={{duration:10, ease:"easeOut"}} className="absolute inset-0 z-0">
            <img src={pageData.hero_image_url} alt="Hero background" className="w-full h-full object-cover opacity-40 saturate-[0.8]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F2A17]/95 via-[#0F2A17]/70 to-[#0F2A17]/30" />
          </motion.div>
        )}
        
        <div className="relative z-10 max-w-4xl">
          <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{duration:0.8}}>
            {pageData.hero_badge && (
              <div className="inline-flex items-center gap-3 font-mono text-[0.65rem] tracking-[0.2em] uppercase text-white/90 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                <span className="w-2 h-2 rounded-full bg-terracotta-light animate-pulse" />
                {pageData.hero_badge}
              </div>
            )}
            <h1 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] font-light text-white leading-[1.05] tracking-tight mb-8">
              {pageData.hero_headline}
            </h1>
            {pageData.hero_subtext && (
              <p className="text-white/70 text-xl font-light leading-relaxed mb-10 max-w-2xl">
                {pageData.hero_subtext}
              </p>
            )}
            {pageData.hero_cta_text && (
              <Button variant="primary" className="group text-lg px-8 py-6 rounded-full shadow-[0_8px_30px_rgba(196,112,75,0.3)] hover:shadow-[0_12px_45px_rgba(196,112,75,0.4)] transition-all" onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}>
                {pageData.hero_cta_text}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Button>
            )}
          </motion.div>
        </div>
        
        {/* Curving transition to the white content below */}
        <div className="absolute bottom-[-1px] left-0 right-0 z-10 h-[120px]">
          <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="w-full h-full block">
            <path d="M0,70 C360,130 720,10 1080,70 C1260,100 1380,40 1440,70 L1440,140 L0,140 Z" fill="#ffffff"/>
            <path d="M0,90 C240,50 600,110 900,70 C1100,45 1300,90 1440,80 L1440,140 L0,140 Z" fill="#ffffff" opacity="0.4"/>
          </svg>
        </div>
      </section>

      <section className="py-24 px-8 lg:px-16 bg-white w-full">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
          
          {/* Main Content Stream */}
          <div className="w-full lg:w-[55%]">
            <motion.div initial={{opacity:0, x:-20}} whileInView={{opacity:1, x:0}} viewport={{once:true}} className="mb-16">
              <h2 className="font-display text-4xl text-forest-darker mb-4">Product Details</h2>
              <div className="w-20 h-[3px] bg-terracotta rounded-full" />
            </motion.div>
            
            <div className="flex flex-col">
              {pageData.content_blocks?.map((b: any, i: number) => renderBlock(b, i))}
            </div>
          </div>
          
          {/* Sticky Inquiry Column */}
          <div className="w-full lg:w-[45%] relative">
            <div className="sticky top-40">
              {pageData.show_inquiry_form && (
                <motion.div initial={{opacity:0, y:30}} whileInView={{opacity:1, y:0}} viewport={{once:true}} id="inquiry-form" className="bg-[#FDFBF7] p-10 rounded-[32px] border border-black/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  
                  <h3 className="font-display text-3xl font-semibold text-forest-darker mb-2">Request Details</h3>
                  <p className="text-text-muted text-sm font-light mb-8">Enter your requirements below and our commercial team will contact you shortly.</p>
                  
                  <form className="flex flex-col gap-5 relative z-10" onSubmit={handleInquirySubmit}>
                    
                    {submitStatus === 'success' && (
                      <div className="bg-sage/20 border border-sage/40 text-forest p-4 rounded-xl text-sm font-medium flex items-center gap-2 mb-2">
                        <CheckCircle2 size={18} />
                        Your inquiry has been sent successfully.
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium mb-2">
                        Something went wrong. Please try again.
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] uppercase tracking-wider font-mono text-text-muted ml-2">Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="p-4 bg-white rounded-2xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage/20 focus:outline-none transition-all shadow-sm" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[0.65rem] uppercase tracking-wider font-mono text-text-muted ml-2">Company</label>
                        <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required className="p-4 bg-white rounded-2xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage/20 focus:outline-none transition-all shadow-sm" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.65rem] uppercase tracking-wider font-mono text-text-muted ml-2">Email Address</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="p-4 bg-white rounded-2xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage/20 focus:outline-none transition-all shadow-sm" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.65rem] uppercase tracking-wider font-mono text-text-muted ml-2">Estimated Volume / Needs</label>
                      <input type="text" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required placeholder="e.g. 500 Metric Tons / Q3 Delivery" className="p-4 bg-white rounded-2xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage/20 focus:outline-none transition-all shadow-sm placeholder:text-black/20" />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[0.65rem] uppercase tracking-wider font-mono text-text-muted ml-2">Additional Specifications</label>
                      <textarea rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="p-4 bg-white rounded-2xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage/20 focus:outline-none transition-all shadow-sm resize-none" />
                    </div>
                    
                    <Button variant="primary" className="w-full mt-4 py-5 text-lg rounded-2xl shadow-[0_8px_30px_rgba(196,112,75,0.25)] hover:shadow-[0_12px_40px_rgba(196,112,75,0.4)]" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin text-white inline mx-auto" size={24} /> : "Secure Bulk Pricing"}
                    </Button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Optional Chatbot Override Trigger */}
      {pageData.show_chatbot && (
        <motion.div initial={{opacity:0, scale:0}} animate={{opacity:1, scale:1}} transition={{delay: 1}} className="fixed bottom-6 right-6 z-[100]">
           {/* Placeholder for chatbot integration overlap - in real system ChatbotWidget handles itself globally */}
        </motion.div>
      )}
    </>
  )
}
