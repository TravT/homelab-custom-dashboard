import React from 'react';
import { Play, Eye, HardDrive } from 'lucide-react';

/**
 * Fallback static release radar data rendered when API feeds are initializing.
 */
export const defaultReleaseData = [
  { group: "TODAY", title: "Clevatess", desc: "S02E09 - 1080p", icon: <Play size={20} />, color: "neon-cyan", grad: "from-[#38bdf8] to-[#818cf8]" },
  { group: "TODAY", title: "Re: ZERO", desc: "S04E15 - 1080p", icon: <Play size={20} />, color: "neon-purple", grad: "from-[#a78bfa] to-[#f472b6]" },
  { group: "TOMORROW", title: "Link Click", desc: "S04E05 - 1080p", icon: <Eye size={20} />, color: "neon-green", grad: "from-[#22c55e] to-[#10b981]" },
  { group: "THIS MONTH", title: "Forgotten Island", desc: "Cinema Release", icon: <HardDrive size={20} />, color: "neon-cyan", grad: "from-[#38bdf8] to-[#a78bfa]" },
];
