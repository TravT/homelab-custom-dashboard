import React, { useState, useEffect, useRef } from 'react';
import { FleetNodeCard } from './FleetNodeCard.jsx';

// Default fallback telemetry while loading
const DEFAULT_NODES = {
  dell: {
    id: 'dell_7390',
    name: 'Dell Latitude 7390',
    role: 'PRIMARY NODE // 100.125.7.38',
    ip: '100.125.7.38',
    status: 'online',
    bar1: {
      label: '1. UPS POWER BUFFER',
      value: '100% ⚡ AC ON (~4.5h Outage Runtime Available)',
      subtext: 'Battery Health: 89% (53.4 Wh / 60 Wh)',
      percent: 100,
      colorClass: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    },
    bar2: {
      label: '2. CONTAINER ENGINE DENSITY',
      value: '37 Containers Active • 20 Nomad Jobs (Healthy)',
      subtext: 'Docker 29.7.2 + Nomad 1.8.3 Driver',
      percent: 85,
      colorClass: 'bg-neon-cyan shadow-[0_0_8px_#38bdf8]',
    },
    grid: {
      engine: { label: 'WORKLOAD ENGINE', value: 'Docker 29.7.2' },
      role: { label: 'CLUSTER ROLE', value: 'Nomad Leader (DC1)' },
      strain: { label: 'SYSTEM STRAIN', value: 'Loadavg: 0.24, 0.38, 0.45' },
      access: { label: 'ACCESS CHANNELS', value: 'Traefik (:443) + SSH (:22)' },
    },
  },
  s20fe: {
    id: 's20_fe',
    name: 'Galaxy S20 FE',
    role: 'DEDICATED EDGE // 100.115.165.41',
    ip: '100.115.165.41',
    status: 'online',
    bar1: {
      label: '1. DEVICE BATTERY',
      value: '65% ⚡ (27.3°C)',
      subtext: 'Discharging • Battery Guard Active',
      percent: 65,
      colorClass: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    },
    bar2: {
      label: '2. WI-FI NETWORK',
      value: 'Link301 (-59 dBm, Wi-Fi 6)',
      subtext: 'Link: 432 Mbps • 5GHz Band',
      percent: 85,
      colorClass: 'bg-neon-purple shadow-[0_0_8px_#a78bfa]',
    },
    grid: {
      engine: { label: 'WORKLOAD ENGINE', value: 'Nomad raw_exec (1.8.3)' },
      role: { label: 'CLUSTER ROLE', value: 'Edge Node (DC1 Worker)' },
      strain: { label: 'SYSTEM STRAIN', value: 'Snapdragon 865 • 3.8/6GB RAM' },
      access: { label: 'ACCESS CHANNELS', value: 'Root ADB (:5555) + SSH (:22)' },
    },
  },
  s24ultra: {
    id: 's24_ultra',
    name: 'Galaxy S24 Ultra',
    role: 'DAILY DRIVER // 100.78.115.79',
    ip: '100.78.115.79',
    status: 'standby',
    bar1: {
      label: '1. BATTERY LEVEL',
      value: '65% (Last Known - Standby)',
      subtext: 'Standby Cached Telemetry',
      percent: 65,
      colorClass: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    },
    bar2: {
      label: '2. WI-FI NETWORK',
      value: 'Link301 (Standby Sleep)',
      subtext: 'Device asleep / Screen locked',
      percent: 50,
      colorClass: 'bg-gray-600',
    },
    grid: {
      engine: { label: 'WORKLOAD ENGINE', value: 'Termux-API (Daemon)' },
      role: { label: 'CLUSTER ROLE', value: 'Mobile Node (Direct)' },
      strain: { label: 'SYSTEM STRAIN', value: 'Standby (Screen Off)' },
      access: { label: 'ACCESS CHANNELS', value: 'Tailscale SSH (:8022)' },
    },
  },
};

export function FleetTelemetry() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickStatus, setQuickStatus] = useState({ dell: 'online', s20fe: 'online', s24ultra: 'standby' });
  const [telemetry, setTelemetry] = useState(DEFAULT_NODES);
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const carouselRef = useRef(null);

  // 1. Single initial query on page load: queries node reachability for the 3 header balls
  useEffect(() => {
    let isMounted = true;
    async function fetchInitialStatus() {
      try {
        const res = await fetch('/api/fleet/status');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data?.nodes) {
            setQuickStatus(data.nodes);
          }
        }
      } catch (err) {
        console.warn('Initial fleet status query deferred:', err);
      }
    }
    fetchInitialStatus();
    return () => { isMounted = false; };
  }, []);

  // 2. Conditional telemetry polling: ONLY active when expanded
  useEffect(() => {
    if (!isExpanded) return;

    let isMounted = true;
    async function fetchFullTelemetry() {
      try {
        const res = await fetch('/api/fleet/telemetry');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data?.nodes) {
            setTelemetry(data.nodes);
          }
        }
      } catch (err) {
        console.warn('Fleet telemetry fetch error:', err);
      }
    }

    // Immediate fetch upon expansion
    fetchFullTelemetry();

    // 10s poll cycle while expanded
    const interval = setInterval(fetchFullTelemetry, 10000);
    return () => clearInterval(interval);
  }, [isExpanded]);

  // Track horizontal swipe in mobile carousel
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, offsetWidth } = carouselRef.current;
    if (offsetWidth > 0) {
      const idx = Math.round(scrollLeft / offsetWidth);
      setActiveMobileIdx(Math.min(2, Math.max(0, idx)));
    }
  };

  const scrollToNode = (index) => {
    setActiveMobileIdx(index);
    if (!carouselRef.current) return;
    const width = carouselRef.current.offsetWidth;
    carouselRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
  };

  return (
    <section className="transition-all duration-300">
      {/* ULTRA-SLIM ACCORDION HEADER (STARTS CONTRACTED) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click to toggle Fleet Nodes"
        className={`w-full bg-[#0d0d14]/60 hover:bg-[#12121e]/80 border transition-all duration-200 cursor-pointer flex items-center justify-between px-4 py-2 select-none shadow-[0_2px_8px_rgba(0,0,0,0.3)] ${
          isExpanded
            ? 'rounded-t-xl border-neon-cyan/40 border-b-transparent bg-[#0d0d16]'
            : 'rounded-xl border-white/5 hover:border-neon-cyan/30'
        }`}
      >
        {/* Left: Title + 3 Node Status Balls */}
        <div className="flex items-center gap-2.5">
          <div className="font-vt323 text-lg md:text-xl text-neon-cyan tracking-wider flex items-center gap-1.5">
            <span className="text-neon-cyan opacity-50">//</span> FLEET NODES
          </div>

          {/* The 3 status balls: Dell, S20 FE, S24 Ultra */}
          <div className="flex items-center gap-1.5 ml-1">
            {/* Dell 7390 Ball */}
            <span
              title="Dell Latitude 7390: Online"
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                quickStatus.dell === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-gray-500'
              } ${isExpanded ? 'animate-slow-ball' : ''}`}
            />

            {/* S20 FE Ball */}
            <span
              title={`Galaxy S20 FE: ${quickStatus.s20fe}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                quickStatus.s20fe === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
              } ${isExpanded ? 'animate-slow-ball' : ''}`}
            />

            {/* S24 Ultra Ball */}
            <span
              title={`Galaxy S24 Ultra: ${quickStatus.s24ultra}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                quickStatus.s24ultra === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : quickStatus.s24ultra === 'standby'
                  ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                  : 'bg-gray-500'
              } ${isExpanded ? 'animate-slow-ball' : ''}`}
            />
          </div>
        </div>

        {/* Right: Expand / Collapse Button (Guaranteed Never to Wrap) */}
        <div className="whitespace-nowrap flex-shrink-0 min-w-[85px] text-right font-silkscreen text-[10px] tracking-wider text-neon-cyan">
          {isExpanded ? (
            <span className="text-neon-purple">[ ▲ COLLAPSE ]</span>
          ) : (
            <span className="hover:text-white transition-colors">[ ▼ EXPAND ]</span>
          )}
        </div>
      </div>

      {/* EXPANDED CONTENT DRAWER */}
      {isExpanded && (
        <div className="bg-[#0a0a10]/95 border border-neon-cyan/40 border-t-0 rounded-b-xl p-4 md:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.8)] transition-all duration-300">
          {/* MOBILE NAVIGATION PILLS - PLACED AT THE TOP (Matching ActiveServices layout) */}
          <div className="flex md:hidden justify-center items-center gap-2 mb-3.5">
            <button
              onClick={() => scrollToNode(0)}
              className={`px-3 py-1 rounded-full text-xs font-vt323 border transition-all flex items-center gap-1.5 ${
                activeMobileIdx === 0
                  ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'bg-white/[0.02] border-white/10 text-gray-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399]" />
              💻 DELL 7390
            </button>

            <button
              onClick={() => scrollToNode(1)}
              className={`px-3 py-1 rounded-full text-xs font-vt323 border transition-all flex items-center gap-1.5 ${
                activeMobileIdx === 1
                  ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'bg-white/[0.02] border-white/10 text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  quickStatus.s20fe === 'online' ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-amber-400'
                }`}
              />
              📱 S20 FE
            </button>

            <button
              onClick={() => scrollToNode(2)}
              className={`px-3 py-1 rounded-full text-xs font-vt323 border transition-all flex items-center gap-1.5 ${
                activeMobileIdx === 2
                  ? 'bg-neon-cyan/20 border-neon-cyan text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                  : 'bg-white/[0.02] border-white/10 text-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  quickStatus.s24ultra === 'online'
                    ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]'
                    : 'bg-amber-400 shadow-[0_0_4px_#fbbf24]'
                }`}
              />
              📲 S24 ULTRA
            </button>
          </div>

          {/* DESKTOP 3-COL GRID & MOBILE TOUCH SNAP CAROUSEL */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar"
          >
            {/* 1. Dell Latitude 7390 */}
            <div className="w-full min-w-full md:min-w-0 snap-center">
              <FleetNodeCard
                node={telemetry.dell}
                icon="💻"
                cardColor="#38bdf8"
                isBreathing={isExpanded}
              />
            </div>

            {/* 2. Galaxy S20 FE Edge */}
            <div className="w-full min-w-full md:min-w-0 snap-center">
              <FleetNodeCard
                node={telemetry.s20fe}
                icon="📱"
                cardColor="#a78bfa"
                isBreathing={isExpanded}
              />
            </div>

            {/* 3. Galaxy S24 Ultra Daily Driver */}
            <div className="w-full min-w-full md:min-w-0 snap-center md:col-span-2 lg:col-span-1">
              <FleetNodeCard
                node={telemetry.s24ultra}
                icon="📲"
                cardColor={quickStatus.s24ultra === 'online' ? '#22c55e' : '#f59e0b'}
                isBreathing={isExpanded}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
