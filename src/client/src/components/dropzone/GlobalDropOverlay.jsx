import React from 'react';
import { UploadCloud } from 'lucide-react';

export function GlobalDropOverlay({ isDragging }) {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#08080c]/92 backdrop-blur-xl border-4 border-dashed border-neon-cyan shadow-[0_0_50px_rgba(56,189,248,0.5),inset_0_0_30px_rgba(56,189,248,0.2)] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
      {/* Radar sweep light effect */}
      <div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(56, 189, 248, 0.12) 50%, transparent 100%)',
          animation: 'radarSweep 2.5s linear infinite'
        }}
      />

      <style>{`
        @keyframes radarSweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>

      <div className="relative z-10 text-center flex flex-col items-center px-6">
        <UploadCloud size={64} className="text-neon-cyan animate-bounce drop-shadow-[0_0_12px_#38bdf8] mb-4" />
        <h2 className="font-vt323 text-4xl sm:text-5xl md:text-6xl text-white tracking-widest uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
          Drop File to Stage
        </h2>
        <p className="font-silkscreen text-xs sm:text-sm text-neon-cyan mt-2 tracking-wider">
          // RELEASING FILE WILL OPEN HOMELAB DROPZONE
        </p>
      </div>
    </div>
  );
}
