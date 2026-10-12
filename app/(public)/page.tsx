import React from 'react'
import { HeroSlider } from '@/components/home/HeroSlider'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { getActiveProducts, getActiveSignatureBrands, getActiveSlides } from '@/lib/db/queries'

export const revalidate = 60 // Enable ISR to prevent 503 errors on Hostinger

export default async function HomePage() {
  let stockItems = null;
  let signatureBrands = null;
  let slides: any[] = [];
  
  try {
    // Fetch both collections in parallel
    const [products, brands, dbSlides] = await Promise.all([
      getActiveProducts(3),
      getActiveSignatureBrands(3),
      getActiveSlides()
    ]);
    slides = dbSlides;
    
    stockItems = products;
    signatureBrands = brands;
  } catch (err) {
    console.error('Home Page Data Fetch Error:', err)
  }
  
  // Use fallback data if DB fails or is empty
  const displayStock = (stockItems && stockItems.length > 0) ? stockItems : [
    { name: 'Black Pepper', category: 'Spices', description: 'Origin: Vietnam | Grade: 500g/l FAQ', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80', is_active: true },
    { name: 'White Rice', category: 'Grains', description: 'Origin: Thailand | Grade: 5% Broken', image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80', is_active: true },
    { name: 'Almonds', category: 'Nuts', description: 'Origin: USA / California | Grade: Nonpareil 27/30', image_url: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&q=80', is_active: true }
  ]

  return (
    <>
      <HeroSlider initialSlides={slides} />
      
      {/* TRUST BAR */}
      <div className="bg-white px-4 sm:px-6 lg:px-16 py-8 sm:py-10 lg:py-14 flex flex-nowrap overflow-x-auto sm:flex-wrap items-center justify-start sm:justify-center gap-6 sm:gap-10 lg:gap-16 border-b border-cream-dark relative z-10 w-full no-scrollbar">
        {[
          { text: "15+ Countries", sub: "Global Sourcing", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&q=60" },
          { text: "100+ Products", sub: "Premium Commodities", img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100&q=60" },
          { text: "B2B Trading", sub: "Bulk & Contract Supply", img: "/images/b2b-trading.png" },
          { text: "UAE Hub", sub: "Global Crossroads", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&q=60" }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center overflow-hidden shrink-0">
              <img src={item.img} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="font-mono text-[0.6rem] tracking-[0.08em] uppercase text-text-muted">
              <strong className="block font-body text-[0.82rem] text-text-dark tracking-normal normal-case font-medium mb-0.5 whitespace-nowrap">{item.text}</strong>
              <span className="hidden sm:inline">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* OUR PROMISE PREVIEW */}
      <section id="promise" className="bg-white py-16 lg:py-28 px-6 lg:px-16 relative w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
          <div className="rounded-[24px] overflow-hidden relative aspect-square sm:aspect-[5/4] shadow-[inset_0_0_80px_rgba(0,0,0,0.1)] order-2 lg:order-1">
            <img src="/images/about-harvesting.png" alt="Farm workers" className="w-full h-full object-cover saturate-[0.85]" />
            <div className="absolute inset-0 rounded-[24px] shadow-[inset_0_0_80px_rgba(0,0,0,0.1)] pointer-events-none" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="section-title">At HARVEN, we believe food is more than <strong>a commodity.</strong></h2>
            <p className="section-sub mb-8">Born in the UAE — a global crossroads of trade — HARVEN exists to connect the world's finest producers with markets that demand quality, reliability, and scale.</p>
            <div className="font-display text-[1.1rem] lg:text-[1.3rem] font-normal italic text-forest leading-[1.6] border-l-[3px] border-terracotta pl-[1.5rem] my-[2rem]">
              "To identify exceptional food commodities and bring them to global markets with precision, transparency, and confidence."
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 lg:mt-10">
               {[
                 "Quality without compromise", 
                 "Reliable sourcing", 
                 "Timely logistics", 
                 "Ethical trade practices", 
                 "Transparent partnerships", 
                 "Long-term relationships"
               ].map(val => (
                 <div key={val} className="flex items-center gap-[0.6rem] px-[1rem] py-[0.8rem] rounded-[12px] bg-cream border border-cream-dark transition-all hover:border-sage-light hover:bg-white hover:-translate-y-[2px]">
                   <div className="w-[6px] h-[6px] rounded-full bg-sage shrink-0" />
                   <span className="text-[0.78rem] text-text-mid font-normal">{val}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* SIGNATURE BRANDS SECTION */}
      <section className="bg-cream-warm py-16 lg:py-28 px-6 lg:px-16 w-full overflow-hidden border-t border-cream-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <span className="section-tag bg-forest/10 text-forest border-forest/20">Our Signature Brands</span>
            <h2 className="section-title">Heritage <strong>& Purity</strong></h2>
            <p className="section-sub mx-auto">Discover exclusive products from our in-house brands, KeraZone and Fióri.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(signatureBrands && signatureBrands.length > 0 ? signatureBrands.map((row: any) => ({
                brand: row.brand_type || "Brand",
                title: row.name,
                desc: row.description,
                img: row.image_url || "/placeholder.jpg",
                tag: row.badge || "Featured",
                accent: row.accent || "forest",
                fit: "cover"
            })) : [
              { 
                brand: "KeraZone", 
                title: "Black Stingless Bee Honey", 
                desc: "Rare, medicinal honey sourced from the untouched forests of Kerala.", 
                img: "/brands/kerazone/honey.jpg",
                tag: "Nature's Gold",
                accent: "amber",
                fit: "contain"
              },
              { 
                brand: "KeraZone", 
                title: "Kerala Green Cardamom", 
                desc: "Premium Alleppey Green Cardamom, hand-picked for bold aroma and flavor.", 
                img: "/brands/kerazone/cardamom.jpg",
                tag: "Export Grade",
                accent: "emerald",
                fit: "cover"
              },
              { 
                brand: "Fióri", 
                title: "Mangozy Alphonso Pulp", 
                desc: "100% pure Alphonso Mango pulp. Sterile, aseptic packaging for industrial use.", 
                img: "/brands/fiori/mangozy.jpg",
                tag: "Pure Fruit",
                accent: "terracotta",
                fit: "contain"
              }
            ]).map((prod, idx) => (
              <div key={idx} className="group bg-white rounded-[32px] overflow-hidden border border-cream-dark transition-all duration-500 hover:shadow-[0_24px_80px_rgba(45,90,61,0.08)] hover:-translate-y-2 flex flex-col">
                <div className={`aspect-[4/3] overflow-hidden relative ${prod.fit === 'contain' ? 'bg-[#F2EADA]' : ''}`}>
                  <img 
                    src={prod.img} 
                    alt={prod.title} 
                    className={`w-full h-full saturate-[0.8] group-hover:saturate-100 transition-all duration-700 group-hover:scale-105 ${
                      prod.fit === 'contain' ? 'object-contain p-4' : 'object-cover'
                    }`} 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest text-text-dark shadow-sm">
                    {prod.brand}
                  </div>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                   <div className={`text-[0.65rem] font-bold uppercase tracking-[0.15em] mb-2 ${
                     prod.accent === 'amber' ? 'text-amber-600' : 
                     prod.accent === 'emerald' ? 'text-emerald-600' : 
                     'text-terracotta'
                   }`}>
                     {prod.tag}
                   </div>
                   <h3 className="font-display text-2xl font-semibold text-text-dark mb-3 leading-tight">{prod.title}</h3>
                   <p className="text-text-muted text-[0.85rem] leading-relaxed mb-6 flex-grow">{prod.desc}</p>
                   <Link href="/signature-brands" className="inline-flex items-center gap-2 text-forest text-sm font-semibold group/link">
                     Product Details <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                   </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 lg:mt-16">
            <Link href="/signature-brands" className="inline-flex items-center gap-3 bg-forest text-white px-10 py-4 rounded-full font-semibold text-[0.9rem] transition-all hover:bg-forest-deep hover:-translate-y-1 shadow-xl shadow-forest/10 group">
              View All Signature Brands <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* EXPERTISE SECTION */}
      <section className="bg-forest-deep relative overflow-hidden py-16 lg:py-28 px-6 lg:px-16 w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_40%,rgba(139,175,124,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_85%_70%,rgba(196,112,75,0.06)_0%,transparent_40%)] pointer-events-none" />
        <div className="text-center mb-12 lg:mb-16 relative z-10 max-w-3xl mx-auto">
          <span className="section-tag !text-sage before:!bg-sage">The Harven Advantage</span>
          <h2 className="section-title !text-white">Why Trade With Us</h2>
          <p className="section-sub !text-white/45 mx-auto">Our global network ensures that your supply chain never breaks. We offer unmatched scale with local expertise.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 max-w-6xl mx-auto">
          {[
            { num: "01", title: "Direct Farm Partnerships", desc: "We bypass unnecessary intermediaries to bring you closer to the source." },
            { num: "02", title: "Rigorous Quality Control", desc: "Every shipment is heavily inspected by third-party certifiers before dispatch." },
            { num: "03", title: "Global Logistics Hub", desc: "Operating from Dubai gives us unparalleled leverage in global shipping routes." },
          ].map(item => (
            <div key={item.num} className="bg-white/5 border border-white/5 rounded-[20px] p-8 lg:p-10 text-center transition-all duration-500 hover:bg-white/10 hover:border-white/10 hover:-translate-y-[6px] relative overflow-hidden group">
               <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,175,124,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="font-display text-[2.5rem] font-light text-terracotta leading-none mb-4 opacity-60 relative z-10">{item.num}</div>
               <h3 className="font-display text-[1.3rem] font-medium text-white mb-3 relative z-10">{item.title}</h3>
               <p className="text-[0.82rem] text-white/45 leading-[1.7] font-light relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STOCK PREVIEW - DYNAMICALLY CONNECTED */}
      <section id="stock" className="bg-cream py-16 lg:py-28 px-6 lg:px-16 overflow-hidden w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-10 lg:mb-14">
            <div>
              <span className="section-tag">Live Inventory</span>
              <h2 className="section-title">Stock <strong>Board</strong></h2>
              <p className="section-sub text-left m-0 mt-2">Current availability at our distribution hubs.</p>
            </div>
            <div className="flex items-center gap-[0.6rem] bg-forest/5 border border-forest/10 px-[1.1rem] py-[0.5rem] rounded-full self-start sm:self-auto">
               <div className="w-[7px] h-[7px] rounded-full bg-sage animate-[pulse_1.5s_ease-in-out_infinite] shadow-[0_0_10px_rgba(139,175,124,0.3)]" />
               <span className="font-mono text-[0.58rem] text-forest tracking-[0.08em] uppercase">Trading Now</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStock.map(stock => (
               <div key={stock.name} className="bg-white border border-black/5 rounded-[20px] overflow-hidden transition-all duration-500 hover:-translate-y-[4px] hover:shadow-[0_16px_50px_rgba(45,90,61,0.07)] group">
                 <div className="w-full h-[180px] overflow-hidden relative">
                    <img src={stock.image_url || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80'} alt="" className="w-full h-full object-cover saturate-[0.8] transition-all duration-700 group-hover:scale-110 group-hover:saturate-100" />
                    <Badge variant="available" className="absolute top-4 left-4">Available Now</Badge>
                 </div>
                 <div className="p-5 lg:p-6 lg:pt-5">
                    <div className="font-mono text-[0.52rem] tracking-[0.15em] uppercase text-text-muted mb-2">{stock.category}</div>
                    <h3 className="font-display text-[1.3rem] lg:text-[1.4rem] font-semibold text-text-dark mb-1">{stock.name}</h3>
                    <p className="text-[0.75rem] text-text-muted mb-5 font-light line-clamp-2 min-h-[2.5rem]">{stock.description}</p>
                    
                    <Link href={`/contact?product=${encodeURIComponent(stock.name)}`} className="block mt-[1.4rem] text-center w-full rounded-full py-2.5 lg:py-3 text-[0.76rem] tracking-[0.03em] font-medium transition-all hover:-translate-y-[1px] bg-forest text-white hover:bg-forest-deep">
                      Request Quote
                    </Link>
                 </div>
               </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="inline-flex items-center gap-2 text-forest-mid hover:text-forest transition-colors font-medium text-sm">
              See full stock catalog <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* COMMITMENTS */}
      <section className="bg-cream-warm relative overflow-hidden py-16 lg:py-24 px-6 lg:px-16 w-full">
        <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(139,175,124,0.06)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto z-10 relative">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
            {[
              { img: "/images/global-reach.png", title: "Global Reach", desc: "Bridging the gap between continents." },
              { img: "/images/certified-supply.png", title: "Certified Supply", desc: "ISO and HACCP certified partners." },
              { img: "/images/freshness.png", title: "Freshness", desc: "Harvest-to-port speed optimization." },
              { img: "/images/traceability.png", title: "Traceability", desc: "Tracking from farm to warehouse." },
              { img: "/images/bulk-contracts.png", title: "Bulk Contracts", desc: "Securing volume discounts." }
            ].map((cmt, i) => (
              <div key={cmt.title} className={`bg-white border border-black/5 rounded-[18px] p-6 lg:p-8 text-center transition-all duration-400 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(45,90,61,0.06)] hover:border-sage-light group ${i === 4 ? 'col-span-2 lg:col-span-1 border-t-2 lg:border-t-[1px]' : ''}`}>
                 <div className="w-[60px] h-[60px] lg:w-[70px] lg:h-[70px] rounded-full overflow-hidden mx-auto mb-4 lg:mb-5 border-2 border-cream-dark transition-all duration-300 group-hover:border-sage group-hover:scale-105">
                   <img src={cmt.img} alt="" className="w-full h-full object-cover saturate-[0.8]" />
                 </div>
                 <h4 className="font-display text-[0.95rem] lg:text-[1rem] font-semibold text-text-dark mb-2">{cmt.title}</h4>
                 <p className="text-[0.7rem] lg:text-[0.75rem] text-text-muted leading-[1.65] font-light">{cmt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="bg-white py-16 lg:py-28 px-6 lg:px-16 overflow-hidden w-full border-t border-cream-dark">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 lg:mb-16">
            <span className="section-tag">How It Works</span>
            <h2 className="section-title">The HARVEN <strong>Process</strong></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {[
               { img: "/images/process-source.png", title: "Source", step: "01", desc: "We identify premium origins and negotiate farm-direct allocations." },
               { img: "/images/process-quality.png", title: "Quality", step: "02", desc: "Stringent pre-shipment laboratory inspections and sorting." },
               { img: "/images/process-trade.png", title: "Trade", step: "03", desc: "Transparent, secure contracting via our Dubai headquarters." },
               { img: "/images/process-deliver.png", title: "Deliver", step: "04", desc: "End-to-end logistics handling ensuring port-to-port accuracy." }
            ].map(item => (
              <div key={item.step} className="text-center p-3 lg:p-4 group">
                <div className="w-[90px] h-[90px] lg:w-[110px] lg:h-[110px] rounded-full overflow-hidden mx-auto mb-4 lg:mb-6 border-[3px] border-cream-dark transition-all duration-400 group-hover:border-sage group-hover:scale-[1.06] group-hover:shadow-[0_8px_30px_rgba(45,90,61,0.1)]">
                  <img src={item.img} alt="" className="w-full h-full object-cover saturate-[0.8] transition-all duration-400 group-hover:saturate-100" />
                </div>
                <div className="font-mono text-[0.6rem] font-bold text-terracotta mb-2 lg:mb-3 tracking-[0.1em]">{item.step}</div>
                <h4 className="font-display text-[1.1rem] lg:text-[1.15rem] font-semibold text-text-dark mb-1 lg:mb-2">{item.title}</h4>
                <p className="text-[0.75rem] lg:text-[0.8rem] text-text-muted leading-[1.6] lg:leading-[1.7] font-light max-w-[250px] mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="bg-forest-deep relative overflow-hidden py-24 lg:py-32 px-6 lg:px-16 text-center w-full">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(139,175,124,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_70%_70%,rgba(212,168,85,0.05)_0%,transparent_40%)] pointer-events-none" />
         <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-light italic text-white/75 leading-[1.4] lg:leading-[1.5] max-w-[750px] mx-auto mb-8 lg:mb-10 relative z-10">
           "A supply chain is only as strong as its <strong className="font-semibold text-white">integrity</strong>. At Harven, we guarantee ours."
         </h2>
         <div className="font-display text-[1rem] lg:text-[1.1rem] font-normal text-wheat-light italic relative z-10 mb-6 lg:mb-8">Sourcing the World's Best.</div>
         <div className="w-[50px] lg:w-[60px] h-[1.5px] bg-terracotta opacity-50 mx-auto my-6 lg:my-8 relative z-10" />
         <div className="font-mono text-[0.55rem] lg:text-[0.6rem] tracking-[0.15em] uppercase text-white/30 relative z-10">Vision Statement</div>
      </section>

      {/* ORIGINS */}
      <section className="bg-cream py-16 lg:py-28 px-6 lg:px-16 overflow-hidden w-full border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
           <div className="rounded-[20px] overflow-hidden relative w-full aspect-[4/3] order-1 lg:order-2 shadow-sm">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&q=80" alt="World Map Trading" className="w-full h-full object-cover saturate-[0.65] brightness-95" />
              <div className="absolute inset-0 bg-gradient-to-br from-forest/10 to-terracotta/5 pointer-events-none" />
           </div>

           <div className="flex flex-col gap-3 lg:gap-4 order-2 lg:order-1 w-full">
              <div className="mb-2 lg:mb-4">
                <span className="section-tag">Sourcing Map</span>
                <h2 className="section-title">Where We <strong>Operate</strong></h2>
              </div>
              {[
                { name: "Southeast Asia", desc: "Spices, Rice, and Tropical Commodities", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&q=60", count: "12+" },
                { name: "Middle East", desc: "Trading Hub, Processing & Distribution", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=100&q=60", count: "HQ" },
                { name: "Africa", desc: "Raw Cocoa, Coffee, and Specialty Grains", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&q=60", count: "8+" },
                { name: "Americas", desc: "Premium Nuts, Wheat, and Corn", img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&q=60", count: "5+" },
                { name: "Europe", desc: "Dairy, Processed Foods & Premium Ingredients", img: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=100&q=60", count: "6+" }
              ].map((origin, idx) => (
                <div key={origin.name} className="flex items-center gap-4 lg:gap-5 p-4 lg:p-5 bg-white border border-black/5 rounded-[16px] transition-all duration-400 hover:border-sage-light hover:translate-x-1 lg:hover:translate-x-2 hover:shadow-[0_8px_30px_rgba(45,90,61,0.05)] group">
                   <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden shrink-0 border-2 border-cream-dark transition-all duration-300 group-hover:border-sage">
                      <img src={origin.img} alt="" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h4 className="font-display text-[0.95rem] lg:text-[1rem] font-semibold text-text-dark">{origin.name}</h4>
                      <p className="text-[0.65rem] lg:text-[0.7rem] text-text-muted mt-0.5 font-mono tracking-[0.02em]">{origin.desc}</p>
                   </div>
                   <div className="ml-auto font-display text-[1.1rem] lg:text-[1.3rem] font-semibold text-forest">{origin.count}</div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="bg-terracotta relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 py-16 lg:py-20 px-6 lg:px-24 w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(255,255,255,0.06)_0%,transparent_50%)] pointer-events-none" />
        <h2 className="font-display text-[clamp(1.6rem,2.8vw,2.4rem)] font-normal text-white max-w-[520px] leading-[1.25] lg:leading-[1.3] relative z-10 text-center lg:text-left">
          Ready to scale your <strong>supply chain</strong> with confidence?
        </h2>
        <Link href="/contact" className="relative z-10 bg-white text-terracotta px-[2.5rem] py-[1rem] rounded-full font-semibold text-[0.88rem] whitespace-nowrap shadow-[0_4px_20px_rgba(0,0,0,0.08)] inline-flex items-center gap-2 transition-all hover:bg-cream hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          Contact Our Team <ArrowRight size={16} />
        </Link>
      </section>
    </>
  )
}
