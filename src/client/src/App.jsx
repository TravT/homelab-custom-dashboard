import React, { useState, useEffect } from 'react';
import { useDashboardState } from './hooks/useDashboardState.jsx';
import { useWeather } from './hooks/useWeather.js';
import { useServicePinger } from './hooks/useServicePinger.js';

import { Header } from './components/common/Header.jsx';
import { Sidebar } from './components/common/Sidebar.jsx';
import { HardwareMetrics } from './components/telemetry/HardwareMetrics.jsx';
import { FleetTelemetry } from './components/telemetry/FleetTelemetry.jsx';
import { ReleaseRadar } from './components/radar/ReleaseRadar.jsx';
import { ActiveServices } from './components/services/ActiveServices.jsx';
import { CVModal } from './components/modals/CVModal.jsx';
import { CalendarModal } from './components/modals/CalendarModal.jsx';
import { SearchModal } from './components/modals/SearchModal.jsx';

import { useDropzone } from './hooks/useDropzone.js';
import { DropzoneModal } from './components/dropzone/DropzoneModal.jsx';
import { GlobalDropOverlay } from './components/dropzone/GlobalDropOverlay.jsx';

/**
 * Homelab Custom Dashboard - Modular Command Center
 * Phase 0 Capstone: Fastify BFF + Modular React Architecture
 */
export default function App() {
  const [showCV, setShowCV] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 0. Dropzone (AirDrop / Ephemeral File Transfer)
  const dropzone = useDropzone();

  // 1. BFF Telemetry & State Stream
  const {
    graphData,
    cpuTemp,
    batteryStats,
    storageStats,
    diskIOVal,
    nvmeActive,
    gdriveActive,
    releaseData,
    rawReleases,
    serviceHealth,
    setServiceHealth,
  } = useDashboardState();

  // 2. Weather Stream (Open-Meteo)
  const weatherData = useWeather();

  // 3. Background LAN Reachability Pinger
  useServicePinger(setServiceHealth);

  // Auto-hide navigation bar on scroll
  useEffect(() => {
    const handleScroll = (e) => {
      const currentScrollY = e.target.scrollTop;
      if (currentScrollY > lastScrollY + 10) setIsNavOpen(false);
      else if (currentScrollY < lastScrollY - 10) setIsNavOpen(true);
      setLastScrollY(currentScrollY);
    };
    const scrollContainer = document.getElementById('main-scroll');
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className="flex min-h-screen text-gray-200 selection:bg-neon-purple/30 pb-4 md:pb-0 relative overflow-hidden bg-[#0a0a0c]"
      style={{ 
        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }}
    >
      <style>{`
        @keyframes hddBlink {
          0%, 100% { opacity: 0.1; }
          10%, 30% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
          20%, 40% { opacity: 0.2; filter: none; }
          50%, 90% { opacity: 0.1; filter: none; }
        }
        .animate-hdd { animation: hddBlink 1.5s infinite; }
        .animate-hdd-delayed { animation: hddBlink 1.8s infinite 0.7s; }

        @keyframes calendarGlow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.4));
            opacity: 0.75;
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 16px rgba(56, 189, 248, 0.5));
            opacity: 1;
          }
        }
        .animate-calendar-glow {
          animation: calendarGlow 2s ease-in-out infinite;
        }

        @keyframes marqueeScroll {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 45s linear infinite;
          will-change: transform;
        }
        .animate-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* MODALS */}
      <CVModal isOpen={showCV} onClose={() => setShowCV(false)} />
      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} rawReleases={rawReleases} />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      
      {/* DROPZONE MODAL & RADAR OVERLAY */}
      <DropzoneModal 
        isOpen={dropzone.isOpen}
        onClose={dropzone.closeDropzone}
        activeTab={dropzone.activeTab}
        onTabChange={dropzone.setActiveTab}
        activeDrops={dropzone.activeDrops}
        uploadProgress={dropzone.uploadProgress}
        isUploading={dropzone.isUploading}
        latestDrop={dropzone.latestDrop}
        uploadError={dropzone.uploadError}
        stagedFile={dropzone.stagedFile}
        onUpload={dropzone.uploadFile}
        onDeleteDrop={dropzone.deleteDrop}
        onResetUpload={dropzone.resetUpload}
      />
      <GlobalDropOverlay isDragging={dropzone.isDraggingGlobal} />

      {/* DESKTOP SIDEBAR & MOBILE NAVIGATION */}
      <Sidebar 
        isNavOpen={isNavOpen} 
        onToggleNav={() => setIsNavOpen(!isNavOpen)} 
        onOpenSearch={() => setShowSearch(true)} 
        onOpenDropzone={() => dropzone.openDropzone('upload')}
      />

      {/* MAIN CONTENT AREA */}
      <main id="main-scroll" className="flex-1 flex flex-col h-screen overflow-y-auto w-full md:pl-20 no-scrollbar scroll-smooth relative z-10">
        <Header weatherData={weatherData} onOpenCV={() => setShowCV(true)} />

        <div className="flex-1 px-6 md:px-10 pb-28 pt-2 space-y-8 md:space-y-10">
          <HardwareMetrics 
            graphData={graphData} 
            cpuTemp={cpuTemp} 
            batteryStats={batteryStats} 
            storageStats={storageStats} 
            diskIOVal={diskIOVal} 
            nvmeActive={nvmeActive} 
            gdriveActive={gdriveActive} 
          />

          <FleetTelemetry />

          <ReleaseRadar 
            releaseData={releaseData} 
            onOpenCalendar={() => setShowCalendar(true)} 
          />

          <ActiveServices 
            serviceHealth={serviceHealth} 
          />
        </div>
      </main>
    </div>
  );
}
