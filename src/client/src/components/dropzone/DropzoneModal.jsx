import React, { useState, useEffect, useRef } from 'react';
import { 
  X, UploadCloud, Copy, Check, Trash2, Download, 
  Lock, Flame, Clock, GripHorizontal, FileText 
} from 'lucide-react';
import QRCode from 'qrcode';

export function DropzoneModal({
  isOpen,
  onClose,
  activeTab = 'upload',
  onTabChange,
  activeDrops = [],
  uploadProgress = 0,
  isUploading = false,
  latestDrop = null,
  uploadError = null,
  stagedFile = null,
  onUpload,
  onDeleteDrop,
  onResetUpload,
}) {
  const [selectedFile, setSelectedFile] = useState(stagedFile);
  const [ttlMinutes, setTtlMinutes] = useState(1440); // 24 hours default
  const [oneTime, setOneTime] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);
  const qrCanvasRef = useRef(null);

  // Sync staged file from global drag-and-drop
  useEffect(() => {
    if (stagedFile) {
      setSelectedFile(stagedFile);
    }
  }, [stagedFile]);

  // Generate QR Code when latestDrop is available
  useEffect(() => {
    if (latestDrop?.fullUrl && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, latestDrop.fullUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).catch(err => console.error('Failed to render QR Code:', err));
    }
  }, [latestDrop]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartUpload = () => {
    if (!selectedFile || isUploading) return;
    onUpload(selectedFile, {
      ttlMinutes,
      oneTime,
      password: showPasswordInput ? password : '',
    });
  };

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${Math.round(kb)} KB`;
  };

  const formatRemainingTime = (expiresAt) => {
    const remainingMs = new Date(expiresAt).getTime() - Date.now();
    if (remainingMs <= 0) return 'Expired';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours >= 1) return `${hours}h left`;
    const mins = Math.max(1, Math.floor(remainingMs / (1000 * 60)));
    return `${mins}m left`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex sm:items-center sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* MOBILE BOTTOM SHEET (<640px) MORPHS TO CENTERED MODAL ON TABLET/PC (>=640px) */}
      <div className="fixed inset-x-0 bottom-0 sm:static w-full sm:max-w-xl md:max-w-2xl bg-[#09090d]/98 backdrop-blur-2xl border-t-2 border-neon-cyan/50 sm:border sm:border-neon-cyan/40 sm:rounded-2xl shadow-[0_-16px_50px_rgba(0,0,0,0.95)] sm:shadow-[0_0_60px_rgba(56,189,248,0.25)] rounded-t-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* MOBILE TOUCH DRAG HANDLE */}
        <div className="sm:hidden flex items-center justify-center pt-2.5 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1 bg-white/20 rounded-full"></div>
        </div>

        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3 sm:py-4 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <UploadCloud size={24} className="text-neon-cyan pixel-icon shrink-0" />
            <h2 className="font-vt323 text-2xl sm:text-3xl text-white tracking-widest uppercase truncate">
              Homelab Dropzone
            </h2>
          </div>

          {/* SEGMENTED TAB SWITCHER */}
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 gap-1">
            <button
              onClick={() => onTabChange('upload')}
              className={`font-silkscreen text-[0.6rem] sm:text-xs px-3 sm:px-4 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Stage Drop
            </button>
            <button
              onClick={() => onTabChange('active')}
              className={`font-silkscreen text-[0.6rem] sm:text-xs px-3 sm:px-4 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Active
              {activeDrops.length > 0 && (
                <span className="bg-neon-cyan/30 text-white text-[0.55rem] px-1.5 py-0.2 rounded-full font-pixel">
                  {activeDrops.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 ml-2 cursor-pointer"
            title="Close Dropzone"
          >
            <X size={22} className="pixel-icon" />
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 no-scrollbar">

          {/* ==================================================== */}
          {/* TAB 1: STAGE DROP VIEW */}
          {/* ==================================================== */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              {!latestDrop ? (
                <>
                  {/* DROP TARGET ZONE */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neon-cyan/40 hover:border-neon-cyan bg-neon-cyan/[0.03] hover:bg-neon-cyan/[0.07] rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center group shadow-[0_0_20px_rgba(56,189,248,0.05)] hover:shadow-[0_0_30px_rgba(56,189,248,0.15)]"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud size={44} className="text-neon-cyan group-hover:scale-110 transition-transform mb-3 drop-shadow-[0_0_8px_#38bdf8]" />
                    
                    {selectedFile ? (
                      <div className="space-y-1">
                        <div className="font-pixel text-base sm:text-lg text-white break-all">
                          {selectedFile.name}
                        </div>
                        <div className="font-silkscreen text-xs text-neon-cyan">
                          {formatFileSize(selectedFile.size)} &bull; Tap to change file
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="font-pixel text-sm sm:text-base text-white">
                          Tap to browse or drop file here
                        </div>
                        <div className="font-silkscreen text-[0.65rem] text-gray-500">
                          Supports APKs, ROMs, Videos, Archives up to 2GB
                        </div>
                      </div>
                    )}
                  </div>

                  {/* UPLOAD PROGRESS BAR */}
                  {isUploading && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <div className="flex justify-between font-silkscreen text-xs text-gray-400">
                        <span>Uploading file...</span>
                        <span className="text-neon-cyan">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple shadow-[0_0_12px_#38bdf8] transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 rounded-lg bg-neon-red/10 border border-neon-red/30 text-neon-red font-silkscreen text-xs text-center">
                      {uploadError}
                    </div>
                  )}

                  {/* EXPIRATION TTL SELECTOR */}
                  <div className="space-y-2">
                    <label className="font-silkscreen text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={13} className="text-neon-cyan" /> Expiration Retention:
                    </label>
                    <div className="grid grid-cols-4 gap-2 font-silkscreen text-[0.65rem] sm:text-xs">
                      {[
                        { label: '1 HOUR', val: 60 },
                        { label: '24 HOURS', val: 1440 },
                        { label: '7 DAYS', val: 10080 },
                        { label: 'KEEP', val: 43200 },
                      ].map(pill => (
                        <button
                          key={pill.val}
                          type="button"
                          onClick={() => setTtlMinutes(pill.val)}
                          className={`py-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                            ttlMinutes === pill.val
                              ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                              : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ONE-TIME BURN TOGGLE */}
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-neon-red/[0.06] border border-neon-red/30 hover:border-neon-red/60 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oneTime}
                      onChange={(e) => setOneTime(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#f43f5e] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-silkscreen text-xs text-neon-red flex items-center gap-1.5">
                        <Flame size={14} /> Burn After 1 Download
                      </div>
                      <div className="font-pixel text-[0.65rem] text-gray-400 mt-0.5">
                        File self-destructs immediately after first completed transfer
                      </div>
                    </div>
                  </label>

                  {/* PASSWORD PROTECTION TOGGLE */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-silkscreen text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer" onClick={() => setShowPasswordInput(!showPasswordInput)}>
                        <Lock size={13} className="text-neon-purple" /> Passcode Protection:
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPasswordInput(!showPasswordInput)}
                        className="font-silkscreen text-[0.65rem] text-neon-purple underline cursor-pointer"
                      >
                        {showPasswordInput ? 'Remove Password' : '+ Add Password'}
                      </button>
                    </div>

                    {showPasswordInput && (
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter download passphrase..."
                        className="w-full bg-black/40 border border-white/10 focus:border-neon-purple focus:shadow-[0_0_12px_rgba(167,139,250,0.4)] rounded-lg px-4 py-2.5 font-pixel text-sm text-white outline-none transition-all placeholder:text-gray-600"
                      />
                    )}
                  </div>

                  {/* STAGE ACTION BUTTON */}
                  <button
                    type="button"
                    disabled={!selectedFile || isUploading}
                    onClick={handleStartUpload}
                    className="w-full py-3.5 rounded-xl font-silkscreen text-xs sm:text-sm bg-gradient-to-r from-neon-cyan/30 to-neon-purple/30 border border-neon-cyan text-white hover:from-neon-cyan/50 hover:to-neon-purple/50 shadow-[0_0_24px_rgba(56,189,248,0.25)] hover:shadow-[0_0_35px_rgba(56,189,248,0.45)] transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UploadCloud size={16} /> Stage File & Generate Link
                  </button>
                </>
              ) : (
                /* SUCCESS RESULT VIEW */
                <div className="flex flex-col items-center text-center space-y-4 py-2 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 text-neon-green font-silkscreen text-sm">
                    <Check size={18} className="drop-shadow-[0_0_8px_#22c55e]" /> Drop Staged Successfully!
                  </div>
                  
                  <div className="font-pixel text-sm text-gray-300 max-w-sm truncate">
                    {latestDrop.filename} ({formatFileSize(latestDrop.sizeBytes)})
                  </div>

                  {/* HIGH-CONTRAST QR CODE CANVAS */}
                  <div className="bg-white p-3 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center">
                    <canvas ref={qrCanvasRef} width={140} height={140} className="rounded-lg" />
                  </div>

                  <p className="font-silkscreen text-[0.65rem] text-gray-400">
                    Scan with phone camera or copy download link:
                  </p>

                  {/* LINK COPY BAR */}
                  <div className="w-full flex items-center gap-2 bg-black/50 border border-neon-cyan/40 rounded-xl p-2.5">
                    <span className="font-pixel text-xs text-neon-cyan truncate flex-1 text-left px-2 select-all">
                      {latestDrop.fullUrl}
                    </span>
                    <button
                      onClick={() => handleCopyLink(latestDrop.fullUrl)}
                      className="font-silkscreen text-[0.65rem] px-3.5 py-1.5 bg-neon-cyan/20 border border-neon-cyan text-white rounded-lg hover:bg-neon-cyan hover:text-black transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'COPIED!' : 'COPY'}
                    </button>
                  </div>

                  {/* RESET BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      onResetUpload();
                      setSelectedFile(null);
                    }}
                    className="font-silkscreen text-xs text-gray-400 hover:text-white pt-2 underline cursor-pointer"
                  >
                    + Stage Another File
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: ACTIVE DROPS VIEW */}
          {/* ==================================================== */}
          {activeTab === 'active' && (
            <div className="space-y-3">
              {activeDrops.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FileText size={40} className="text-gray-600 mx-auto" />
                  <div className="font-vt323 text-2xl text-gray-400 tracking-wider">
                    NO ACTIVE DROPS
                  </div>
                  <div className="font-silkscreen text-xs text-gray-600">
                    Staged files will appear here with expiration timers.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeDrops.map((drop) => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const fullUrl = `${origin}${drop.downloadUrl}`;

                    return (
                      <div
                        key={drop.id}
                        className="bg-white/[0.02] border border-white/10 hover:border-neon-cyan/40 rounded-xl p-3.5 space-y-2.5 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-pixel text-sm text-white truncate font-medium">
                              {drop.filename}
                            </div>
                            <div className="font-silkscreen text-[0.65rem] text-gray-500 mt-0.5">
                              {formatFileSize(drop.sizeBytes)} &bull; {drop.downloadCount} DLs
                            </div>
                          </div>
                        </div>

                        {/* BADGES ROW */}
                        <div className="flex items-center gap-1.5 flex-wrap font-silkscreen text-[0.55rem]">
                          <span className="px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                            ⏱️ {formatRemainingTime(drop.expiresAt)}
                          </span>
                          {drop.oneTime && (
                            <span className="px-2 py-0.5 rounded bg-neon-red/10 border border-neon-red/30 text-neon-red">
                              🔥 1-TIME
                            </span>
                          )}
                          {drop.hasPassword && (
                            <span className="px-2 py-0.5 rounded bg-neon-purple/10 border border-neon-purple/30 text-neon-purple">
                              🔒 PWD
                            </span>
                          )}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(fullUrl)}
                            className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-neon-cyan text-gray-300 hover:text-neon-cyan transition-colors cursor-pointer"
                            title="Copy Share Link"
                          >
                            <Copy size={13} />
                          </button>
                          <a
                            href={drop.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-neon-green text-gray-300 hover:text-neon-green transition-colors cursor-pointer no-underline"
                            title="Download File"
                          >
                            <Download size={13} />
                          </a>
                          <button
                            type="button"
                            onClick={() => onDeleteDrop(drop.id)}
                            className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-neon-red text-gray-400 hover:text-neon-red hover:bg-neon-red/10 transition-colors cursor-pointer"
                            title="Delete / Revoke Drop"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
