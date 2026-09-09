import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export function ActionLogFeed({ logs, onClear }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-black/90 backdrop-blur-md overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal size={15} className="text-neon-cyan pixel-icon" />
          <span className="font-vt323 text-base sm:text-lg tracking-wider text-neon-cyan uppercase">
            &gt; ACTION DISPATCH LOG
          </span>
        </div>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            title="Clear terminal log"
            className="text-gray-500 hover:text-neon-cyan p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Trash2 size={13} className="pixel-icon" />
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="p-3 max-h-24 sm:max-h-32 overflow-y-auto space-y-2 no-scrollbar select-text"
      >
        {logs.length === 0 ? (
          <div className="font-pixel text-[9px] text-gray-600 tracking-wider">
            &gt; NO ACTIONS DISPATCHED IN CURRENT SESSION.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 font-pixel text-[9px] sm:text-[10px] leading-relaxed">
              <span className="text-gray-500 shrink-0 text-[8px] pt-0.5">[{log.time}]</span>
              <span
                className={`font-semibold shrink-0 ${
                  log.status === 'success'
                    ? 'text-neon-green'
                    : log.status === 'error'
                    ? 'text-neon-red'
                    : 'text-neon-cyan'
                }`}
              >
                {log.status === 'success' ? '✓' : log.status === 'error' ? '✗' : '▶'}
              </span>
              <span className="text-gray-300 break-words flex-1 font-mono text-xs">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
