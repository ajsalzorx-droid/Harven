"use client";

import React, { useState } from 'react'
import { http, isHttpError } from '@/lib/http'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    

    try {
      await http.post('/api/admin/login', { email, password })
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(isHttpError(err) && err.response
        ? (err.response.data as { error?: string })?.error || 'Login failed'
        : 'Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 lg:p-12 w-full max-w-md rounded-3xl shadow-xl border border-black/5 flex flex-col items-center">
        <div className="font-display text-[2rem] font-semibold text-forest-darker mb-2">
          HARV<span className="text-terracotta italic">E</span>N
        </div>
        <div className="font-mono text-[0.6rem] tracking-widest text-text-muted uppercase mb-8">Admin Portal</div>
        
        {error && <div className="w-full bg-terracotta/10 text-terracotta text-sm p-4 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Admin Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="w-full p-4 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage text-text-dark"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="w-full p-4 bg-cream rounded-xl border border-transparent focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage text-text-dark"
          />
          <Button variant="primary" type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Secure Login'}
          </Button>
        </form>
      </div>
    </div>
  )
}
