import React from 'react'
import Link from 'next/link'
import { BRANDS_DATA } from '@/config/brands.config'
import { BrandHero } from '@/components/brands/BrandHero'
import { BrandSelector } from '@/components/brands/BrandSelector'
import { BrandSection } from '@/components/brands/BrandSection'

import { getActiveSignatureBrands } from '@/lib/db/queries'

export const revalidate = 60 // Enable ISR

export const metadata = {
  title: 'Our Signature Brands | HARVEN Exclusive',
  description: 'Explore HARVEN’s exclusive portfolio of premium food brands: KeraZone and Fióri. Sourced from the lush landscapes of India.',
}

export default async function BrandsPage() {
  const dbBrands = await getActiveSignatureBrands()

  // Inject database products into the static Brand descriptions
  const dynamicBrandsData = BRANDS_DATA.map(brand => {
    // Filter database rows that match this brand type (handle accents like Fióri vs Fiori)
    const matchedProducts = dbBrands?.filter(row => {
      if (!row.brand_type) return false;
      const dbType = row.brand_type.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const configName = brand.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const configId = brand.id.toLowerCase();
      return dbType === configName || dbType === configId;
    }) || [];
    
    // Convert them to the expected Product interface format
    const formattedProducts = matchedProducts.map(row => ({
      id: row.id,
      badge: row.badge,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      image: row.image_url,
      accent: row.accent as 'amber' | 'emerald' | 'forest' | 'terracotta',
      ctaText: row.cta_text || 'Inquire Now',
      specs: {
        origin: row.origin,
        packaging: row.packaging,
        certificate: row.certification,
        moq: row.moq,
        grade: row.grade
      }
    }));

    return {
      ...brand,
      products: formattedProducts.length > 0 ? formattedProducts : brand.products // Fallback to hardcoded if DB is empty for this brand
    }
  });

  return (
    <div className="bg-cream min-h-screen selection:bg-forest/10">
      <BrandHero />
      <BrandSelector />

      {dynamicBrandsData.map((brand) => (
        <BrandSection key={brand.id} brand={brand} />
      ))}

      {/* CALL TO ACTION */}
      <section className="bg-forest-deep py-24 lg:py-32 px-6 lg:px-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#8BAF7C_1px,transparent_1px)] bg-[length:40px_40px]" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="font-display text-4xl lg:text-6xl text-white font-medium mb-8">
            Experience the <span className="italic text-sage">quality</span> of Kerala heritage.
          </h2>
          <p className="text-white/60 text-lg mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Whether you are a retailer looking for premium shelf products or a manufacturer requiring stable fruit ingredients, HARVEN is your trusted partner.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/contact" className="bg-terracotta text-white px-10 py-5 rounded-full font-semibold text-lg transition-all hover:bg-terracotta-light hover:-translate-y-1 shadow-xl shadow-black/20">
              Request Full Catalog
            </Link>
            <a href="https://wa.me/971561625698" target="_blank" rel="noopener noreferrer" className="text-white border-b-2 border-sage pb-1 font-medium hover:text-sage transition-colors text-lg">
              Chat with Bulk Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
