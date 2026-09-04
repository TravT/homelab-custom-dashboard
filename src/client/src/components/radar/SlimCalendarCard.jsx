import React from 'react';

export function SlimCalendarCard({ group, title, desc, icon, color, grad }) {
  const jellyfinUrl = 'http://jellyfin.home.arpa/';

  const getAccentColor = (c) => {
    if (c === 'neon-cyan') return '#38bdf8';
    if (c === 'neon-purple') return '#a78bfa';
    return '#22c55e';
  };

  const accentHex = getAccentColor(color);

  return (
    <a 
      href={jellyfinUrl}
      target="_blank"
      rel="noreferrer"
      title={`Open Jellyfin - ${title}`}
      className="min-w-[280px] md:min-w-[320px] snap-center h-16 md:h-20 bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg pl-5 pr-2 flex items-center hover:border-white/20 hover:bg-black/60 transition-all cursor-pointer flex-shrink-0 group overflow-hidden relative shadow-[0_4px_12px_rgba(0,0,0,0.3)] no-underline"
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${grad} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
      <div className="flex-1 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2" style={{ backgroundColor: accentHex, boxShadow: `0 0 6px ${accentHex}` }}></div>
            <span className="text-[0.55rem] md:text-xs font-pixel text-gray-500 uppercase tracking-widest">{group}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-pixel text-xs md:text-sm text-white whitespace-nowrap">{title}</span>
            <span className="text-xs font-silkscreen text-gray-500 whitespace-nowrap hidden sm:inline">{desc}</span>
          </div>
        </div>
        <div 
          className="w-10 h-10 flex items-center justify-center pixel-icon opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" 
          style={{ color: accentHex }}
        >
          {icon}
        </div>
      </div>
    </a>
  );
}
