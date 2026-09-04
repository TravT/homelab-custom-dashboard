import React from 'react';

export function FlipCard({ front, back, isFlipped, onClick }) {
  return (
    <div className="relative h-full min-h-[140px] md:min-h-[160px] w-full [perspective:1000px] cursor-pointer group" onClick={onClick}>
      <div className={`w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        {/* FRONT */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {front}
        </div>

        {/* BACK */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {back}
        </div>
      </div>
    </div>
  );
}
