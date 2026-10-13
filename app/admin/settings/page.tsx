"use client";

import React, { useState } from 'react'
import { adminFetch } from '@/lib/admin/api-client'

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' }

export default function SettingsCMS() {
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const updatePassword = (field: keyof typeof EMPTY_PASSWORDS, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }))
    setStatus(null)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword.length < 8) {
      return setStatus({ type: 'error', message: 'New password must be at least 8 characters' })
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setStatus({ type: 'error', message: 'New password and confirmation do not match' })
    }
    if (passwords.newPassword === passwords.currentPassword) {
      return setStatus({ type: 'error', message: 'New password must be different from the previous password' })
    }

    setSaving(true)
    try {
      await adminFetch('/api/admin/change-password', { method: 'POST', body: JSON.stringify(passwords) })
      setPasswords(EMPTY_PASSWORDS)
      setStatus({ type: 'success', message: 'Password updated. Other sessions have been signed out.' })
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-text-dark">Platform Settings</h1>
        <p className="text-text-muted mt-2">Manage backend integrations and global configurations.</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden p-6 md:p-10 mb-8">
        <h3 className="font-display text-xl font-semibold text-forest-darker mb-6 border-b border-cream-dark pb-2">Global Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium">Primary Receiving Email</label>
             <input type="email" className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest" defaultValue="harvenllc@gmail.com" />
           </div>
           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium">WhatsApp Business Number</label>
             <input type="text" className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest" defaultValue="+971501234567" />
           </div>
        </div>
        <button className="bg-forest text-white px-6 py-3 rounded-lg text-sm font-medium mt-6 hover:bg-forest-deep transition-colors">Save Integrations</button>
      </div>

      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden p-6 md:p-10">
        <h3 className="font-display text-xl font-semibold text-forest-darker mb-6 border-b border-cream-dark pb-2">Change Password</h3>
        <div className="flex flex-col gap-6 max-w-md">
           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium">Previous Password</label>
             <input type="password" autoComplete="current-password" required className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest" value={passwords.currentPassword} onChange={(e) => updatePassword('currentPassword', e.target.value)} />
           </div>
           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium">New Password</label>
             <input type="password" autoComplete="new-password" required minLength={8} maxLength={200} className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest" placeholder="At least 8 characters" value={passwords.newPassword} onChange={(e) => updatePassword('newPassword', e.target.value)} />
           </div>
           <div className="flex flex-col gap-2">
             <label className="text-sm font-medium">Confirm Password</label>
             <input type="password" autoComplete="new-password" required className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest" value={passwords.confirmPassword} onChange={(e) => updatePassword('confirmPassword', e.target.value)} />
           </div>
        </div>
        {status && (
          <p className={`text-sm mt-4 ${status.type === 'error' ? 'text-terracotta' : 'text-forest'}`}>{status.message}</p>
        )}
        <button type="submit" disabled={saving} className="px-6 py-3 rounded-lg text-sm font-medium mt-6 border border-terracotta text-terracotta hover:bg-terracotta/5 transition-colors disabled:opacity-50">
          {saving ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </>
  )
}
