import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget.jsx';

export function Header({ weatherData = [], onOpenCV }) {
  const [luckText, setLuckText] = useState('');

  useEffect(() => {
    const fullText = "> LUCK: SYSTEM OPTIMAL. MAY YOUR BANDS BE WIDE AND YOUR LATENCY LOW.";
    let i = 0;
    const timer = setInterval(() => {
      setLuckText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col px-6 md:px-10 pt-8 pb-4 shrink-0 gap-4">
      <div className="flex justify-between items-center w-full">
        <div>
          <h2 className="font-vt323 text-2xl md:text-3xl text-white tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            Hello, Tiago
          </h2>
          <div className="font-silkscreen text-[0.65rem] md:text-xs text-neon-cyan mt-1 uppercase tracking-wider drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]">
            Command Center
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <WeatherWidget weatherData={weatherData} />
          
          <button 
            onClick={onOpenCV} 
            className="w-10 h-10 bg-black/40 border border-neon-purple/50 rounded-lg flex items-center justify-center text-neon-purple hover:bg-neon-purple/20 transition-colors shadow-[0_0_12px_rgba(167,139,250,0.3)] cursor-pointer"
            title="View Architect Profile"
          >
            <User size={18} className="pixel-icon" />
          </button>
        </div>
      </div>

      <div className="mt-2 w-full">
        <div className="font-pixel text-xs md:text-sm text-neon-green/90 leading-loose tracking-widest break-words drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]">
          {luckText}
          <span className="inline-block w-2.5 h-3.5 bg-neon-green ml-2 animate-pulse align-middle shadow-[0_0_10px_#22c55e]"></span>
        </div>
      </div>
    </header>
  );
}
