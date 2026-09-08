import React, { useEffect } from 'react';
import { Zap } from 'lucide-react';

export function ActionTrigger({ onOpen }) {
  // Global Hotkey Listener: Cmd+Shift+A / Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);

  return (
    <button
      onClick={onOpen}
      title="Cluster Actions (Cmd+Shift+A)"
      className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-950/85 hover:bg-slate-900/95 backdrop-blur-xl border border-sky-500/30 hover:border-sky-400 text-sky-400 hover:text-white shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_28px_rgba(56,189,248,0.45)] transition-all duration-300 group cursor-pointer"
    >
      <div className="relative">
        <Zap size={16} className="text-sky-400 group-hover:scale-110 transition-transform animate-pulse" />
        <div className="absolute inset-0 bg-sky-400/20 blur-[6px] rounded-full"></div>
      </div>
      <span className="text-xs font-mono font-semibold tracking-wider">ACTIONS</span>
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 group-hover:border-sky-400/40">
        ⌘⇧A
      </span>
    </button>
  );
}
