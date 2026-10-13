"use client";

import React from 'react'

export default function ChatbotSettings() {

  

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-text-dark">AI Chatbot Settings</h1>
        <p className="text-text-muted mt-2">Configure the automated trading assistant's behavior and personality.</p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden p-6 md:p-10">
        <form className="max-w-3xl flex flex-col gap-8">
           
           <div className="flex items-center justify-between border-b border-cream-dark pb-6">
             <div>
               <h3 className="font-semibold text-text-dark text-lg">Enable Chatbot Site-wide</h3>
               <p className="text-text-muted text-sm mt-1">If disabled, the chatbot bubble will not appear on any page.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" defaultChecked />
               <div className="w-11 h-6 bg-cream-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
             </label>
           </div>

           <div className="flex flex-col gap-4">
              <label className="text-sm font-medium">AI Provider</label>
              <select className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest max-w-sm">
                 <option value="openai">OpenAI (GPT-4o)</option>
                 <option value="gemini">Google Gemini 1.5</option>
              </select>
           </div>

           <div className="flex flex-col gap-2">
              <label className="text-sm font-medium flex justify-between">
                System Prompt
                <span className="text-xs text-text-muted font-normal">Controls how the AI responds to buyers.</span>
              </label>
              <textarea 
                rows={8} 
                className="w-full p-4 bg-cream border border-cream-dark text-sm leading-relaxed rounded-xl focus:outline-forest font-mono text-text-dark" 
                defaultValue="You are HARVEN, the professional B2B trading assistant for HARVEN LLC based in Dubai, UAE. You specialize in food commodities like spices, grains, and nuts. Be concise, extremely professional, and focus on moving buyers toward wholesale negotiations. Never invent prices or exact stock levels unless provided in page context." 
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cream-dark">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex justify-between">
                  Escalation WhatsApp
                </label>
                <input type="text" className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest" defaultValue="+971 50 123 4567" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex justify-between">
                  Escalation Email
                </label>
                <input type="email" className="p-3 bg-cream border border-cream-dark rounded-lg focus:outline-forest" defaultValue="harvenllc@gmail.com" />
              </div>
           </div>

           <div className="flex gap-4 pt-4 border-t border-cream-dark">
              <button type="button" className="bg-forest text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-forest-deep transition-colors">
                 Save Settings
              </button>
              <button type="button" className="px-6 py-3 rounded-lg text-sm font-medium border border-cream-dark text-text-dark hover:bg-cream transition-colors">
                 Test Chatbot
              </button>
           </div>
        </form>
      </div>
    </>
  )
}
