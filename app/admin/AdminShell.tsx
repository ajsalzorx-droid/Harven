"use client";

import React, { useState } from 'react'
import { http } from '@/lib/http'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Image as ImageIcon, Box, Bot, Inbox, Settings, Menu, X, LogOut, Award, Monitor } from 'lucide-react'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const handleSignOut = async () => {
    try {
      await http.post('/api/admin/logout')
      window.location.href = '/admin/login'
    } catch (err) {
      console.error(err)
      window.location.href = '/admin/login'
    }
  }

  const links = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Homepage CMS', href: '/admin/homepage', icon: <Monitor size={20} /> },
    { name: 'Products', href: '/admin/products', icon: <Box size={20} /> },
    { name: 'Signature Brands', href: '/admin/brands', icon: <Award size={20} /> },
    { name: 'Media Library', href: '/admin/media', icon: <ImageIcon size={20} /> },
    { name: 'Landing Pages', href: '/admin/landing-pages', icon: <FileText size={20} /> },
    { name: 'AI Chatbot', href: '/admin/chatbot', icon: <Bot size={20} /> },
    { name: 'Inquiries', href: '/admin/inquiries', icon: <Inbox size={20} /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings size={20} /> },
  ]


  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} className="text-forest-darker" /> : <Menu size={24} className="text-forest-darker" />}
      </div>

      {/* Sidebar */}
      <aside className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 fixed lg:static inset-y-0 left-0 w-64 bg-forest-darker text-white z-40 flex flex-col`}>
        <div className="p-8 pb-4">
          <Link href="/" className="font-display text-2xl font-semibold no-underline text-white block mb-1">
            HARV<span className="text-terracotta italic">E</span>N
          </Link>
          <div className="text-white/40 font-mono text-[0.6rem] tracking-widest uppercase">Admin Panel</div>
        </div>
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href))
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                  active ? 'bg-forest/50 text-white' : 'text-white/60 hover:bg-forest hover:text-white'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon} {link.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium w-full text-white/60 hover:bg-terracotta/20 hover:text-terracotta"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-cream p-4 lg:p-8">
        <div className="max-w-6xl mx-auto w-full pt-12 lg:pt-0 pb-16">
          {children}
        </div>
      </main>
    </div>
  )
}
