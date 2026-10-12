"use client";

import React, { useState } from 'react';
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { MediaLibrary } from './MediaLibrary';
import { uploadAdminFile } from '@/lib/admin/api-client';

interface ImagePickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
  placeholder?: string;
}

export function ImagePicker({ label, value, onChange, className = "", placeholder = "https://..." }: ImagePickerProps) {
  const [activeMode, setActiveMode] = useState<'url' | 'upload' | 'media'>(value && !value.startsWith('/api/media/') && !value.includes('res.cloudinary.com') ? 'url' : 'upload');
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const bucketName = 'harven_assets';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const { publicUrl } = await uploadAdminFile(file);
      onChange(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Failed to upload image: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleMediaSelect = (url: string) => {
    onChange(url);
    setIsMediaLibraryOpen(false);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      {/* Mode Selector */}
      <div className="flex bg-cream/50 p-1 rounded-xl border border-cream-dark self-start">
        <button 
          type="button"
          onClick={() => setActiveMode('upload')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider transition-all ${activeMode === 'upload' ? 'bg-white text-forest shadow-sm' : 'text-text-muted hover:text-text-dark'}`}
        >
          <UploadCloud size={14} /> Upload
        </button>
        <button 
          type="button"
          onClick={() => setActiveMode('url')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider transition-all ${activeMode === 'url' ? 'bg-white text-forest shadow-sm' : 'text-text-muted hover:text-text-dark'}`}
        >
          <LinkIcon size={14} /> URL
        </button>
        <button 
          type="button"
          onClick={() => setIsMediaLibraryOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[0.7rem] font-bold uppercase tracking-wider text-text-muted hover:text-text-dark transition-all"
        >
          <ImageIcon size={14} /> Library
        </button>
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 relative">
          {activeMode === 'upload' ? (
            <div className="relative group">
               <input 
                 type="file" 
                 accept="image/*"
                 onChange={handleFileUpload}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 disabled={uploading}
               />
               <div className={`w-full p-3 bg-cream rounded-xl border border-dashed border-cream-dark flex items-center justify-center gap-3 transition-all ${uploading ? 'opacity-50' : 'group-hover:bg-cream-dark'}`}>
                 {uploading ? <Loader2 className="animate-spin text-forest" size={20} /> : <UploadCloud className="text-text-muted" size={20} />}
                 <span className="text-[0.85rem] text-text-muted font-medium">
                   {uploading ? 'Processing asset...' : (value ? 'Click to replace file' : 'Click to upload local file')}
                 </span>
               </div>
            </div>
          ) : (
            <input 
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 bg-cream rounded-xl border border-transparent focus:border-forest/30 focus:bg-white focus:outline-none text-[0.9rem] transition-all"
            />
          )}

          {value && (
            <button 
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-terracotta transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {value && (
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-black/5 bg-cream flex-shrink-0 shadow-inner group">
             <img src={value} alt="Preview" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon size={14} className="text-white" />
             </div>
          </div>
        )}
      </div>

      {/* Media Library Modal */}
      <MediaLibrary 
        isOpen={isMediaLibraryOpen} 
        onClose={() => setIsMediaLibraryOpen(false)} 
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
