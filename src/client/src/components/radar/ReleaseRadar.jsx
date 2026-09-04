import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SlimCalendarCard } from './SlimCalendarCard.jsx';

export function ReleaseRadar({ releaseData = [], onOpenCalendar }) {
  return (
    <section className="relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="font-vt323 text-xl md:text-2xl text-gray-400 tracking-wider uppercase flex items-center gap-2.5">
          <span className="text-neon-cyan opacity-50">//</span> RELEASE RADAR
        </div>
        <button 
          onClick={onOpenCalendar}
          className="group relative flex items-center justify-center p-1 text-neon-cyan hover:text-white transition-colors animate-calendar-glow cursor-pointer"
          title="Open Scheduled Releases Calendar"
        >
          <CalendarIcon size={20} className="pixel-icon" />
        </button>
      </div>
      
      <div className="w-full relative overflow-hidden py-2">
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#0a0a0c] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#0a0a0c] to-transparent z-10 pointer-events-none"></div>
        
        <div className="animate-marquee-track gap-4 px-2">
          {[...releaseData, ...releaseData].map((item, idx) => (
            <SlimCalendarCard key={idx} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
