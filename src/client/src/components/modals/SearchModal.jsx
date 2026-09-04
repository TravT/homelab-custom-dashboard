import React, { useState } from 'react';
import { X, Search, ExternalLink, ArrowRight } from 'lucide-react';

export function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setSearchQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.open(`http://jellyseerr.home.arpa/search?query=${encodeURIComponent(searchQuery.trim())}`, '_blank');
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-cyber-card/95 border border-neon-cyan/40 shadow-[0_0_50px_rgba(56,189,248,0.25)] p-6 md:p-8 rounded-2xl max-w-lg w-full relative">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          title="Close Modal"
        >
          <X size={24} className="pixel-icon" />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <Search size={24} className="text-neon-cyan pixel-icon" />
          <h2 className="font-vt323 text-3xl text-white tracking-widest uppercase">Media Discovery</h2>
        </div>
        
        <p className="font-silkscreen text-xs text-gray-400 mb-6 tracking-wide">
          Search movies, shows & anime across your homelab library on Jellyseerr:
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter title, anime, or director..."
              className="w-full bg-[#0d0d12] border border-white/10 focus:border-neon-cyan focus:shadow-[0_0_12px_rgba(56,189,248,0.5)] rounded-lg px-4 py-3 text-white font-pixel text-sm outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <a 
              href="http://jellyseerr.home.arpa/" 
              target="_blank" 
              rel="noreferrer" 
              className="font-silkscreen text-[0.65rem] text-gray-500 hover:text-neon-cyan flex items-center gap-1.5 transition-colors no-underline"
            >
              Open Jellyseerr <ExternalLink size={12} />
            </a>

            <button 
              type="submit"
              disabled={!searchQuery.trim()}
              className="font-pixel text-xs bg-neon-cyan/20 border border-neon-cyan/40 hover:bg-neon-cyan/40 text-neon-cyan hover:text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              SEARCH <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
