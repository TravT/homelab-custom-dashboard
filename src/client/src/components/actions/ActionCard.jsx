import React, { useState } from 'react';
import { Loader2, Check, AlertCircle, Play } from 'lucide-react';

export function ActionCard({
  title,
  description,
  category = 'media', // 'media' | 'android' | 'cluster'
  icon: Icon,
  onExecute,
  hasInput = false,
  inputPlaceholder = 'Type payload...',
  selectOptions = null, // array of string options e.g. ['media-server', 'downloaders', ...]
  requireConfirm = false,
}) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(selectOptions ? selectOptions[0] : '');
  const [isConfirming, setIsConfirming] = useState(false);

  // Category Accent Design Tokens
  const theme =
    category === 'android'
      ? {
          border: 'border-emerald-500/25 hover:border-emerald-400/50',
          glow: 'group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]',
          text: 'text-emerald-400',
        }
      : category === 'cluster'
      ? {
          border: 'border-sky-500/25 hover:border-sky-400/50',
          glow: 'group-hover:shadow-[0_0_20px_rgba(56,189,248,0.15)]',
          badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
          btn: 'bg-sky-600 hover:bg-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.3)]',
          text: 'text-sky-400',
        }
      : {
          border: 'border-amber-500/25 hover:border-amber-400/50',
          glow: 'group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]',
          text: 'text-amber-400',
        };

  const handleRun = async () => {
    if (requireConfirm && !isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsConfirming(false);
    setStatus('loading');
    setErrorMessage('');

    try {
      const payload = selectOptions ? selectedOption : hasInput ? inputValue : null;
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
      className={`relative p-4 rounded-xl bg-slate-950/70 backdrop-blur-xl border ${theme.border} ${theme.glow} transition-all duration-300 flex flex-col justify-between group`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg bg-white/5 ${theme.text} border border-white/5`}>
              {Icon && <Icon size={18} />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wide">{title}</h4>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${theme.badge}`}>
                {category.toUpperCase()}
              </span>
            </div>
          </div>

          {status === 'loading' && (
            <span className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
              <Loader2 size={13} className="animate-spin" />
              <span>RUNNING</span>
            </span>
          )}
          {status === 'success' && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono animate-in fade-in">
              <Check size={14} />
              <span>200 OK</span>
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1 text-xs text-rose-400 font-mono animate-in fade-in">
              <AlertCircle size={14} />
              <span>FAILED</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-3 leading-relaxed">{description}</p>

        {/* Dynamic Select Input (e.g. for Nomad Jobs) */}
        {selectOptions && (
          <div className="mb-3">
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              disabled={status === 'loading'}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {selectOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

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
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Error Details if any */}
      {status === 'error' && errorMessage && (
        <div className="mb-2 text-[11px] text-rose-400/90 font-mono bg-rose-500/10 p-2 rounded border border-rose-500/20 break-words">
          {errorMessage}
        </div>
      )}

      {/* Footer / Trigger Controls */}
      <div className="pt-2 flex items-center justify-between border-t border-white/5">
        {isConfirming ? (
          <div className="w-full flex items-center justify-between gap-2 animate-in fade-in">
            <span className="text-[11px] text-amber-400 font-mono">Confirm restart?</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setIsConfirming(false)}
                className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRun}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Yes, Restart
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleRun}
            disabled={status === 'loading' || (hasInput && !inputValue.trim())}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold font-mono tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.btn}`}
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>EXECUTING...</span>
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" />
                <span>DISPATCH ACTION</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
