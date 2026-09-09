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
  Lock,
  Unlock,
  ShieldAlert,
  HardDriveDownload,
  RefreshCw,
  Camera,
  Moon,
  Search,
  Sparkles,
  Wifi,
  Activity,
  Send,
  ExternalLink,
} from 'lucide-react';
import { ActionCard } from './ActionCard.jsx';
import { ActionLogFeed } from './ActionLogFeed.jsx';
import {
  dispatchClusterAction,
  getStoredActionPin,
  verifyActionPin,
  clearStoredActionPin,
} from '../../services/actionsApi.js';

export function ActionConsoleDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'mobile' | 'media' | 'network'
  const [logs, setLogs] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(() => Boolean(getStoredActionPin()));
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCheckingPin, setIsCheckingPin] = useState(false);

  // Sync authorization state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAuthorized(Boolean(getStoredActionPin()));
      setPinError('');
    }
  }, [isOpen]);

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

  const handleVerifyPin = async () => {
    if (!pinInput.trim()) return;
    setIsCheckingPin(true);
    setPinError('');
    const res = await verifyActionPin(pinInput.trim());
    setIsCheckingPin(false);

    if (res.success) {
      setIsAuthorized(true);
      setPinInput('');
      addLog('✓ Session authenticated with valid Action PIN.', 'success');
    } else {
      setPinError(res.message || 'Invalid Action PIN. Access Denied.');
    }
  };

  const handleLock = () => {
    clearStoredActionPin();
    setIsAuthorized(false);
    addLog('▶ Action session locked.', 'info');
  };

  // Action Dispatchers
  const handleJellyfinScan = async () => {
    addLog('▶ Triggering Jellyfin library scan...', 'info');
    const res = await dispatchClusterAction('/media/scan-jellyfin');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleBazarrSync = async () => {
    addLog('▶ Requesting Bazarr subtitle search & Sonarr sync...', 'info');
    const res = await dispatchClusterAction('/media/sync-subtitles');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleMaintainerrClean = async () => {
    addLog('▶ Running Maintainerr watched collection cleanup...', 'info');
    const res = await dispatchClusterAction('/media/clean-watched');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleSendClipboard = async (text) => {
    addLog(`▶ Sending text to Galaxy S24 Ultra clipboard (${text?.length || 0} chars)...`, 'info');
    const res = await dispatchClusterAction('/phone/clipboard', { text });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleSpeakTTS = async (message, target = 's24') => {
    const targetLabel = target === 'both' ? 'S24 Ultra & S20 FE' : target === 's20' ? 'S20 FE' : 'S24 Ultra';
    addLog(`▶ Broadcasting TTS announcement to ${targetLabel}...`, 'info');
    const res = await dispatchClusterAction('/phone/tts', { message, target });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handlePingPhone = async () => {
    addLog('▶ Sending alarm & vibration pulse to locate S24 Ultra...', 'info');
    const res = await dispatchClusterAction('/phone/ping');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleUnlockS20Screen = async () => {
    addLog('▶ Waking display & dismissing keyguard on S20 FE via root ADB...', 'info');
    const res = await dispatchClusterAction('/phone/screen', { state: 'unlock' });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleToggleS20Screen = async (state = 'toggle') => {
    addLog(`▶ Dispatching S20 FE screen power command (${state})...`, 'info');
    const res = await dispatchClusterAction('/phone/screen', { state });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleToggleTurtleMode = async (state = 'toggle') => {
    const label = state === 'enable' ? 'enabling throttle' : state === 'disable' ? 'disabling throttle' : 'toggling';
    addLog(`▶ Updating qBittorrent speed limits mode (${label})...`, 'info');
    const res = await dispatchClusterAction('/media/turtle-mode', { state });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handlePausePihole = async (durationStr = '300') => {
    const duration = parseInt(durationStr, 10);
    const actionLabel = duration > 0 ? `pausing for ${Math.round(duration / 60)}m` : 're-enabling';
    addLog(`▶ Updating Pi-hole ad-blocking (${actionLabel})...`, 'info');
    const res = await dispatchClusterAction('/network/pihole/pause', { duration });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleUpdateGravity = async () => {
    addLog('▶ Pulling latest ad & malware blocklists into Pi-hole gravity...', 'info');
    const res = await dispatchClusterAction('/network/pihole/gravity');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleTriggerBackup = async () => {
    addLog('▶ Triggering on-demand Google Drive cloud backup snapshot...', 'info');
    const res = await dispatchClusterAction('/system/backup');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleS20Snapshot = async () => {
    addLog('▶ Capturing S20 FE live display frame to Dropzone...', 'info');
    const res = await dispatchClusterAction('/phone/s20/snapshot');
    if (res.needsPin) setIsAuthorized(false);
    if (res.success && res.details?.downloadUrl) {
      addLog(`✓ Snapshot saved! Preview: ${res.details.downloadUrl}`, 'success');
    } else {
      addLog(res.message, res.success ? 'success' : 'error');
    }
    return res;
  };

  const handleNightStandby = async (target = 's20') => {
    const targetLabel = target === 'both' ? 'S20 FE & S24 Ultra' : target === 's24' ? 'S24 Ultra' : 'S20 FE';
    addLog(`▶ Engaging Night Standby for ${targetLabel}...`, 'info');
    const res = await dispatchClusterAction('/phone/standby', { target });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleMissingHunt = async (target = 'both') => {
    const targetLabel = target === 'sonarr' ? 'Sonarr (TV)' : target === 'radarr' ? 'Radarr (Movies)' : 'both Sonarr & Radarr';
    addLog(`▶ Triggering missing media hunt across indexers for ${targetLabel}...`, 'info');
    const res = await dispatchClusterAction('/media/missing-hunt', { target });
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handlePurgeStalled = async () => {
    addLog('▶ Checking qBittorrent queue for stalled 0-seed torrents...', 'info');
    const res = await dispatchClusterAction('/media/purge-stalled');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleClearTranscodeCache = async () => {
    addLog('▶ Sweeping Jellyfin transcode segment cache...', 'info');
    const res = await dispatchClusterAction('/media/clear-cache');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleProwlarrSync = async () => {
    addLog('▶ Testing Prowlarr indexer health and syncing to Servarr apps...', 'info');
    const res = await dispatchClusterAction('/network/prowlarr/audit-sync');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleTailscaleProbe = async () => {
    addLog('▶ Probing Tailscale WireGuard mesh latency between nodes...', 'info');
    const res = await dispatchClusterAction('/network/tailscale/probe');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  const handleN8nDiagnostic = async () => {
    addLog('▶ Firing n8n cluster diagnostic webhook to Telegram...', 'info');
    const res = await dispatchClusterAction('/system/n8n/diagnostic');
    if (res.needsPin) setIsAuthorized(false);
    addLog(res.message, res.success ? 'success' : 'error');
    return res;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* MOBILE BOTTOM SHEET (<640px) MORPHS TO CENTERED MODAL ON TABLET/PC (>=640px) */}
      <div className="fixed inset-x-0 bottom-0 sm:static w-full sm:max-w-xl md:max-w-2xl bg-[#09090d]/98 backdrop-blur-2xl border-t-2 border-neon-cyan/50 sm:border sm:border-neon-cyan/40 sm:rounded-2xl shadow-[0_-16px_50px_rgba(0,0,0,0.95)] sm:shadow-[0_0_60px_rgba(56,189,248,0.25)] rounded-t-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* MOBILE TOUCH DRAG HANDLE */}
        <div className="sm:hidden flex items-center justify-center pt-2.5 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1 bg-white/20 rounded-full"></div>
        </div>

        {/* MODAL HEADER */}
        <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
            <Zap size={22} className="text-neon-cyan pixel-icon shrink-0 animate-pulse" />
            <div className="min-w-0">
              <h2 className="font-vt323 text-xl sm:text-2xl text-white tracking-widest uppercase flex items-center gap-2 truncate">
                <span className="text-neon-cyan opacity-60">//</span> ACTION DISPATCHER
              </h2>
              <div className="font-silkscreen text-[0.6rem] sm:text-[0.7rem] text-neon-cyan/80 uppercase tracking-wider truncate">
                Safe 1-Click Cluster & Mobile Fleet Commands
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthorized && (
              <button
                onClick={handleLock}
                title="Lock Session"
                className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 font-silkscreen text-[9px] uppercase tracking-wider border border-white/10"
              >
                <Unlock size={14} className="text-emerald-400 pixel-icon" />
                <span className="hidden sm:inline text-emerald-400">AUTH OK</span>
              </button>
            )}

            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-neon-cyan hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={20} className="pixel-icon" />
            </button>
          </div>
        </div>

        {/* IF NOT AUTHORIZED: CYBER PIN VERIFICATION LOCK */}
        {!isAuthorized ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 overflow-y-auto">
            <div className="p-4 rounded-xl bg-black/60 border border-neon-cyan/30 shadow-[0_0_24px_rgba(56,189,248,0.2)]">
              <Lock size={32} className="text-neon-cyan pixel-icon animate-pulse" />
            </div>

            <div>
              <div className="font-vt323 text-2xl sm:text-3xl text-white tracking-widest uppercase mb-1">
                // SECURITY ACCESS VERIFICATION
              </div>
              <p className="font-silkscreen text-[0.65rem] sm:text-xs text-gray-400 uppercase tracking-wider max-w-sm mx-auto leading-relaxed">
                Enter Master Action PIN to unlock cluster and mobile fleet command execution
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-xs">
              <input
                type="password"
                maxLength={12}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                placeholder="ENTER PIN..."
                className="w-full px-4 py-2.5 bg-black/80 border border-neon-cyan/40 rounded-lg font-mono text-center text-sm text-neon-cyan tracking-widest placeholder-gray-600 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_14px_rgba(56,189,248,0.4)]"
              />
              <button
                onClick={handleVerifyPin}
                disabled={isCheckingPin || !pinInput.trim()}
                className="w-full sm:w-auto px-5 py-2.5 bg-neon-cyan/20 border border-neon-cyan/60 hover:bg-neon-cyan/30 text-neon-cyan font-silkscreen text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isCheckingPin ? 'CHECKING...' : 'UNLOCK'}
              </button>
            </div>

            {pinError && (
              <div className="font-pixel text-[10px] text-neon-red tracking-wider animate-in fade-in">
                &gt; {pinError}
              </div>
            )}
          </div>
        ) : (
          /* IF AUTHORIZED: FULL ACTION INTERFACE */
          <>
            {/* Category Tabs */}
            <div className="shrink-0 flex items-center px-4 sm:px-6 py-2 gap-2 border-b border-white/10 bg-black/30 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Actions' },
                { id: 'mobile', label: 'Mobile Fleet' },
                { id: 'media', label: 'Media Suite' },
                { id: 'network', label: 'Network & DNS' },
                { id: 'ops', label: 'System Ops' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg font-silkscreen text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                      : 'text-gray-400 hover:text-gray-200 border border-white/5 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Action Cards Container */}
            <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {/* 1. Android Mobile Fleet */}
              {(activeTab === 'all' || activeTab === 'mobile') && (
                <div className="space-y-3">
                  <div className="font-vt323 text-xl text-gray-400 tracking-wider uppercase flex items-center gap-2">
                    <span className="text-neon-purple opacity-50">//</span> MOBILE FLEET (S24 ULTRA & S20 FE)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ActionCard
                      title="Unlock S20 FE Screen"
                      description="Wakes display, dismisses Android keyguard, and executes swipe-up via root ADB."
                      category="android"
                      icon={Unlock}
                      onExecute={handleUnlockS20Screen}
                    />
                    <ActionCard
                      title="Toggle S20 Display"
                      description="Powers display on, off (sleep), or toggles state to protect AMOLED panel."
                      category="android"
                      icon={Power}
                      options={[
                        { id: 'toggle', label: 'Toggle' },
                        { id: 'off', label: 'Sleep' },
                        { id: 'on', label: 'Wake' },
                      ]}
                      defaultOption="toggle"
                      onExecute={handleToggleS20Screen}
                    />
                    <ActionCard
                      title="S20 Screen Snapshot"
                      description="Captures live display frame of S20 FE edge node and uploads to Dropzone."
                      category="android"
                      icon={Camera}
                      onExecute={handleS20Snapshot}
                    />
                    <ActionCard
                      title="Night Standby"
                      description="Blanks display to 0% brightness and engages sleep to prevent OLED burn-in."
                      category="android"
                      icon={Moon}
                      options={[
                        { id: 's20', label: 'S20 FE' },
                        { id: 'both', label: 'Both Nodes' },
                      ]}
                      defaultOption="s20"
                      onExecute={handleNightStandby}
                    />
                    <ActionCard
                      title="Speak Voice Alert"
                      description="Broadcasts spoken announcement over chosen Android hardware speakers."
                      category="android"
                      icon={Volume2}
                      hasInput={true}
                      inputPlaceholder="Type announcement message..."
                      options={[
                        { id: 's24', label: 'S24 Ultra' },
                        { id: 's20', label: 'S20 FE' },
                        { id: 'both', label: 'Both' },
                      ]}
                      defaultOption="s24"
                      onExecute={handleSpeakTTS}
                    />
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
                      title="Ping My Phone"
                      description="Plays an audible tone and vibration pulse on S24 Ultra to locate device."
                      category="android"
                      icon={Smartphone}
                      onExecute={handlePingPhone}
                    />
                  </div>
                </div>
              )}

              {/* 2. Media Suite */}
              {(activeTab === 'all' || activeTab === 'media') && (
                <div className="space-y-3 pt-2">
                  <div className="font-vt323 text-xl text-gray-400 tracking-wider uppercase flex items-center gap-2">
                    <span className="text-neon-green opacity-50">//</span> MEDIA AUTOMATION
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
                      title="Hunt Missing Media"
                      description="Commands Sonarr & Radarr to actively scan indexers for monitored missing media."
                      category="media"
                      icon={Search}
                      options={[
                        { id: 'both', label: 'Both' },
                        { id: 'sonarr', label: 'TV (Sonarr)' },
                        { id: 'radarr', label: 'Movies (Radarr)' },
                      ]}
                      defaultOption="both"
                      onExecute={handleMissingHunt}
                    />
                    <ActionCard
                      title="Prune Watched"
                      description="Executes Maintainerr rules to safely delete media watched by user after 7 days."
                      category="media"
                      icon={Trash2}
                      onExecute={handleMaintainerrClean}
                    />
                    <ActionCard
                      title="Torrent Turtle Mode"
                      description="Limits download/upload bandwidth in qBittorrent to prevent latency spikes."
                      category="media"
                      icon={Zap}
                      options={[
                        { id: 'enable', label: 'Throttle (On)' },
                        { id: 'disable', label: 'Unlimited (Off)' },
                        { id: 'toggle', label: 'Toggle' },
                      ]}
                      defaultOption="toggle"
                      onExecute={handleToggleTurtleMode}
                    />
                    <ActionCard
                      title="Purge Stalled Torrents"
                      description="Scans queue and removes stalled torrents with 0 seeds (preserves files)."
                      category="media"
                      icon={Trash2}
                      onExecute={handlePurgeStalled}
                    />
                    <ActionCard
                      title="Clear Transcode Cache"
                      description="Purges temporary playback segments in Jellyfin to reclaim NVMe storage."
                      category="media"
                      icon={Sparkles}
                      onExecute={handleClearTranscodeCache}
                    />
                  </div>
                </div>
              )}

              {/* 3. Network & DNS */}
              {(activeTab === 'all' || activeTab === 'network') && (
                <div className="space-y-3 pt-2">
                  <div className="font-vt323 text-xl text-gray-400 tracking-wider uppercase flex items-center gap-2">
                    <span className="text-neon-cyan opacity-50">//</span> NETWORK & DNS GOVERNANCE
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ActionCard
                      title="Pause Ad-Blocking"
                      description="Temporarily disables Pi-hole DNS ad filtering to allow shopping or affiliate links."
                      category="network"
                      icon={ShieldAlert}
                      options={[
                        { id: '300', label: '5 Min' },
                        { id: '900', label: '15 Min' },
                        { id: '0', label: 'Resume Now' },
                      ]}
                      defaultOption="300"
                      onExecute={handlePausePihole}
                    />
                    <ActionCard
                      title="Update Gravity Blocklists"
                      description="Forces Pi-hole to pull newest malware & telemetry adlists and rebuild gravity index."
                      category="network"
                      icon={RefreshCw}
                      onExecute={handleUpdateGravity}
                    />
                    <ActionCard
                      title="Prowlarr Indexer Health"
                      description="Tests all indexer proxies and syncs updated tracker configurations to Sonarr & Radarr."
                      category="network"
                      icon={Activity}
                      onExecute={handleProwlarrSync}
                    />
                    <ActionCard
                      title="Tailscale Latency Probe"
                      description="Pings S20 FE and S24 Ultra to verify Direct WireGuard P2P latency."
                      category="network"
                      icon={Wifi}
                      onExecute={handleTailscaleProbe}
                    />
                  </div>
                </div>
              )}

              {/* 4. System Maintenance & Ops */}
              {(activeTab === 'all' || activeTab === 'ops') && (
                <div className="space-y-3 pt-2">
                  <div className="font-vt323 text-xl text-gray-400 tracking-wider uppercase flex items-center gap-2">
                    <span className="text-amber-400 opacity-50">//</span> SYSTEM MAINTENANCE & OPS
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ActionCard
                      title="Cloud Backup Snapshot"
                      description="Triggers offsite backup of application configs and databases to Google Drive via rclone."
                      category="media"
                      icon={HardDriveDownload}
                      onExecute={handleTriggerBackup}
                    />
                    <ActionCard
                      title="Trigger n8n Diagnostic"
                      description="Fires diagnostic workflow compiling cluster telemetry and alerts Telegram."
                      category="media"
                      icon={Send}
                      onExecute={handleN8nDiagnostic}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Log Feed Footer */}
            <div className="shrink-0 p-3 sm:p-4 border-t border-white/10 bg-black/60 pb-safe">
              <ActionLogFeed logs={logs} onClear={clearLogs} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
