"use client";

import React, { useState, useRef, useEffect } from 'react';
import { http, getErrorMessage } from '@/lib/http'
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm the Harven Assistant. How can I help you with our premium food commodities and sourcing today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await http.post('/api/chat', { messages: [...messages, userMessage] }, { timeout: 60000 });
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        const errorMsg = data.details || data.error || "Invalid response from server";
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const friendlyError = getErrorMessage(error).includes("API_KEY") 
        ? "The AI assistant is not correctly configured (Missing API Key). Please check site settings."
        : "I'm currently experiencing a high volume of requests. Please try again in a moment or contact us at harvenllc@gmail.com.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: friendlyError }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-cream-dark overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-forest p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Bot className="text-wheat" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-display text-sm font-semibold leading-tight">Harven Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
                    <span className="text-white/60 text-[0.6rem] uppercase tracking-wider font-mono">Gemini Powered</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-cream/30">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-[20px] p-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-forest text-white rounded-br-none' 
                      : 'bg-white border border-cream-dark text-text-dark rounded-bl-none shadow-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-cream-dark rounded-[20px] rounded-bl-none p-3 shadow-sm">
                    <Loader2 className="animate-spin text-forest" size={16} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-cream-dark flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our products..."
                className="flex-grow bg-cream/50 border border-cream-dark rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest/10"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center transition-all hover:bg-terracotta-light disabled:opacity-50 disabled:scale-95"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${
          isOpen ? 'bg-white text-forest border border-cream-dark' : 'bg-forest text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
