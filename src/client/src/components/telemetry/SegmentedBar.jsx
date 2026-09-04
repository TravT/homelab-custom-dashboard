import React from 'react';

export function SegmentedBar({ filled, total, colorClass, emptyClass }) {
  return (
    <div className="flex gap-[4px] w-full h-2 md:h-2.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`flex-1 rounded-sm ${i < filled ? colorClass : emptyClass}`} />
      ))}
    </div>
  );
}
