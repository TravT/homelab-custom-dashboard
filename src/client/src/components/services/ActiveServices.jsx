import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { servicesCatalog } from '../../data/servicesCatalog.jsx';
import { ServiceRow } from './ServiceRow.jsx';

export function ActiveServices({ serviceHealth = {} }) {
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  const stackSequence = useMemo(() => Array.from({ length: 50 }, (_, i) => i % servicesCatalog.length), []);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) setActiveStackIndex(prev => Math.min(prev + 1, stackSequence.length - 1));
    else if (diff < -40) setActiveStackIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-4">
        <div className="font-vt323 text-xl md:text-2xl text-gray-400 tracking-wider uppercase flex items-center gap-2.5">
          <span className="text-neon-green opacity-50">//</span> ACTIVE SERVICES
        </div>
        
        {/* Desktop/Tablet Pagination Controls */}
        <div className="flex xl:hidden items-center gap-4 pr-2">
          <span className="font-pixel text-[0.55rem] text-gray-500 uppercase tracking-widest">
            PAGE {(activeStackIndex % servicesCatalog.length) + 1}/{servicesCatalog.length}
          </span>
          
          <div className="flex gap-2 mr-3">
            <button 
              onClick={() => setActiveStackIndex(p => Math.max(0, p - 1))} 
              className="text-gray-500 hover:text-neon-cyan transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={16}/>
            </button>
            <button 
              onClick={() => setActiveStackIndex(p => Math.min(p + 1, stackSequence.length - 1))} 
              className="text-gray-500 hover:text-neon-cyan transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={16}/>
            </button>
          </div>

          <div className="flex gap-1">
            {servicesCatalog.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-sm transition-all ${activeStackIndex % servicesCatalog.length === i ? 'bg-neon-cyan shadow-[0_0_8px_#38bdf8]' : 'bg-gray-700'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* MOBILE & TABLET: Infinite Stack */}
      <div 
        className="relative w-full h-[450px] md:h-[470px] touch-pan-y overflow-hidden xl:hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {stackSequence.map((pageIdx, idx) => {
          if (idx < activeStackIndex) return null;
          if (idx > activeStackIndex + 1) return null;

          const isActive = idx === activeStackIndex;
          const isUnder = idx === activeStackIndex + 1;
          const pageServices = servicesCatalog[pageIdx] || [];

          return (
            <div 
              key={idx}
              className={`absolute top-0 left-0 w-full bg-cyber-card/80 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden flex flex-col transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                isActive ? 'z-20 translate-x-0 scale-100 opacity-100 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' 
                : isUnder ? 'z-10 translate-x-12 scale-[0.94] opacity-40 pointer-events-none'
                : 'z-30 -translate-x-32 scale-105 opacity-0 pointer-events-none'
              }`}
            >
              <div className="hidden md:grid grid-cols-[4fr_5fr_3fr_2fr] gap-4 px-6 py-4 bg-black/40 border-b border-white/5">
                <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Service</div>
                <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Description</div>
                <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Category</div>
                <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase text-right">Status</div>
              </div>
              <div className="flex flex-col">
                {pageServices.map(svc => {
                  const h = serviceHealth[svc.id] || { status: 'online', latency: '12ms' };
                  return (
                    <ServiceRow 
                      key={svc.id}
                      name={svc.name}
                      desc={svc.desc}
                      category={svc.category}
                      icon={svc.icon}
                      url={svc.url}
                      status={h.status}
                      latency={h.latency}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ULTRAWIDE DESKTOP: Side-by-Side Grid */}
      <div className="hidden xl:grid grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
        {servicesCatalog.map((pageServices, idx) => (
          <div key={idx} className="bg-cyber-card/80 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-full">
            <div className="grid grid-cols-[4fr_5fr_3fr_2fr] gap-4 px-6 py-4 bg-black/40 border-b border-white/5">
              <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Service</div>
              <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase truncate">Description</div>
              <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Category</div>
              <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase text-right">Status</div>
            </div>
            <div className="flex flex-col">
              {pageServices.map(svc => {
                const h = serviceHealth[svc.id] || { status: 'online', latency: '12ms' };
                return (
                  <ServiceRow 
                    key={svc.id}
                    name={svc.name}
                    desc={svc.desc}
                    category={svc.category}
                    icon={svc.icon}
                    url={svc.url}
                    status={h.status}
                    latency={h.latency}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
