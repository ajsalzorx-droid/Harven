"use client";

import React, { useState, useEffect } from 'react'
import { http } from '@/lib/http'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Slide {
  id: string
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image_url: string
  video_url?: string
  media_type?: 'image' | 'video'
  badge_text: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: '1',
    title: "<strong>Sourcing</strong> the<br/><em>World's Best.</em>",
    subtitle: "It is trust. It is consistency. It is a promise that travels across borders.",
    badge_text: "UAE-Based · Global Trading",
    cta_text: "Explore Our Range",
    cta_link: "/products",
    image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
    media_type: 'image'
  },
  {
    id: '2',
    title: "<strong>Premium</strong> Spices<br/><em>& Commodities.</em>",
    subtitle: "Direct from the source to your wholesale operations.",
    badge_text: "Discover Quality",
    cta_text: "View Products",
    cta_link: "/products",
    image_url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=80",
    media_type: 'image'
  }
];

export function HeroSlider({ initialSlides }: { initialSlides?: Slide[] } = {}) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_SLIDES)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fetch or fallback dummy data
  useEffect(() => {
    if (initialSlides) return // already loaded from the database on the server
    const fetchSlides = async () => {
      try {
        const { data } = await http.get('/api/public/slides')
        const items = data.items
        if (items && items.length > 0) {
          setSlides(items)
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchSlides()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 8000) // 8 second cycle
    return () => clearInterval(timer)
  }, [slides])

  if (slides.length === 0) return <div className="h-screen bg-forest-darker/90" />

  const currentSlide = slides[currentIndex]

  // Parse HTML tags in title for bolding/italics as required by prompt
  const renderTitle = (htmlString: string) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />
  }

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-forest-darker">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 z-0"
        >
          {currentSlide.media_type === 'video' ? (
             <video 
               src={currentSlide.video_url || ''} 
               autoPlay 
               loop 
               muted 
               playsInline 
               className="w-full h-full object-cover brightness-[0.5] saturate-[0.85]"
             />
          ) : (
            <motion.img 
              src={currentSlide.image_url || ''} 
              alt="Hero background"
              fetchPriority="high"
              loading="eager"
              className="w-full h-full object-cover brightness-[0.5] saturate-[0.85]"
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, ease: "easeOut" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F2A17]/60 via-[#0F2A17]/15 to-[#0F2A17]/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F2A17]/50 to-transparent w-1/2" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-[700px] px-8 lg:px-16 w-full pt-28 lg:pt-32 pb-36 lg:pb-40">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`content-${currentIndex}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.6 } }
            }}
          >
            {currentSlide.badge_text && (
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
                className="inline-flex items-center gap-3 font-mono text-[0.58rem] tracking-[0.15em] uppercase text-white/60 mb-8"
              >
                <span className="text-[0.85rem] origin-bottom animate-[leafSway_3s_ease-in-out_infinite]">🍃</span>
                {currentSlide.badge_text}
              </motion.div>
            )}

            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 1 } } }}
              className="font-display text-[clamp(2.2rem,8vw,6rem)] font-light text-white leading-[1.02] mb-6 tracking-[-0.02em] [&>strong]:font-semibold [&>em]:font-normal [&>em]:italic [&>em]:text-wheat-light"
            >
              {renderTitle(currentSlide.title)}
            </motion.h1>

            {currentSlide.subtitle && (
              <motion.p 
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.9 } } }}
                className="text-white/65 text-[1.05rem] leading-[1.9] max-w-[500px] mb-10 font-light"
              >
                {currentSlide.subtitle}
              </motion.p>
            )}

            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
              className="flex gap-4 flex-wrap"
            >
              <Link href={currentSlide.cta_link || "#"} className="group inline-flex items-center gap-[0.6rem] bg-terracotta text-white px-[2.4rem] py-[1rem] rounded-full font-medium text-[0.88rem] tracking-[0.02em] transition-all duration-300 shadow-[0_4px_20px_rgba(196,112,75,0.25)] hover:bg-[#b5603e] hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgba(196,112,75,0.35)]">
                {currentSlide.cta_text || "Explore"} <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-[3rem] lg:bottom-[7rem] right-8 lg:right-16 z-10 flex items-center gap-6">
        <div className="font-mono text-[0.6rem] text-white/40 tracking-[0.1em]">
          <span className="text-white/85 font-bold">{(currentIndex + 1).toString().padStart(2, '0')}</span> / {slides.length.toString().padStart(2, '0')}
        </div>
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className="w-9 h-[3px] rounded bg-white/20 cursor-pointer overflow-hidden relative transition-colors"
            >
              {currentIndex === idx && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="absolute left-0 top-0 bottom-0 bg-white/85 rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-[-1px] left-0 right-0 z-10 h-[140px]">
        <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="w-full h-full block">
          <path d="M0,70 C360,130 720,10 1080,70 C1260,100 1380,40 1440,70 L1440,140 L0,140 Z" fill="#FEFCF8"/>
          <path d="M0,90 C240,50 600,110 900,70 C1100,45 1300,90 1440,80 L1440,140 L0,140 Z" fill="#FEFCF8" opacity="0.5"/>
        </svg>
      </div>
    </section>
  )
}
