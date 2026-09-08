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
    <div className="flex flex-col rounded-xl border border-white/10 bg-black/60 backdrop-blur-md overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border-b border-white/5">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={13} className="text-sky-400" />
          <span className="text-[11px] font-semibold tracking-wider text-slate-300">ACTION DISPATCH TERMINAL</span>
        </div>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            title="Clear terminal log"
            className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-white/5 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="p-3 max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent select-text"
      >
        {logs.length === 0 ? (
          <div className="text-slate-600 italic text-[11px]">No actions dispatched in this session.</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 text-[10px] pt-0.5">[{log.time}]</span>
              <span
                className={`font-semibold shrink-0 ${
                  log.status === 'success'
                    ? 'text-emerald-400'
                    : log.status === 'error'
                    ? 'text-rose-400'
                    : 'text-sky-400'
                }`}
              >
                {log.status === 'success' ? '✓' : log.status === 'error' ? '✗' : '▶'}
              </span>
              <span className="text-slate-300 break-all text-[11px]">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
