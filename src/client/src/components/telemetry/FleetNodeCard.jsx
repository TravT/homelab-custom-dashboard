import React from 'react';
import { SegmentedBar } from './SegmentedBar.jsx';

/**
 * Symmetrical Node Card for Fleet Deck
 * Uses exact same SegmentedBar component as top Storage Tiering card for 100% visual consistency.
 */
export function FleetNodeCard({ node, icon, cardColor, isBreathing }) {
  if (!node) return null;

  const isOnline = node.status === 'online';
  const isStandby = node.status === 'standby';

  // Calculate 10-step filled count
  const filledBar1 = Math.max(1, Math.min(10, Math.round((node.bar1.percent / 100) * 10)));
  const filledBar2 = Math.max(1, Math.min(10, Math.round((node.bar2.percent / 100) * 10)));

  return (
    <div
      className={`bg-[#0d0d14]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-5 relative overflow-hidden transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] ${
        isBreathing ? 'shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_16px_rgba(56,189,248,0.1)]' : ''
      }`}
      style={{ '--card-color': cardColor }}
    >
      {/* Top Card Neon Glow Line with breathing pulse */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] ${isBreathing ? 'animate-slow-breath' : 'opacity-70'}`}
        style={{
          background: `linear-gradient(90deg, transparent, ${cardColor}, transparent)`,
        }}
      />

      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2.5 items-center">
          <div
            className="w-9 h-9 rounded-lg border flex items-center justify-center text-lg shadow-inner"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-vt323 text-xl md:text-2xl text-white leading-tight tracking-wide">{node.name}</h3>
            <p className="font-silkscreen text-[9px] text-gray-400 tracking-wider uppercase">{node.role}</p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-silkscreen tracking-wider uppercase whitespace-nowrap border ${
            isOnline
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : isStandby
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'bg-gray-700/20 border-gray-600/40 text-gray-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : isStandby ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-gray-400'
            } ${isBreathing ? 'animate-pulse' : ''}`}
          />
          {node.status}
        </span>
      </div>

      {/* Segmented Bar 1 */}
      <div className="mb-3.5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-silkscreen text-[10px] text-gray-400 tracking-wide uppercase">{node.bar1.label}</span>
          <span className="font-vt323 text-lg text-white tracking-wide">{node.bar1.value}</span>
        </div>
        <SegmentedBar 
          filled={filledBar1} 
          total={10} 
          colorClass={node.bar1.colorClass || "bg-emerald-400 shadow-[0_0_8px_#34d399]"} 
          emptyClass="bg-[#27272a]" 
        />
        {node.bar1.subtext && (
          <div className="flex justify-end mt-1">
            <span className="font-silkscreen text-[8.5px] text-gray-500 uppercase tracking-wider">{node.bar1.subtext}</span>
          </div>
        )}
      </div>

      {/* Segmented Bar 2 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-silkscreen text-[10px] text-gray-400 tracking-wide uppercase">{node.bar2.label}</span>
          <span className="font-vt323 text-lg text-white tracking-wide">{node.bar2.value}</span>
        </div>
        <SegmentedBar 
          filled={filledBar2} 
          total={10} 
          colorClass={node.bar2.colorClass || "bg-neon-cyan shadow-[0_0_8px_#38bdf8]"} 
          emptyClass="bg-[#27272a]" 
        />
        {node.bar2.subtext && (
          <div className="flex justify-end mt-1">
            <span className="font-silkscreen text-[8.5px] text-gray-500 uppercase tracking-wider">{node.bar2.subtext}</span>
          </div>
        )}
      </div>

      {/* Symmetrical 2x2 Diagnostics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-lg">
          <div className="font-silkscreen text-[8.5px] text-gray-400 uppercase tracking-wide">{node.grid.engine.label}</div>
          <div className="font-vt323 text-base text-neon-cyan mt-0.5 leading-tight">{node.grid.engine.value}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-lg">
          <div className="font-silkscreen text-[8.5px] text-gray-400 uppercase tracking-wide">{node.grid.role.label}</div>
          <div className="font-vt323 text-base text-emerald-400 mt-0.5 leading-tight">{node.grid.role.value}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-lg">
          <div className="font-silkscreen text-[8.5px] text-gray-400 uppercase tracking-wide">{node.grid.strain.label}</div>
          <div className="font-vt323 text-base text-gray-300 mt-0.5 leading-tight">{node.grid.strain.value}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-lg">
          <div className="font-silkscreen text-[8.5px] text-gray-400 uppercase tracking-wide">{node.grid.access.label}</div>
          <div className="font-vt323 text-base text-purple-400 mt-0.5 leading-tight">{node.grid.access.value}</div>
        </div>
      </div>
    </div>
  );
}
