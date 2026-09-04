import React from 'react';

export function ServiceRow({ name, desc, category, status = 'online', latency = '12ms', icon, url }) {
  const isOnline = status === 'online';
  
  // Clean up latency string for consistent spacing
  let displayLatency = latency;
  if (isOnline && displayLatency.endsWith('ms') && !displayLatency.includes(' ')) {
    displayLatency = displayLatency.replace('ms', ' ms');
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noreferrer" 
      className="flex flex-col md:grid md:grid-cols-[4fr_5fr_3fr_2fr] px-5 py-4 md:px-6 md:py-4 hover:bg-white/[0.04] transition-colors group cursor-pointer border-b border-white/5 last:border-b-0 hover:z-10 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_-1px_0_0_rgba(255,255,255,0.2)] no-underline items-center"
    >
      <div className="flex items-center justify-between md:justify-start w-full">
        <div className="flex items-center gap-4">
          <div className={`${isOnline ? 'text-gray-500 group-hover:text-neon-cyan' : 'text-neon-red/60 group-hover:text-neon-red'} pixel-icon transition-colors`}>
            {icon}
          </div>
          <span className={`font-pixel text-xs md:text-sm tracking-widest transition-colors ${isOnline ? 'text-white group-hover:text-neon-cyan' : 'text-gray-400 line-through group-hover:text-neon-red'}`}>
            {name}
          </span>
        </div>
        <div className="md:hidden flex items-center gap-3">
          <span className={`font-pixel text-[0.5rem] uppercase text-right w-14 inline-block ${isOnline ? 'text-gray-500' : 'text-neon-red'}`}>
            {isOnline ? displayLatency : 'OFFLINE'}
          </span>
          <div className={`w-2 h-2 rounded-none flex-shrink-0 ${isOnline ? 'bg-neon-green shadow-[0_0_8px_#22c55e]' : 'bg-neon-red shadow-[0_0_8px_#f43f5e]'}`}></div>
        </div>
      </div>
      <div className="flex md:contents mt-2 md:mt-0 ml-9 md:ml-0 items-center gap-4 w-full">
        <div className="font-silkscreen text-xs text-gray-500 tracking-wider truncate flex-1 md:flex-none pt-1 group-hover:text-gray-300 transition-colors max-w-[120px] sm:max-w-none">
          {desc}
        </div>
        <div className="md:flex md:items-center">
          <div className="font-pixel text-[0.55rem] text-gray-600 uppercase tracking-widest bg-black/40 border border-white/5 px-2 py-1 rounded inline-block whitespace-nowrap">
            {category}
          </div>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-end gap-4 w-full">
        <span className={`font-pixel text-xs uppercase tracking-widest text-right w-20 inline-block ${isOnline ? 'text-gray-500' : 'text-neon-red drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'}`}>
          {isOnline ? displayLatency : 'OFFLINE'}
        </span>
        <div className={`w-2 h-2 rounded-none flex-shrink-0 ${isOnline ? 'bg-neon-green shadow-[0_0_8px_#22c55e]' : 'bg-neon-red shadow-[0_0_8px_#f43f5e]'}`}></div>
      </div>
    </a>
  );
}
