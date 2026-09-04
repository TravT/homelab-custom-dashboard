import React from 'react';
import { Sun, Cloud, CloudRain, CloudDrizzle, CloudLightning } from 'lucide-react';

/**
 * Maps standard WMO weather codes to stylized Lucide React weather icons.
 */
export const getWeatherIcon = (wmoCode, size = 16) => {
  if (wmoCode === 0) return <Sun size={size} className="text-amber-400" />;
  if (wmoCode === 1 || wmoCode === 2) return <Sun size={size} className="text-amber-300" />;
  if (wmoCode === 3) return <Cloud size={size} className="text-gray-400" />;
  if (wmoCode === 45 || wmoCode === 48) return <Cloud size={size} className="text-gray-300" />;
  if (wmoCode >= 51 && wmoCode <= 57) return <CloudDrizzle size={size} className="text-cyan-400" />;
  if (wmoCode >= 61 && wmoCode <= 67) return <CloudRain size={size} className="text-blue-400" />;
  if (wmoCode >= 95) return <CloudLightning size={size} className="text-purple-400" />;
  return <CloudRain size={size} className="text-cyan-400" />;
};

/**
 * Default fallback weather forecast for Rio de Janeiro.
 */
export const defaultWeatherData = [
  { day: 'TODAY', temp: 24, icon: <Sun size={16} className="text-amber-400" /> },
  { day: 'MON', temp: 25, icon: <CloudRain size={16} className="text-blue-400" /> },
  { day: 'TUE', temp: 28, icon: <Sun size={16} className="text-amber-400" /> },
  { day: 'WED', temp: 24, icon: <CloudDrizzle size={16} className="text-cyan-400" /> },
  { day: 'THU', temp: 22, icon: <CloudRain size={16} className="text-blue-400" /> },
  { day: 'FRI', temp: 20, icon: <Cloud size={16} className="text-gray-400" /> },
  { day: 'SAT', temp: 21, icon: <Sun size={16} className="text-amber-400" /> },
];

/**
 * Computes responsive breakpoint display classes for multi-day weather cards.
 */
export const getWeatherDisplayClass = (idx) => {
  if (idx < 2) return 'flex';
  if (idx === 2) return 'hidden sm:flex';
  if (idx === 3) return 'hidden md:flex';
  if (idx === 4) return 'hidden lg:flex';
  if (idx === 5) return 'hidden xl:flex';
  return 'hidden 2xl:flex';
};

export const getDisplayClass = getWeatherDisplayClass;

