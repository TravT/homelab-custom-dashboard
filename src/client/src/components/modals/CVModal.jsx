import React from 'react';
import { X, User, QrCode } from 'lucide-react';

export function CVModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-cyber-card border border-neon-cyan/30 shadow-[0_0_40px_rgba(56,189,248,0.2)] p-8 rounded-xl max-w-md w-full relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          title="Close Modal"
        >
          <X size={24} />
        </button>
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-1">
            <div className="w-full h-full bg-cyber-card rounded-full flex items-center justify-center">
              <User size={40} className="text-white opacity-80" />
            </div>
          </div>
          <div>
            <h2 className="font-vt323 text-4xl text-white tracking-widest">Tiago</h2>
            <p className="font-silkscreen text-neon-cyan mt-2">Systems Engineer</p>
          </div>
          <div className="w-full h-px bg-white/10 my-4"></div>
          <div className="bg-white p-4 rounded-lg">
            <QrCode size={120} className="text-black" />
          </div>
          <p className="font-pixel text-xs text-gray-400 leading-relaxed">
            Scan to connect.<br/>Command Center Architect.
          </p>
        </div>
      </div>
    </div>
  );
}
