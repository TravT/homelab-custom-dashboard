import React from 'react';
import { Server, Home, Play, Search, Folder, GripHorizontal } from 'lucide-react';

function SidebarIcon({ icon, active, onClick, title }) {
  return (
    <div 
      onClick={onClick}
      title={title}
      className={`relative flex justify-center p-3 cursor-pointer group ${active ? 'text-neon-cyan' : 'text-gray-600 hover:text-gray-300'}`}
    >
      {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-neon-cyan shadow-[0_0_12px_#38bdf8] rounded-r-md"></div>}
      <div className={`pixel-icon transition-transform ${active ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-125' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
    </div>
  );
}

function MobileNavIcon({ icon, active, onClick, title }) {
  return (
    <div 
      onClick={onClick}
      title={title}
      className={`relative flex items-center justify-center p-3.5 cursor-pointer group ${active ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}`}
    >
      {active && (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-neon-cyan shadow-[0_0_8px_#38bdf8] rounded-full"></div>
      )}
      <div className={`pixel-icon transition-transform ${active ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] scale-110' : 'hover:scale-105'}`}>
        {icon}
      </div>
    </div>
  );
}

export function Sidebar({ isNavOpen, onToggleNav, onOpenSearch }) {
  const scrollToTop = () => {
    const el = document.getElementById('main-scroll');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-full w-20 bg-[#08080a]/90 backdrop-blur-2xl flex-col items-center justify-center gap-8 border-r border-white/5 z-50 transition-transform duration-500 ease-in-out ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarIcon 
          icon={<Server size={20} />} 
          active 
          title="Command Center (Top)"
          onClick={scrollToTop}
        />
        <SidebarIcon 
          icon={<Home size={20} />} 
          title="Open Home Assistant"
          onClick={() => window.open('http://homeassistant.home.arpa/', '_blank')}
        />
        <SidebarIcon 
          icon={<Play size={20} />} 
          title="Open RomM Video Game Library"
          onClick={() => window.open('http://romm.home.arpa/', '_blank')}
        />
        <SidebarIcon 
          icon={<Search size={20} />} 
          title="Search Media (Jellyseerr)"
          onClick={onOpenSearch}
        />
        <SidebarIcon 
          icon={<Folder size={20} />} 
          title="Open FileBrowser"
          onClick={() => window.open('http://filebrowser.home.arpa/', '_blank')}
        />
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full transition-transform duration-500 ease-in-out z-50 ${isNavOpen ? 'translate-y-0' : 'translate-y-[calc(100%-1.4rem)]'}`}>
        {/* Centered touch handle tab */}
        <div 
          onClick={onToggleNav} 
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#08080a]/90 backdrop-blur-md border-t border-x border-white/10 rounded-t-xl flex items-center justify-center cursor-pointer text-gray-400 hover:text-neon-cyan transition-colors shadow-[0_-4px_12px_rgba(0,0,0,0.5)]"
        >
          <GripHorizontal size={20} className="pixel-icon drop-shadow-[0_0_6px_rgba(0,0,0,0.8)]" />
        </div>
        <nav className="w-full h-14 bg-[#08080a]/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">
          <MobileNavIcon 
            icon={<Server size={22} />} 
            active 
            title="Command Center"
            onClick={scrollToTop}
          />
          <MobileNavIcon 
            icon={<Home size={22} />} 
            title="Home Assistant"
            onClick={() => window.open('http://homeassistant.home.arpa/', '_blank')}
          />
          <MobileNavIcon 
            icon={<Play size={22} />} 
            title="RomM Library"
            onClick={() => window.open('http://romm.home.arpa/', '_blank')}
          />
          <MobileNavIcon 
            icon={<Search size={22} />} 
            title="Search Media"
            onClick={onOpenSearch}
          />
          <MobileNavIcon 
            icon={<Folder size={22} />} 
            title="FileBrowser"
            onClick={() => window.open('http://filebrowser.home.arpa/', '_blank')}
          />
        </nav>
      </div>
    </>
  );
}
