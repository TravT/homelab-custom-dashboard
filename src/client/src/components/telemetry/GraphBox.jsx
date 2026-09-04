import React from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { Activity } from 'lucide-react';

export function GraphBox({ title, value, dataKey, color, colorEnd, data, yDomain, icon = <Activity size={20} /> }) {
  return (
    <div className="bg-cyber-card/80 backdrop-blur-md p-5 md:p-6 rounded-xl border border-white/5 relative group overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-full min-h-[140px] md:min-h-[160px]">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="text-xs font-silkscreen text-gray-500 uppercase tracking-widest mb-2">{title}</div>
          <div className="font-pixel text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{value}</div>
        </div>
        <div className="pixel-icon opacity-50" style={{ color: color }}>{icon}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-28 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={colorEnd} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={yDomain} hide />
            <Area 
              type="monotone" 
              isAnimationActive={false} 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#grad${dataKey})`} 
              strokeWidth={2} 
              style={{ filter: `drop-shadow(0 0 8px ${color})` }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
