"use client";

import React, { useState, useEffect } from 'react';
import { adminFetch, uploadAdminFile } from '@/lib/admin/api-client';
import { X, UploadCloud, Loader2, Trash2, CheckCircle2, Image as ImageIcon, Search } from 'lucide-react';

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function MediaLibrary({ isOpen, onClose, onSelect }: MediaLibraryProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const bucketName = 'harven_assets';

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { files } = await adminFetch<{ files: any[] }>('/api/admin/media');
      if (files) setFiles(files);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      await uploadAdminFile(file);

      await fetchFiles();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await adminFetch('/api/media/delete', {
        method: 'POST',
        body: JSON.stringify({ fileName, bucketName }),
      });
      await fetchFiles();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete image: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredFiles = files.filter((f) => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-forest-darker/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-black/5 flex justify-between items-center bg-cream/30">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-dark">Media Library</h2>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-mono">Manage your assets & content</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search images..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-cream-dark rounded-full text-sm focus:outline-forest w-64"
              />
            </div>
            <label className="bg-forest text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-deep transition-all shadow-lg shadow-forest/10 flex items-center gap-2 cursor-pointer">
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              {uploading ? 'Uploading...' : 'Upload New'}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            </label>
            <button type="button" onClick={onClose} className="text-text-muted hover:text-text-dark p-2 rounded-full hover:bg-black/5 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-cream/10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-text-muted">
              <Loader2 className="animate-spin text-forest" size={40} />
              <p className="font-mono text-xs uppercase tracking-widest">Synchronizing assets...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-text-muted opacity-50">
              <ImageIcon size={64} strokeWidth={1} />
              <p className="font-mono text-sm uppercase tracking-widest">No assets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id} 
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${selectedUrl === file.url ? 'border-forest ring-4 ring-forest/10' : 'border-transparent hover:border-forest/40'}`}
                  onClick={() => setSelectedUrl(file.url)}
                >
                  <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onSelect(file.url); }}
                      className="bg-white text-forest p-2 rounded-lg hover:bg-forest hover:text-white transition-all shadow-xl"
                      title="Select this image"
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                      className="bg-white text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl"
                      title="Delete image"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Checkmark if selected */}
                  {selectedUrl === file.url && (
                    <div className="absolute top-3 right-3 bg-forest text-white p-1 rounded-full shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  )}

                  {/* Name label */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-[0.6rem] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-black/5 flex justify-between items-center bg-cream/30">
          <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
            {filteredFiles.length} Assets Available
          </p>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-medium border border-cream-dark hover:bg-white transition-all"
            >
              Cancel
            </button>
            <button 
              type="button"
              disabled={!selectedUrl}
              onClick={() => selectedUrl && onSelect(selectedUrl)}
              className="bg-forest text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-deep transition-all shadow-lg shadow-forest/10 disabled:opacity-50 disabled:grayscale"
            >
              Select Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
