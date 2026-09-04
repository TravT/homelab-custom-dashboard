import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { Activity, Zap, HardDrive } from 'lucide-react';
import { GraphBox } from './GraphBox.jsx';
import { FlipCard } from './FlipCard.jsx';
import { SegmentedBar } from './SegmentedBar.jsx';

export function HardwareMetrics({
  graphData = [],
  cpuTemp = 50,
  batteryStats = { percent: 100, plugged: true },
  storageStats = {
    nvme: { total_gb: 465.4, used_gb: 223.1, percent: 47.9 },
    gdrive: { total_tb: 5.0, used_tb: 0.65, percent: 13.0 }
  },
  diskIOVal = { val: '0.0', unit: 'MB/s' },
  nvmeActive = false,
  gdriveActive = false
}) {
  const [isFlippedNetwork, setIsFlippedNetwork] = useState(false);
  const [isFlippedStorage, setIsFlippedStorage] = useState(false);

  const lastPoint = graphData[graphData.length - 1] || { cpu: 0, ram: 0, lan: 0 };

  return (
    <section>
      <div className="font-vt323 text-xl md:text-2xl text-gray-400 tracking-wider mb-4 uppercase flex items-center gap-2.5">
        <span className="text-neon-purple opacity-50">//</span> SYSTEM METRICS
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* 1. Processor Sparkline */}
        <GraphBox 
          title="Processor" 
          value={`${Math.round(lastPoint.cpu)}%`} 
          dataKey="cpu" 
          color="#38bdf8" 
          colorEnd="#0284c7" 
          data={graphData} 
          yDomain={[0, dataMax => Math.max(25, Math.ceil(dataMax * 1.35))]} 
        />

        {/* 2. Memory Sparkline */}
        <GraphBox 
          title="Memory" 
          value={`${lastPoint.ram.toFixed(1)} GB`} 
          dataKey="ram" 
          color="#a78bfa" 
          colorEnd="#7e22ce" 
          data={graphData} 
          yDomain={[dataMin => Math.max(0, Math.floor(dataMin * 0.85)), dataMax => Math.ceil(dataMax * 1.15)]} 
        />
        
        {/* 3. Network I/O / Server Health FlipCard */}
        <FlipCard 
          isFlipped={isFlippedNetwork} 
          onClick={() => setIsFlippedNetwork(!isFlippedNetwork)}
          front={
            <div className="bg-cyber-card/80 backdrop-blur-md p-5 md:p-6 rounded-xl border border-white/5 relative group overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-full min-h-[140px] md:min-h-[160px]">
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="text-xs font-silkscreen text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Network I/O
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-1.5 h-1.5 bg-neon-green shadow-[0_0_6px_#22c55e]"></div>
                      <div className="w-1.5 h-1.5 bg-neon-purple shadow-[0_0_6px_#a78bfa]"></div>
                    </div>
                  </div>
                  <div className="font-pixel text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] flex items-baseline">
                    {lastPoint.lan.toFixed(2)} <span className="font-pixel text-2xl text-white ml-2">MB/s</span>
                  </div>
                </div>
                <div className="pixel-icon opacity-50 text-neon-green"><Activity size={20} /></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-28 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={[0, dataMax => Math.max(0.05, Math.ceil(dataMax * 1.35 * 100) / 100)]} hide />
                    <Area type="monotone" isAnimationActive={false} dataKey="lan" stroke="#22c55e" fillOpacity={1} fill="url(#colorLan)" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 6px #22c55e)' }} />
                    <Area type="monotone" isAnimationActive={false} dataKey="tailscale" stroke="#a78bfa" fillOpacity={1} fill="url(#colorTail)" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 6px #a78bfa)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          }
          back={
            <div className="bg-cyber-card/90 backdrop-blur-md p-5 md:p-6 rounded-xl border border-neon-red/40 shadow-[0_0_30px_rgba(244,63,94,0.15)] flex flex-col justify-between h-full min-h-[140px] md:min-h-[160px] relative overflow-hidden group">
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="text-xs font-silkscreen text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Server Health <Zap size={12} className="text-neon-cyan" />
                  </div>
                  <div className="font-pixel text-xl md:text-2xl text-neon-red drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                    {cpuTemp}°<span className="text-sm text-neon-red">C</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-pixel text-[0.55rem] md:text-[0.65rem] text-neon-green mb-1.5 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]">
                    {batteryStats.plugged ? 'AC POWER' : 'BATTERY'}
                  </div>
                  <div className="font-pixel text-xl md:text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                    {batteryStats.percent}<span className="text-sm">%</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-28 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData} margin={{ top: 0, left: 0, right: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#9f1239" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={[dataMin => Math.max(30, Math.floor(dataMin * 0.9)), dataMax => Math.ceil(dataMax * 1.1)]} hide />
                    <Area type="monotone" isAnimationActive={false} dataKey="temp" stroke="#f43f5e" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px #f43f5e)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          }
        />

        {/* 4. Storage / Disk I/O FlipCard */}
        <FlipCard 
          isFlipped={isFlippedStorage} 
          onClick={() => setIsFlippedStorage(!isFlippedStorage)}
          front={
            <div className="bg-cyber-card/80 backdrop-blur-md p-5 md:p-6 rounded-xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-center gap-6 h-full min-h-[140px] md:min-h-[160px]">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-silkscreen text-gray-400 uppercase tracking-widest">Local NVMe</span>
                    <div className={`w-1.5 h-1.5 bg-neon-cyan rounded-full transition-opacity duration-300 ${nvmeActive ? 'animate-hdd shadow-[0_0_8px_#38bdf8] opacity-100' : 'opacity-30'}`}></div>
                  </div>
                  <span className="text-xs font-pixel text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">{storageStats.nvme.percent}%</span>
                </div>
                <SegmentedBar filled={Math.round(storageStats.nvme.percent / 10)} total={10} colorClass="bg-neon-cyan shadow-[0_0_8px_#38bdf8]" emptyClass="bg-[#27272a]" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-silkscreen text-gray-400 uppercase tracking-widest">Google Drive</span>
                    <div className={`w-1.5 h-1.5 bg-neon-red rounded-full transition-opacity duration-300 ${gdriveActive ? 'animate-hdd-delayed shadow-[0_0_8px_#f43f5e] opacity-100' : 'opacity-30'}`}></div>
                  </div>
                  <span className="text-xs font-pixel text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">{storageStats.gdrive.percent}%</span>
                </div>
                <SegmentedBar filled={Math.max(1, Math.round(storageStats.gdrive.percent / 10))} total={10} colorClass="bg-neon-red shadow-[0_0_8px_#f43f5e]" emptyClass="bg-[#27272a]" />
              </div>
            </div>
          }
          back={
            <GraphBox 
              title="Disk I/O" 
              value={`${diskIOVal.val} ${diskIOVal.unit}`} 
              dataKey="diskIO" 
              color="#f59e0b" 
              colorEnd="#d97706" 
              data={graphData} 
              yDomain={[0, dataMax => Math.max(0.1, Math.ceil(dataMax * 1.35 * 100) / 100)]} 
              icon={<HardDrive size={20} />} 
            />
          }
        />
      </div>
    </section>
  );
}
