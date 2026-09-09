import React, { useState } from 'react';
import { Loader2, Check, AlertCircle, Play } from 'lucide-react';

export function ActionCard({
  title,
  description,
  category = 'media', // 'media' | 'android'
  icon: Icon,
  onExecute,
  hasInput = false,
  inputPlaceholder = 'Type payload...',
}) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Category Cyber Accent Tokens
  const theme =
    category === 'android'
      ? {
          border: 'border-emerald-500/25 hover:border-emerald-400/50',
          glow: 'group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          btn: 'border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.2)] bg-black/40',
          text: 'text-emerald-400',
        }
      : {
          border: 'border-amber-500/25 hover:border-amber-400/50',
          glow: 'group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          btn: 'border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.2)] bg-black/40',
          text: 'text-amber-400',
        };

  const handleRun = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const payload = hasInput ? inputValue : null;
      const res = await onExecute(payload);

      if (res?.success) {
        setStatus('success');
        if (hasInput) setInputValue('');
        setTimeout(() => setStatus('idle'), 2500);
      } else {
        setStatus('error');
        setErrorMessage(res?.message || 'Execution failed');
        setTimeout(() => setStatus('idle'), 4000);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err?.message || 'Internal error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div
      className={`relative p-4 rounded-xl bg-cyber-card/90 backdrop-blur-xl border ${theme.border} ${theme.glow} transition-all duration-300 flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.6)]`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg bg-black/40 ${theme.text} border border-white/10`}>
              {Icon && <Icon size={18} className="pixel-icon" />}
            </div>
            <div>
              <h4 className="font-silkscreen text-xs text-white uppercase tracking-wider">{title}</h4>
              <span className={`font-silkscreen text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border ${theme.badge}`}>
                {category.toUpperCase()}
              </span>
            </div>
          </div>

          {status === 'loading' && (
            <span className="flex items-center gap-1.5 font-pixel text-[9px] text-neon-cyan animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              <span>RUNNING</span>
            </span>
          )}
          {status === 'success' && (
            <span className="flex items-center gap-1 font-pixel text-[9px] text-neon-green animate-in fade-in">
              <Check size={12} />
              <span>200 OK</span>
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 font-pixel text-[9px] text-neon-red animate-in fade-in">
              <AlertCircle size={12} />
              <span>FAILED</span>
            </span>
          )}
        </div>

        <p className="font-mono text-xs text-gray-400 mb-3 leading-relaxed">{description}</p>

        {/* Dynamic Text Input (e.g. for Clipboard or TTS) */}
        {hasInput && (
          <div className="mb-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              disabled={status === 'loading'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) handleRun();
              }}
              className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-neon-cyan/60"
            />
          </div>
        )}
      </div>

      {/* Error Details if any */}
      {status === 'error' && errorMessage && (
        <div className="mb-2 font-pixel text-[9px] text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 break-words">
          {errorMessage}
        </div>
      )}

      {/* Footer / Trigger Button */}
      <div className="pt-2 flex items-center justify-between border-t border-white/5">
        <button
          onClick={handleRun}
          disabled={status === 'loading' || (hasInput && !inputValue.trim())}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-silkscreen text-[10px] tracking-widest uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${theme.btn}`}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>EXECUTING...</span>
            </>
          ) : (
            <>
              <Play size={11} fill="currentColor" className="pixel-icon" />
              <span>DISPATCH ACTION</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
