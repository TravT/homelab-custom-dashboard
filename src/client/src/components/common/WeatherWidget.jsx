import React from 'react';
import { getDisplayClass } from '../../data/weatherConfig.jsx';

export function WeatherWidget({ weatherData = [] }) {
  return (
    <div className="flex items-center gap-3 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
      <div className="font-silkscreen text-[0.55rem] md:text-[0.65rem] text-gray-400 tracking-widest uppercase mr-2 hidden sm:block">
        Rio, RJ
      </div>
      {weatherData.map((w, idx) => (
        <div key={idx} className={`flex-col items-center gap-0.5 ${getDisplayClass(idx)}`}>
          <span className="font-pixel text-[0.45rem] text-gray-500">{w.day}</span>
          <div className="flex items-center gap-1 text-gray-300">
            <div className="pixel-icon">{w.icon}</div>
            <span className="font-pixel text-[0.65rem] text-white">{w.temp}°</span>
          </div>
        </div>
      ))}
    </div>
  );
}
