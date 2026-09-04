import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export function CalendarModal({ isOpen, onClose, rawReleases = [] }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedMobileDay, setSelectedMobileDay] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, day: 1, monthStr: '', items: [] });

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setSelectedMobileDay(null);
    setTooltip({ visible: false, x: 0, y: 0, day: 1, monthStr: '', items: [] });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 md:p-10 animate-in fade-in duration-300">
      <div className="bg-cyber-card/95 border border-neon-purple/30 shadow-[0_0_60px_rgba(167,139,250,0.2)] p-4 sm:p-6 md:p-8 rounded-2xl max-w-4xl w-full relative flex flex-col h-full md:h-auto max-h-[92vh] overflow-hidden">
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-neon-purple transition-colors z-20"
          title="Close Calendar"
        >
          <X size={26} className="pixel-icon" />
        </button>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 pr-10 sm:pr-14">
          <div className="font-vt323 text-3xl sm:text-4xl md:text-5xl text-white tracking-widest flex items-center gap-3">
            <CalendarIcon size={28} className="text-neon-purple pixel-icon shrink-0" /> 
            <span className="truncate">{calendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button 
              onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className="p-1.5 bg-black/40 hover:bg-neon-purple/20 border border-white/10 hover:border-neon-purple/50 rounded text-gray-400 hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCalendarDate(new Date())}
              className="px-2.5 py-1 bg-black/40 hover:bg-neon-cyan/20 border border-white/10 hover:border-neon-cyan/50 rounded font-pixel text-[0.55rem] sm:text-[0.6rem] text-gray-400 hover:text-neon-cyan transition-colors"
              title="Current Month"
            >
              TODAY
            </button>
            <button 
              onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className="p-1.5 bg-black/40 hover:bg-neon-purple/20 border border-white/10 hover:border-neon-purple/50 rounded text-gray-400 hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="font-silkscreen text-[0.65rem] sm:text-xs md:text-sm text-neon-purple/80 uppercase tracking-widest mb-4">// Scheduled Releases</div>
        
        <div className="flex-1 overflow-x-auto no-scrollbar pb-4 w-full" onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, items: [] })}>
          <div className="min-w-[550px] sm:min-w-[600px] h-full flex flex-col">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3 flex-1">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="font-pixel text-[0.5rem] sm:text-[0.55rem] md:text-xs text-gray-500 text-center mb-1">{day}</div>
              ))}

              {/* Empty offset days for the beginning of the month */}
              {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="border border-white/5 bg-black/10 rounded-lg p-1.5 opacity-20 pointer-events-none md:aspect-square min-h-[65px] sm:min-h-[75px] md:min-h-[80px]"></div>
              ))}

              {/* Month days calculated dynamically */}
              {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                const dayNum = i + 1;
                const cYear = calendarDate.getFullYear();
                const cMonth = calendarDate.getMonth();
                
                // Filter rawReleases for this exact day/month/year
                const dayItems = rawReleases.filter(r => {
                  return r.date.getDate() === dayNum && r.date.getMonth() === cMonth && r.date.getFullYear() === cYear;
                });

                const hasItems = dayItems.length > 0;
                const realNow = new Date();
                const isToday = dayNum === realNow.getDate() && cMonth === realNow.getMonth() && cYear === realNow.getFullYear();

                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (hasItems) {
                        setSelectedMobileDay({
                          day: dayNum,
                          monthStr: calendarDate.toLocaleString('en-US', { month: 'short' }),
                          items: dayItems
                        });
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (hasItems) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          visible: true,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                          day: dayNum,
                          monthStr: calendarDate.toLocaleString('en-US', { month: 'short' }),
                          items: dayItems
                        });
                      } else {
                        setTooltip({ visible: false, x: 0, y: 0, items: [] });
                      }
                    }}
                    className={`border ${isToday ? 'border-neon-cyan/50 bg-neon-cyan/10 ring-1 ring-neon-cyan/30' : hasItems ? 'border-neon-purple/40 bg-neon-purple/10 hover:border-neon-purple' : 'border-white/5 bg-black/20'} rounded-lg p-1 sm:p-1.5 md:p-2 flex flex-col relative group hover:border-white/30 transition-all md:aspect-square min-h-[65px] sm:min-h-[75px] md:min-h-[80px] cursor-pointer`}
                  >
                    <span className={`font-pixel text-[0.55rem] sm:text-[0.6rem] md:text-sm ${isToday ? 'text-neon-cyan font-bold' : hasItems ? 'text-white' : 'text-gray-400'}`}>
                      {dayNum}
                    </span>
                    {dayItems.slice(0, 2).map((item, itemIdx) => (
                      <div 
                        key={itemIdx} 
                        className={`mt-1 w-full ${item.type === 'movie' ? 'bg-neon-cyan/15 border-l-[2px] md:border-l-[3px] border-neon-cyan text-neon-cyan' : 'bg-neon-green/15 border-l-[2px] md:border-l-[3px] border-neon-green text-neon-green'} p-1 rounded-sm shadow-[0_0_8px_rgba(34,197,94,0.1)]`}
                      >
                        <div className="font-pixel text-[0.4rem] md:text-[0.55rem] truncate leading-tight">
                          {item.title}
                        </div>
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <div className="font-pixel text-[0.4rem] md:text-[0.45rem] text-neon-purple mt-0.5 text-right">
                        +{dayItems.length - 2} more
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Flying Hover Tooltip */}
        {tooltip.visible && tooltip.items.length > 0 && (
          <div 
            className="hidden md:block fixed z-[150] pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-[#09090d]/95 backdrop-blur-xl border border-neon-cyan/40 shadow-[0_0_24px_rgba(56,189,248,0.25)] rounded-xl p-3 min-w-[220px] max-w-[320px] animate-in fade-in zoom-in-95 duration-150"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
              <span className="font-pixel text-[0.6rem] text-neon-cyan tracking-widest uppercase">
                {tooltip.monthStr} {tooltip.day}
              </span>
              <span className="font-silkscreen text-[0.55rem] text-gray-500">
                {tooltip.items.length} RELEASE{tooltip.items.length > 1 ? 'S' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {tooltip.items.map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-pixel text-xs ${item.type === 'movie' ? 'text-neon-cyan' : 'text-neon-green'} leading-snug break-words`}>
                      {item.title}
                    </span>
                    <span className="font-pixel text-[0.5rem] uppercase text-gray-500 bg-white/5 px-1 rounded">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[0.55rem] font-silkscreen text-gray-400 mt-0.5">
                    <span>{item.seasonEp || item.epTitle || item.desc}</span>
                    <span className={item.status === 'Downloaded' ? 'text-neon-green' : 'text-amber-400'}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Bottom Sheet Drawer */}
        {selectedMobileDay && (
          <div className="md:hidden absolute inset-x-0 bottom-0 z-[160] bg-[#09090d]/98 backdrop-blur-2xl border-t-2 border-neon-cyan/50 p-4 rounded-t-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.95)] animate-in slide-in-from-bottom duration-250 max-h-[65%] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#38bdf8]"></span>
                <span className="font-pixel text-xs text-neon-cyan uppercase tracking-wider">
                  {selectedMobileDay.monthStr} {selectedMobileDay.day} — {selectedMobileDay.items.length} Release{selectedMobileDay.items.length > 1 ? 's' : ''}
                </span>
              </div>
              <button 
                onClick={() => setSelectedMobileDay(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedMobileDay.items.map((item, idx) => (
                <a 
                  key={idx}
                  href="http://jellyfin.home.arpa/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col p-2.5 rounded-lg bg-white/[0.03] border border-white/5 hover:border-neon-cyan/40 transition-colors no-underline"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`font-pixel text-xs ${item.type === 'movie' ? 'text-neon-cyan' : 'text-neon-green'} leading-snug`}>
                      {item.title}
                    </span>
                    <span className="font-pixel text-[0.5rem] uppercase text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[0.6rem] font-silkscreen text-gray-400 mt-1.5">
                    <span>{item.seasonEp || item.epTitle || item.desc}</span>
                    <span className={item.status === 'Downloaded' ? 'text-neon-green font-pixel' : 'text-amber-400 font-pixel'}>
                      {item.status}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
