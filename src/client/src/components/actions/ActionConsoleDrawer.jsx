import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Tv,
  Subtitles,
  Trash2,
  ClipboardCopy,
  Volume2,
  Smartphone,
  Power,
  RotateCcw,
} from 'lucide-react';
import { ActionCard } from './ActionCard.jsx';
import { ActionLogFeed } from './ActionLogFeed.jsx';
import { dispatchClusterAction } from '../../services/actionsApi.js';

export function ActionConsoleDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'media' | 'android' | 'cluster'
  const [logs, setLogs] = useState([]);

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const addLog = (message, status = 'success') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev.slice(-49), { time, message, status }]);
  };

  const clearLogs = () => setLogs([]);

  // Action Dispatchers
  const handleJellyfinScan = async () => {
    addLog('▶ Triggering Jellyfin library scan...', 'info');
    const res = await dispatchClusterAction('/media/scan-jellyfin');
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleBazarrSync = async () => {
    addLog('▶ Requesting Bazarr subtitle search & Sonarr sync...', 'info');
    const res = await dispatchClusterAction('/media/sync-subtitles');
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleMaintainerrClean = async () => {
    addLog('▶ Running Maintainerr watched collection cleanup...', 'info');
    const res = await dispatchClusterAction('/media/clean-watched');
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleSendClipboard = async (text) => {
    addLog(`▶ Sending text to Galaxy S24 Ultra clipboard (${text?.length || 0} chars)...`, 'info');
    const res = await dispatchClusterAction('/phone/clipboard', { text });
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleSpeakTTS = async (message) => {
    addLog(`▶ Broadcasting TTS message to S24 Ultra speaker...`, 'info');
    const res = await dispatchClusterAction('/phone/tts', { message });
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handlePingPhone = async () => {
    addLog('▶ Sending alarm & vibration pulse to locate S24 Ultra...', 'info');
    const res = await dispatchClusterAction('/phone/ping');
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleToggleS20Screen = async () => {
    addLog('▶ Toggling Galaxy S20 FE display power via root ADB...', 'info');
    const res = await dispatchClusterAction('/phone/screen', { state: 'toggle' });
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleRestartJob = async (job) => {
    addLog(`▶ Requesting Nomad in-place allocation restart for '${job}'...`, 'info');
    const res = await dispatchClusterAction('/cluster/restart-job', { job });
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-xl bg-[#09090c]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col h-full animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <Zap size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wider flex items-center gap-2">
                  ACTION DISPATCHER
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    BFF RPC
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Safe 1-click cluster & mobile device commands</p>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Close Drawer (Esc)"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex px-5 pt-3 pb-2 gap-2 border-b border-white/5 bg-slate-950/20 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Actions' },
              { id: 'media', label: 'Media Suite' },
              { id: 'android', label: 'Mobile Fleet' },
              { id: 'cluster', label: 'Cluster Containers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Cards Container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {/* 1. Media Suite */}
            {(activeTab === 'all' || activeTab === 'media') && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-amber-400/80 uppercase tracking-widest px-1">
                  Media Automation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ActionCard
                    title="Scan Jellyfin"
                    description="Triggers immediate library scan to index newly downloaded movies and episodes."
                    category="media"
                    icon={Tv}
                    onExecute={handleJellyfinScan}
                  />
                  <ActionCard
                    title="Sync Subtitles"
                    description="Forces Bazarr to sync series and search missing subtitles via upstream providers."
                    category="media"
                    icon={Subtitles}
                    onExecute={handleBazarrSync}
                  />
                  <ActionCard
                    title="Prune Watched"
                    description="Executes Maintainerr rules to safely delete media watched by user after 7 days."
                    category="media"
                    icon={Trash2}
                    onExecute={handleMaintainerrClean}
                  />
                </div>
              </div>
            )}

            {/* 2. Android Mobile Fleet */}
            {(activeTab === 'all' || activeTab === 'android') && (
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-mono text-emerald-400/80 uppercase tracking-widest px-1">
                  Mobile Fleet (S24 Ultra & S20 FE)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ActionCard
                    title="Push to Clipboard"
                    description="Sends text directly into Galaxy S24 Ultra clipboard over Tailscale SSH."
                    category="android"
                    icon={ClipboardCopy}
                    hasInput={true}
                    inputPlaceholder="Type text to copy to phone..."
                    onExecute={handleSendClipboard}
                  />
                  <ActionCard
                    title="Speak Voice Alert"
                    description="Broadcasts text-to-speech announcement over S24 Ultra speaker."
                    category="android"
                    icon={Volume2}
                    hasInput={true}
                    inputPlaceholder="Type message to speak..."
                    onExecute={handleSpeakTTS}
                  />
                  <ActionCard
                    title="Ping My Phone"
                    description="Plays an audible tone and vibration pulse on S24 Ultra to locate a misplaced device."
                    category="android"
                    icon={Smartphone}
                    onExecute={handlePingPhone}
                  />
                  <ActionCard
                    title="Toggle S20 FE Screen"
                    description="Toggles physical display on dedicated edge node using root ADB keyevent."
                    category="android"
                    icon={Power}
                    onExecute={handleToggleS20Screen}
                  />
                </div>
              </div>
            )}

            {/* 3. Cluster Containers */}
            {(activeTab === 'all' || activeTab === 'cluster') && (
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-mono text-sky-400/80 uppercase tracking-widest px-1">
                  Nomad Cluster Maintenance
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <ActionCard
                    title="Restart Container Allocation"
                    description="Gracefully restarts tasks inside a selected service allocation in-place via Nomad API."
                    category="cluster"
                    icon={RotateCcw}
                    selectOptions={[
                      'media-server',
                      'downloaders',
                      'servarr',
                      'custom-ws-scrcpy',
                      'dozzle',
                      'uptime-kuma',
                    ]}
                    requireConfirm={true}
                    onExecute={handleRestartJob}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Terminal Log Feed */}
          <div className="p-4 border-t border-white/10 bg-slate-950/60">
            <ActionLogFeed logs={logs} onClear={clearLogs} />
          </div>
        </aside>
      </div>
    </div>
  );
}
