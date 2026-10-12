import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <section className="bg-forest-deep pt-40 pb-28 px-8 lg:px-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(139,175,124,0.08)_0%,transparent_50%))] pointer-events-none" />
        <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase text-sage font-bold mb-[1.2rem] inline-block relative pl-[2rem] before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-[1.2rem] before:h-[1.5px] before:bg-sage before:rounded-sm">
          Our Promise
        </span>
        <h1 className="font-display text-5xl md:text-6xl text-white font-light tracking-tight mt-4 relative z-10">Quality Sustained,<br /><strong className="font-semibold italic text-wheat-light">Trust Delivered.</strong></h1>
      </section>

      <section className="bg-white py-28 px-8 lg:px-16 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
             <div>
               <h2 className="font-display text-3xl md:text-4xl text-forest-darker mb-6 leading-tight">What We Stand For</h2>
               <div className="font-display text-[1.4rem] font-normal italic text-forest leading-[1.6] border-l-[3px] border-terracotta pl-[1.5rem] mb-6">
                 "A supply chain is only as strong as its integrity. At Harven, we guarantee ours from farm to port."
               </div>
               <p className="text-text-muted text-[0.9rem] leading-[1.8] font-light">
                 HARVEN LLC was established in Dubai, taking advantage of the UAE's strategic position as a global crossroads for international trade. We recognize that food is not merely a commodity—it is the lifeline of communities, economies, and global markets. Our strict adherence to quality assurance means we vet every single supplier, guaranteeing that the agricultural products we deliver exceed international standards.
               </p>
             </div>
             <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] shadow-[inset_0_0_80px_rgba(0,0,0,0.1)]">
               <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80" alt="Harven Storage" className="w-full h-full object-cover saturate-[0.85]" />
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.2))]" />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { title: "Quality First", desc: "Rigorous ISO-standard testing applied to every single shipment." },
              { title: "Reliability", desc: "Consistent, unbreakable supply chains you can depend on year-round." },
              { title: "Maximum Scale", desc: "Fully equipped to handle FCL bulk orders with maximum logistical efficiency." },
            ].map(item => (
              <div key={item.title} className="bg-cream-warm p-10 rounded-[20px] border border-cream-dark transition-all duration-400 hover:border-sage-light hover:-translate-y-2 hover:bg-white hover:shadow-[0_12px_40px_rgba(45,90,61,0.06)] group">
                <div className="w-[8px] h-[8px] rounded-full bg-sage mb-6 group-hover:scale-150 transition-all" />
                <h3 className="font-display text-[1.25rem] font-semibold text-text-dark mb-3">{item.title}</h3>
                <p className="text-text-muted text-[0.85rem] font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS SECTON duplicated exactly for context as requested */}
      <section id="process" className="bg-cream py-28 px-8 lg:px-16 overflow-hidden w-full border-y border-cream-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-tag">Logistics Infrastructure</span>
            <h2 className="section-title">The Operations <strong>Pipeline</strong></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
               { img: "/images/process-source.png", title: "Global Sourcing", step: "01", desc: "We identify premium origins and negotiate farm-direct volume allocations." },
               { img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80", title: "Quality Sorting", step: "02", desc: "Stringent pre-shipment laboratory inspections, sorting, and grading." },
               { img: "/images/process-trade.png", title: "Trade & Contracting", step: "03", desc: "Transparent, secure contracting via our Dubai headquarters." },
               { img: "/images/process-deliver.png", title: "Freight & Delivery", step: "04", desc: "End-to-end logistics handling ensuring port-to-port accuracy." }
            ].map(item => (
              <div key={item.step} className="text-center p-4 group">
                <div className="w-[110px] h-[110px] rounded-full overflow-hidden mx-auto mb-6 border-[3px] border-cream-dark bg-white transition-all duration-400 group-hover:border-sage group-hover:scale-[1.06] group-hover:shadow-[0_8px_30px_rgba(45,90,61,0.1)] pt-[2px] pr-[1px]">
                  <img src={item.img} alt="" className="w-full h-full object-cover saturate-[0.8] transition-all duration-400 group-hover:saturate-100" />
                </div>
                <div className="font-mono text-[0.6rem] font-bold text-terracotta mb-3 tracking-[0.1em]">{item.step}</div>
                <h4 className="font-display text-[1.15rem] font-semibold text-text-dark mb-2">{item.title}</h4>
                <p className="text-[0.8rem] text-text-muted leading-[1.7] font-light max-w-[250px] mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-forest-deep text-center py-36 px-8 lg:px-16 w-full relative overflow-hidden flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')] bg-cover bg-center opacity-10 pointer-events-none" />
        <h2 className="font-display text-[clamp(1.8rem,3vw,3rem)] font-light text-white leading-[1.3] max-w-[800px] mx-auto mb-10 z-10 relative">
          Ready to experience the standard of <strong className="font-semibold italic text-wheat">Harven Trade</strong>?
        </h2>
        <Link href="/contact" className="relative z-10 bg-terracotta text-white px-[2.8rem] py-[1.1rem] rounded-full font-semibold text-[0.9rem] shadow-[0_4px_20px_rgba(0,0,0,0.15)] inline-flex items-center gap-2 transition-all hover:bg-[#b5603e] hover:-translate-y-[2px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
          Contact The Trading Desk <ArrowRight size={16} />
        </Link>
      </section>
    </>
  )
}
