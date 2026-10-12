"use client";

import React, { useState, useEffect } from 'react';
import { adminFetch, uploadAdminFile } from '@/lib/admin/api-client';
import { UploadCloud, Loader2, Trash2, CheckCircle2, Image as ImageIcon, Search, Copy, ExternalLink } from 'lucide-react';

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

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
    fetchFiles();
  }, []);

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
      if (selectedUrl?.includes(fileName)) setSelectedUrl(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete image: ' + (err.message || 'Unknown error'));
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(url);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredFiles = files.filter((f) => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text-dark">Media Library</h1>
          <p className="text-text-muted mt-2">Manage all your uploaded assets and content images.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
             <input 
               type="text" 
               placeholder="Search assets..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-dark rounded-xl text-sm focus:outline-forest shadow-sm"
             />
          </div>
          <label className="bg-forest text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-deep transition-all shadow-lg shadow-forest/10 flex items-center gap-2 cursor-pointer shrink-0">
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
            {uploading ? 'Uploading...' : 'Upload New'}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Grid Content */}
      <div className="bg-white rounded-[32px] border border-black/5 shadow-sm overflow-hidden min-h-[60vh] flex flex-col">
        {loading ? (
           <div className="flex-1 flex flex-col items-center justify-center gap-4 text-text-muted">
             <Loader2 className="animate-spin text-forest" size={48} />
             <p className="font-mono text-xs uppercase tracking-widest">Loading assets...</p>
           </div>
        ) : filteredFiles.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center gap-4 text-text-muted opacity-40">
             <ImageIcon size={80} strokeWidth={1} />
             <p className="font-mono text-sm uppercase tracking-widest">No assets found</p>
           </div>
        ) : (
           <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
             {filteredFiles.map((file) => (
               <div 
                 key={file.id} 
                 className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${selectedUrl === file.url ? 'border-forest ring-4 ring-forest/10' : 'border-transparent hover:border-forest/40'}`}
                 onClick={() => setSelectedUrl(file.url)}
               >
                 <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                 
                 {/* Selection Overlay */}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(file.url); }}
                        className="bg-white text-forest p-2.5 rounded-xl hover:bg-forest hover:text-white transition-all shadow-xl"
                        title="Copy URL"
                      >
                        {copySuccess === file.url ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                      </button>
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white text-forest p-2.5 rounded-xl hover:bg-forest hover:text-white transition-all shadow-xl"
                        title="Open in new tab"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(file.name); }}
                      className="bg-white text-red-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all shadow-xl mt-2"
                    >
                      <Trash2 size={14} className="inline mr-1" /> Delete
                    </button>
                 </div>

                 {/* Name Tag */}
                 <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-[0.6rem] truncate opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {file.name}
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>

      {/* Footer / Stats */}
      {!loading && (
        <div className="flex justify-between items-center text-text-muted px-2">
          <p className="text-xs font-mono uppercase tracking-widest">
            {filteredFiles.length} Assets in Storage
          </p>
          {selectedUrl && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-forest/20 shadow-sm animate-in slide-in-from-bottom-2">
               <span className="text-[0.7rem] text-forest font-bold font-mono truncate max-w-[200px]">{selectedUrl}</span>
               <button 
                 type="button"
                 onClick={() => copyToClipboard(selectedUrl)}
                 className="text-forest hover:opacity-70 transition-opacity"
               >
                 {copySuccess === selectedUrl ? <CheckCircle2 size={16} /> : <Copy size={16} />}
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
