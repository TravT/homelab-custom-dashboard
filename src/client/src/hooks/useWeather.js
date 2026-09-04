import { useState, useEffect } from 'react';
import { defaultWeatherData, getWeatherIcon } from '../data/weatherConfig.jsx';

export function useWeather() {
  const [weatherData, setWeatherData] = useState(defaultWeatherData);

  useEffect(() => {
    let isMounted = true;
    const fetchWeather = async () => {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=-22.9068&longitude=-43.1729&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=7';
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.daily?.time) return;

        const currentTemp = data.current?.temperature_2m != null ? Math.round(data.current.temperature_2m) : Math.round(data.daily.temperature_2m_max[0]);
        const currentCode = data.current?.weather_code != null ? data.current.weather_code : data.daily.weather_code[0];

        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const formatted = data.daily.time.map((dateStr, idx) => {
          const date = new Date(dateStr + 'T12:00:00');
          const dayLabel = idx === 0 ? 'TODAY' : dayNames[date.getDay()];
          const code = idx === 0 ? currentCode : (data.daily.weather_code?.[idx] ?? 0);
          const tempVal = idx === 0 ? currentTemp : Math.round(data.daily.temperature_2m_max[idx]);
          return {
            day: dayLabel,
            temp: tempVal,
            icon: getWeatherIcon(code, 16)
          };
        });

        setWeatherData(formatted);
      } catch (err) {
        console.error('Weather fetch error:', err);
      }
    };

    fetchWeather();
    const wInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(wInterval);
    };
  }, []);

  return weatherData;
}
