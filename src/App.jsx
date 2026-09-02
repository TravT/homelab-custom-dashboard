import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Server, Home, Play, Search, Zap, 
  Wifi, Folder, HardDrive, Download, Eye,
  Activity, GripHorizontal, Sun, CloudRain, Cloud, CloudLightning, CloudDrizzle, Database, Network, User, QrCode, X, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, MessageSquare, Cpu
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const generateInitialData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    time: i,
    cpu: 15,
    ram: 6.8,
    lan: 0.1,
    tailscale: 0.02,
    diskIO: 0.5,
    temp: 52,
  }));
};

const defaultReleaseData = [
  { group: "TODAY", title: "Clevatess", desc: "S02E09 - 1080p", icon: <Play size={20}/>, color: "neon-cyan", grad: "from-[#38bdf8] to-[#818cf8]" },
  { group: "TODAY", title: "Re: ZERO", desc: "S04E15 - 1080p", icon: <Play size={20}/>, color: "neon-purple", grad: "from-[#a78bfa] to-[#f472b6]" },
  { group: "TOMORROW", title: "Link Click", desc: "S04E05 - 1080p", icon: <Eye size={20}/>, color: "neon-green", grad: "from-[#22c55e] to-[#10b981]" },
  { group: "THIS MONTH", title: "Forgotten Island", desc: "Cinema Release", icon: <HardDrive size={20}/>, color: "neon-cyan", grad: "from-[#38bdf8] to-[#a78bfa]" },
];

const getWeatherIcon = (wmoCode, size = 16) => {
  // Clear / Sunny
  if (wmoCode === 0) return <Sun size={size} className="text-amber-400" />;
  // Mainly clear, partly cloudy
  if (wmoCode === 1 || wmoCode === 2) return <Sun size={size} className="text-amber-300" />;
  // Overcast
  if (wmoCode === 3) return <Cloud size={size} className="text-gray-400" />;
  // Fog
  if (wmoCode === 45 || wmoCode === 48) return <Cloud size={size} className="text-gray-300" />;
  // Drizzle
  if (wmoCode >= 51 && wmoCode <= 57) return <CloudDrizzle size={size} className="text-cyan-400" />;
  // Rain
  if (wmoCode >= 61 && wmoCode <= 67) return <CloudRain size={size} className="text-blue-400" />;
  // Thunderstorm
  if (wmoCode >= 95) return <CloudLightning size={size} className="text-purple-400" />;
  // Default rain / clouds
  return <CloudRain size={size} className="text-cyan-400" />;
};

const defaultWeatherData = [
  { day: 'TODAY', temp: 24, icon: <Sun size={16} className="text-amber-400"/> },
  { day: 'MON', temp: 25, icon: <CloudRain size={16} className="text-blue-400"/> },
  { day: 'TUE', temp: 28, icon: <Sun size={16} className="text-amber-400"/> },
  { day: 'WED', temp: 24, icon: <CloudDrizzle size={16} className="text-cyan-400"/> },
  { day: 'THU', temp: 22, icon: <CloudRain size={16} className="text-blue-400"/> },
  { day: 'FRI', temp: 20, icon: <Cloud size={16} className="text-gray-400"/> },
  { day: 'SAT', temp: 21, icon: <Sun size={16} className="text-amber-400"/> },
];

const getDisplayClass = (idx) => {
  if (idx < 2) return 'flex';
  if (idx === 2) return 'hidden sm:flex';
  if (idx === 3) return 'hidden md:flex';
  if (idx === 4) return 'hidden lg:flex';
  if (idx === 5) return 'hidden xl:flex';
  return 'hidden 2xl:flex';
};

const Page1 = () => (
  <div className="flex flex-col">
    <ServiceRow name="Traefik" desc="Core Reverse Proxy" category="Infra" status="online" icon={<Activity size={18} />} url="#" />
    <ServiceRow name="Pi-hole" desc="DNS & Ad Blocking" category="Infra" status="online" icon={<Wifi size={18} />} url="#" />
    <ServiceRow name="Uptime Kuma" desc="Status Monitoring" category="Infra" status="online" icon={<Activity size={18} />} url="#" />
    <ServiceRow name="Home Assistant" desc="Smart Home Hub" category="Smart Home" status="online" icon={<Home size={18} />} url="#" />
    <ServiceRow name="Mosquitto" desc="MQTT Broker" category="Smart Home" status="online" icon={<Database size={18} />} url="#" />
  </div>
);

const Page2 = () => (
  <div className="flex flex-col">
    <ServiceRow name="Jellyfin" desc="Main Media Server" category="Media" status="online" icon={<Play size={18} />} url="#" />
    <ServiceRow name="Jellyseerr" desc="Media Requests" category="Media" status="online" icon={<Search size={18} />} url="#" />
    <ServiceRow name="Sonarr" desc="TV Management" category="Media Mgmt" status="online" icon={<Search size={18} />} url="#" />
    <ServiceRow name="Radarr" desc="Movie Management" category="Media Mgmt" status="offline" icon={<Search size={18} />} url="#" />
    <ServiceRow name="Bazarr" desc="Subtitle Management" category="Media Mgmt" status="online" icon={<Folder size={18} />} url="#" />
  </div>
);

const Page3 = () => (
  <div className="flex flex-col">
    <ServiceRow name="qBittorrent" desc="Download Client" category="Downloads" status="online" icon={<Download size={18} />} url="#" />
    <ServiceRow name="Prowlarr" desc="Indexer Management" category="Downloads" status="online" icon={<Database size={18} />} url="#" />
    <ServiceRow name="FlareSolverr" desc="Cloudflare Bypass" category="Downloads" status="online" icon={<Network size={18} />} url="#" />
    <ServiceRow name="RDT-Client" desc="Real-Debrid Client" category="Downloads" status="online" icon={<Download size={18} />} url="#" />
    <ServiceRow name="Maintainerr" desc="Media Cleanup" category="Media Mgmt" status="online" icon={<Folder size={18} />} url="#" />
  </div>
);

const Page4 = () => (
  <div className="flex flex-col">
    <ServiceRow name="Open WebUI" desc="Local LLM Interface" category="AI" status="online" icon={<MessageSquare size={18} />} url="#" />
    <ServiceRow name="Ollama" desc="LLM Runner" category="AI" status="online" icon={<Cpu size={18} />} url="#" />
    <ServiceRow name="Llama.cpp" desc="Model Inference" category="AI" status="online" icon={<Cpu size={18} />} url="#" />
    <ServiceRow name="Paperless-ngx" desc="Document OCR & Mgmt" category="Docs" status="online" icon={<Folder size={18} />} url="#" />
    <ServiceRow name="FileBrowser" desc="Web File Manager" category="Docs" status="online" icon={<Folder size={18} />} url="#" />
  </div>
);

const Page5 = () => (
  <div className="flex flex-col">
    <ServiceRow name="Guacamole" desc="Remote Desktop" category="Infra" status="online" icon={<Network size={18} />} url="#" />
    <ServiceRow name="ws-scrcpy" desc="Android Mirroring" category="Infra" status="online" icon={<Network size={18} />} url="#" />
    <ServiceRow name="Netdata" desc="Hardware Metrics" category="Infra" status="online" icon={<Activity size={18} />} url="#" />
    <ServiceRow name="Dozzle" desc="Docker Logs" category="Infra" status="online" icon={<Database size={18} />} url="#" />
    <ServiceRow name="n8n" desc="Workflow Automation" category="Smart Home" status="online" icon={<Activity size={18} />} url="#" />
  </div>
);

const pagesData = [<Page1 />, <Page2 />, <Page3 />, <Page4 />, <Page5 />];

export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const carouselRef = useRef(null);
  const scrollInterval = useRef(null);
  
  const [luckText, setLuckText] = useState('');
  const [showCV, setShowCV] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [graphData, setGraphData] = useState(generateInitialData());
  
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const stackSequence = useMemo(() => Array.from({length: 50}, (_, i) => pagesData[i % pagesData.length]), []);
  const [touchStartX, setTouchStartX] = useState(0);

  const [isFlippedStorage, setIsFlippedStorage] = useState(false);
  const [isFlippedNetwork, setIsFlippedNetwork] = useState(false);

  // Live telemetry state
  const [cpuTemp, setCpuTemp] = useState(50);
  const [batteryStats, setBatteryStats] = useState({ percent: 100, plugged: true });
  const [storageStats, setStorageStats] = useState({
    nvme: { total_gb: 465.4, used_gb: 223.1, percent: 47.9 },
    gdrive: { total_tb: 5.0, used_tb: 0.65, percent: 13.0 }
  });
  const [diskIOVal, setDiskIOVal] = useState({ val: '0.0', unit: 'MB/s' });
  const [nvmeActive, setNvmeActive] = useState(false);
  const [gdriveActive, setGdriveActive] = useState(false);
  const [weatherData, setWeatherData] = useState(defaultWeatherData);
  const [releaseData, setReleaseData] = useState(defaultReleaseData);
  const [rawReleases, setRawReleases] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, items: [] });

  // Netdata real-time streaming for charts (CPU, RAM, Network I/O, Temp, Disk I/O)
  useEffect(() => {
    let isMounted = true;
    const netdataHost = window.location.hostname || '192.168.0.48';
    const netdataBase = `http://${netdataHost}:19999/api/v1`;

    const fetchNetdataMetrics = async () => {
      try {
        const [cpuRes, ramRes, lanRes, tailRes, tempRes, diskSpaceRes, diskIoRes] = await Promise.allSettled([
          fetch(`${netdataBase}/data?chart=system.cpu&points=1&after=-3`).then(r => r.json()),
          fetch(`${netdataBase}/data?chart=system.ram&points=1&after=-3`).then(r => r.json()),
          fetch(`${netdataBase}/data?chart=net.enp0s31f6&points=1&after=-3`).then(r => r.json()),
          fetch(`${netdataBase}/data?chart=net.tailscale0&points=1&after=-3`).then(r => r.json()),
          fetch(`${netdataBase}/data?chart=sensors.temperature_coretemp-isa-0000_temp1_Package_id_0_input&points=1&after=-3`).then(r => r.json()),
          fetch(`${netdataBase}/data?chart=disk_space./&points=1&after=-5`).then(r => r.json()),
          fetch(`${netdataBase}/data?chart=disk.sda&points=1&after=-3`).then(r => r.json())
        ]);

        if (!isMounted) return;

        let liveCpu = 20;
        if (cpuRes.status === 'fulfilled' && cpuRes.value?.data?.[0]) {
          const labels = cpuRes.value.labels;
          const vals = cpuRes.value.data[0];
          // Sum non-idle CPU usage
          const total = labels.reduce((acc, label, idx) => {
            if (idx > 0 && label !== 'idle') return acc + (Number(vals[idx]) || 0);
            return acc;
          }, 0);
          liveCpu = Math.max(1, Math.min(100, total));
        }

        let liveRam = 8.0;
        if (ramRes.status === 'fulfilled' && ramRes.value?.data?.[0]) {
          const labels = ramRes.value.labels;
          const vals = ramRes.value.data[0];
          const usedIdx = labels.indexOf('used');
          if (usedIdx !== -1) {
            liveRam = (Number(vals[usedIdx]) || 0) / 1024;
          }
        }

        let liveLan = 0;
        if (lanRes.status === 'fulfilled' && lanRes.value?.data?.[0]) {
          const vals = lanRes.value.data[0];
          // Netdata returns kilobits/s for network interfaces
          const recv = Math.abs(Number(vals[1]) || 0);
          const sent = Math.abs(Number(vals[2]) || 0);
          liveLan = (recv + sent) / (8 * 1024); // convert kbps to MB/s
        }

        let liveTailscale = 0;
        if (tailRes.status === 'fulfilled' && tailRes.value?.data?.[0]) {
          const vals = tailRes.value.data[0];
          const recv = Math.abs(Number(vals[1]) || 0);
          const sent = Math.abs(Number(vals[2]) || 0);
          liveTailscale = (recv + sent) / (8 * 1024);
        }

        let liveTemp = 50;
        if (tempRes.status === 'fulfilled' && tempRes.value?.data?.[0]) {
          liveTemp = Number(tempRes.value.data[0][1]) || 50;
          setCpuTemp(Math.round(liveTemp));
        }

        if (diskSpaceRes.status === 'fulfilled' && diskSpaceRes.value?.data?.[0]) {
          const labels = diskSpaceRes.value.labels;
          const vals = diskSpaceRes.value.data[0];
          const availIdx = labels.indexOf('avail');
          const usedIdx = labels.indexOf('used');
          if (availIdx !== -1 && usedIdx !== -1) {
            const avail = Number(vals[availIdx]) || 0;
            const used = Number(vals[usedIdx]) || 0;
            const total = avail + used;
            if (total > 0) {
              setStorageStats(prev => ({
                ...prev,
                nvme: {
                  total_gb: Math.round(total),
                  used_gb: Math.round(used),
                  percent: Math.round((used / total) * 100)
                }
              }));
            }
          }
        }

        // Live Disk I/O (reads + writes from disk.sda in KiB/s)
        let liveDiskIOMB = 0;
        if (diskIoRes.status === 'fulfilled' && diskIoRes.value?.data?.[0]) {
          const vals = diskIoRes.value.data[0];
          const reads = Math.abs(Number(vals[1]) || 0);
          const writes = Math.abs(Number(vals[2]) || 0);
          const totalKiB = reads + writes;
          liveDiskIOMB = totalKiB / 1024; // convert KiB/s to MB/s

          if (liveDiskIOMB >= 1) {
            setDiskIOVal({ val: liveDiskIOMB.toFixed(1), unit: 'MB/s' });
          } else {
            setDiskIOVal({ val: Math.round(totalKiB).toString(), unit: 'KB/s' });
          }

          // Real disk activity indicators: active when > 50 KB/s throughput
          setNvmeActive(totalKiB > 50);
          // GDrive activity: active when tailscale or sustained LAN transfer happens
          setGdriveActive(liveTailscale > 0.1 || (liveLan > 2 && totalKiB > 200));
        }

        setGraphData(prev => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(1),
            {
              time: (last?.time || 0) + 1,
              cpu: liveCpu,
              ram: liveRam,
              lan: liveLan,
              tailscale: liveTailscale,
              diskIO: liveDiskIOMB,
              temp: Math.round(liveTemp)
            }
          ];
        });
      } catch (err) {
        console.error('Netdata polling error:', err);
      }
    };

    fetchNetdataMetrics();
    const interval = setInterval(fetchNetdataMetrics, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Poll Battery & host power stats from sys-stats-api
  useEffect(() => {
    let isMounted = true;
    const host = window.location.hostname || '192.168.0.48';
    const fetchBattery = async () => {
      try {
        const res = await fetch(`http://${host}:8005/stats`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBatteryStats({
              percent: Math.round(data.battery_percent ?? 100),
              plugged: !!data.power_plugged
            });
          }
        }
      } catch {
        // Fallback gracefully if not reachable
      }
    };

    fetchBattery();
    const bInterval = setInterval(fetchBattery, 10000);
    return () => {
      isMounted = false;
      clearInterval(bInterval);
    };
  }, []);

  // Fetch live weather for Rio de Janeiro from Open-Meteo (lat: -22.9068, lon: -43.1729)
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
    // Refresh weather once every 30 minutes
    const wInterval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(wInterval);
    };
  }, []);

  // Fetch upcoming releases from Sonarr and Radarr
  useEffect(() => {
    let isMounted = true;
    const host = window.location.hostname || '192.168.0.48';
    const sonarrKey = '8d39d99bab98425c8f22e809a405ddbc';
    const radarrKey = 'c47ae26b45084cbb8c31d60d32487cb7';

    const fetchReleases = async () => {
      try {
        const now = new Date();
        // Fetch a broader window (past 30 days to next 180 days) for calendar month navigation
        const pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const futureDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
        const startStr = pastDate.toISOString().split('T')[0];
        const endStr = futureDate.toISOString().split('T')[0];

        const [sonarrRes, radarrRes] = await Promise.allSettled([
          fetch(`http://${host}:8989/api/v3/calendar?apiKey=${sonarrKey}&includeSeries=true&start=${startStr}&end=${endStr}`).then(r => r.json()),
          fetch(`http://${host}:7878/api/v3/calendar?apiKey=${radarrKey}&start=${startStr}&end=${endStr}`).then(r => r.json())
        ]);

        if (!isMounted) return;

        const allReleases = [];

        if (sonarrRes.status === 'fulfilled' && Array.isArray(sonarrRes.value)) {
          sonarrRes.value.forEach(item => {
            const date = new Date(item.airDateUtc || item.airDate);
            const seriesName = item.series?.title || item.title || 'TV Episode';
            const epTitle = item.title && item.title !== 'TBA' ? item.title : '';
            const seasonEp = `S${String(item.seasonNumber).padStart(2, '0')}E${String(item.episodeNumber).padStart(2, '0')}`;
            const quality = item.hasFile ? 'Downloaded' : 'Scheduled';
            const title = seriesName;
            const desc = `${seasonEp} - ${quality}`;

            allReleases.push({
              date,
              title,
              epTitle,
              desc,
              status: quality,
              seasonEp,
              type: 'tv'
            });
          });
        }

        if (radarrRes.status === 'fulfilled' && Array.isArray(radarrRes.value)) {
          radarrRes.value.forEach(item => {
            const dateStr = item.inCinemas || item.digitalRelease || item.physicalRelease;
            if (!dateStr) return;
            const date = new Date(dateStr);
            const title = item.title || 'Movie';
            const quality = item.hasFile ? 'Downloaded' : 'Announced';
            const desc = item.hasFile ? 'Downloaded' : 'Cinema/Digital';

            allReleases.push({
              date,
              title,
              desc,
              status: quality,
              type: 'movie'
            });
          });
        }

        if (allReleases.length > 0) {
          // Sort by date ascending
          allReleases.sort((a, b) => a.date - b.date);
          setRawReleases(allReleases);

          // Upcoming releases from now onwards
          const futureOnly = allReleases.filter(r => r.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
          const list = futureOnly.length > 0 ? futureOnly : allReleases;

          // Group into TODAY, TOMORROW, THIS WEEK, THIS MONTH
          const cards = [];
          const todayDate = now.getDate();
          const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).getDate();
          const oneWeek = now.getTime() + 7 * 24 * 60 * 60 * 1000;

          list.slice(0, 8).forEach(rel => {
            const relTime = rel.date.getTime();
            let group = 'SOON';
            let color = 'neon-cyan';
            let grad = 'from-[#38bdf8] to-[#a78bfa]';
            let icon = <Play size={20} />;

            if (rel.date.getDate() === todayDate && rel.date.getMonth() === now.getMonth() && rel.date.getFullYear() === now.getFullYear()) {
              group = 'TODAY';
              color = 'neon-cyan';
              grad = 'from-[#38bdf8] to-[#818cf8]';
              icon = <Play size={20} />;
            } else if (rel.date.getDate() === tomorrowDate && rel.date.getMonth() === now.getMonth() && rel.date.getFullYear() === now.getFullYear()) {
              group = 'TOMORROW';
              color = 'neon-purple';
              grad = 'from-[#a78bfa] to-[#f472b6]';
              icon = <Eye size={20} />;
            } else if (relTime <= oneWeek) {
              group = 'THIS WEEK';
              color = 'neon-green';
              grad = 'from-[#22c55e] to-[#10b981]';
              icon = <Download size={20} />;
            } else {
              group = 'THIS MONTH';
              color = 'neon-cyan';
              grad = 'from-[#38bdf8] to-[#a78bfa]';
              icon = <HardDrive size={20} />;
            }

            cards.push({
              group,
              title: rel.title,
              desc: rel.desc,
              icon,
              color,
              grad
            });
          });

          if (cards.length > 0) {
            setReleaseData(cards);
          }
        }
      } catch (err) {
        console.error('Calendar release fetch error:', err);
      }
    };

    fetchReleases();
    const rInterval = setInterval(fetchReleases, 10 * 60 * 1000); // 10 min refresh
    return () => {
      isMounted = false;
      clearInterval(rInterval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = (e) => {
      const currentScrollY = e.target.scrollTop;
      if (currentScrollY > lastScrollY + 10) setIsNavOpen(false);
      else if (currentScrollY < lastScrollY - 10) setIsNavOpen(true);
      setLastScrollY(currentScrollY);
    };
    const scrollContainer = document.getElementById('main-scroll');
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const startAutoScroll = () => {
      clearInterval(scrollInterval.current);
      scrollInterval.current = setInterval(() => {
        if (carouselRef.current) {
          const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
          if (carouselRef.current.scrollLeft >= maxScroll - 15) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
          }
        }
      }, 4000);
    };
    startAutoScroll();
    return () => clearInterval(scrollInterval.current);
  }, [releaseData]);
  const pauseScroll = () => clearInterval(scrollInterval.current);

  useEffect(() => {
    const fullText = "> LUCK: SYSTEM OPTIMAL. MAY YOUR BANDS BE WIDE AND YOUR LATENCY LOW.";
    let i = 0;
    const timer = setInterval(() => {
      setLuckText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40) setActiveStackIndex(prev => Math.min(prev + 1, stackSequence.length - 1));
    else if (diff < -40) setActiveStackIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div 
      className="flex min-h-screen text-gray-200 selection:bg-neon-purple/30 pb-4 md:pb-0 relative overflow-hidden bg-[#0a0a0c]"
      style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      <style>{`
        @keyframes hddBlink {
          0%, 100% { opacity: 0.1; }
          10%, 30% { opacity: 1; filter: drop-shadow(0 0 6px currentColor); }
          20%, 40% { opacity: 0.2; filter: none; }
          50%, 90% { opacity: 0.1; filter: none; }
        }
        .animate-hdd { animation: hddBlink 1.5s infinite; }
        .animate-hdd-delayed { animation: hddBlink 1.8s infinite 0.7s; }
      `}</style>
      
      {showCV && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-cyber-card border border-neon-cyan/30 shadow-[0_0_40px_rgba(56,189,248,0.2)] p-8 rounded-xl max-w-md w-full relative">
            <button onClick={() => setShowCV(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple p-1">
                <div className="w-full h-full bg-cyber-card rounded-full flex items-center justify-center">
                  <User size={40} className="text-white opacity-80" />
                </div>
              </div>
              <div>
                <h2 className="font-vt323 text-4xl text-white tracking-widest">Tiago</h2>
                <p className="font-silkscreen text-neon-cyan mt-2">Systems Engineer</p>
              </div>
              <div className="w-full h-px bg-white/10 my-4"></div>
              <div className="bg-white p-4 rounded-lg"><QrCode size={120} className="text-black" /></div>
              <p className="font-pixel text-xs text-gray-400 leading-relaxed">Scan to connect.<br/>Command Center Architect.</p>
            </div>
          </div>
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-cyber-card/90 border border-neon-purple/30 shadow-[0_0_60px_rgba(167,139,250,0.2)] p-6 md:p-10 rounded-2xl max-w-4xl w-full relative flex flex-col h-full md:h-auto max-h-full">
            <button onClick={() => setShowCalendar(false)} className="absolute top-6 right-6 text-gray-500 hover:text-neon-purple transition-colors"><X size={28} className="pixel-icon" /></button>
            
            <div className="flex items-center justify-between mb-2 pr-12">
              <div className="font-vt323 text-3xl md:text-5xl text-white tracking-widest flex items-center gap-4">
                <CalendarIcon size={32} className="text-neon-purple pixel-icon" /> 
                <span>{calendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="p-1.5 bg-black/40 hover:bg-neon-purple/20 border border-white/10 hover:border-neon-purple/50 rounded text-gray-400 hover:text-white transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setCalendarDate(new Date())}
                  className="px-2 py-1 bg-black/40 hover:bg-neon-cyan/20 border border-white/10 hover:border-neon-cyan/50 rounded font-pixel text-[0.6rem] text-gray-400 hover:text-neon-cyan transition-colors"
                  title="Current Month"
                >
                  TODAY
                </button>
                <button 
                  onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="p-1.5 bg-black/40 hover:bg-neon-purple/20 border border-white/10 hover:border-neon-purple/50 rounded text-gray-400 hover:text-white transition-colors"
                  title="Next Month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            <div className="font-silkscreen text-xs md:text-sm text-neon-purple/80 uppercase tracking-widest mb-6">// Scheduled Releases</div>
            
            <div className="flex-1 overflow-x-auto no-scrollbar pb-4 w-full" onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, items: [] })}>
              <div className="min-w-[600px] h-full flex flex-col">
                <div className="grid grid-cols-7 gap-2 md:gap-4 flex-1">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="font-pixel text-[0.55rem] md:text-xs text-gray-500 text-center mb-2">{day}</div>
                  ))}

                  {/* Empty offset days for the beginning of the month */}
                  {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="border border-white/5 bg-black/10 rounded-lg p-1.5 md:p-2 opacity-20 pointer-events-none md:aspect-square min-h-[80px]"></div>
                  ))}

                  {/* Month days calculated dynamically */}
                  {Array.from({ length: new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                    const dayNum = i + 1;
                    const cYear = calendarDate.getFullYear();
                    const cMonth = calendarDate.getMonth();
                    
                    // Filter rawReleases for this exact day/month/year
                    const dayItems = rawReleases.filter(r => {
                      return r.date.getDate() === dayNum && r.date.getMonth() === cMonth && r.date.getFullYear() === cYear;
                    });

                    const hasItems = dayItems.length > 0;
                    const realNow = new Date();
                    const isToday = dayNum === realNow.getDate() && cMonth === realNow.getMonth() && cYear === realNow.getFullYear();

                    return (
                      <div 
                        key={i} 
                        onMouseEnter={(e) => {
                          if (hasItems) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              visible: true,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                              day: dayNum,
                              monthStr: calendarDate.toLocaleString('en-US', { month: 'short' }),
                              items: dayItems
                            });
                          } else {
                            setTooltip({ visible: false, x: 0, y: 0, items: [] });
                          }
                        }}
                        className={`border ${isToday ? 'border-neon-cyan/50 bg-neon-cyan/10 ring-1 ring-neon-cyan/30' : hasItems ? 'border-neon-purple/40 bg-neon-purple/10 hover:border-neon-purple' : 'border-white/5 bg-black/20'} rounded-lg p-1.5 md:p-2 flex flex-col relative group hover:border-white/30 transition-all md:aspect-square min-h-[80px] cursor-pointer`}
                      >
                        <span className={`font-pixel text-[0.6rem] md:text-sm ${isToday ? 'text-neon-cyan font-bold' : hasItems ? 'text-white' : 'text-gray-400'}`}>
                          {dayNum}
                        </span>
                        {dayItems.slice(0, 2).map((item, itemIdx) => (
                          <div 
                            key={itemIdx} 
                            className={`mt-1 md:mt-2 w-full ${item.type === 'movie' ? 'bg-neon-cyan/15 border-l-[2px] md:border-l-[3px] border-neon-cyan text-neon-cyan' : 'bg-neon-green/15 border-l-[2px] md:border-l-[3px] border-neon-green text-neon-green'} p-1 rounded-sm shadow-[0_0_8px_rgba(34,197,94,0.1)]`}
                          >
                            <div className="font-pixel text-[0.4rem] md:text-[0.55rem] truncate leading-tight">
                              {item.title}
                            </div>
                          </div>
                        ))}
                        {dayItems.length > 2 && (
                          <div className="font-pixel text-[0.45rem] text-neon-purple mt-1 text-right">
                            +{dayItems.length - 2} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Flying hover tooltip */}
            {tooltip.visible && tooltip.items.length > 0 && (
              <div 
                className="fixed z-[150] pointer-events-none -translate-x-1/2 -translate-y-full mb-2 bg-[#09090d]/95 backdrop-blur-xl border border-neon-cyan/40 shadow-[0_0_24px_rgba(56,189,248,0.25)] rounded-xl p-3 min-w-[220px] max-w-[320px] animate-in fade-in zoom-in-95 duration-150"
                style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                  <span className="font-pixel text-[0.6rem] text-neon-cyan tracking-widest uppercase">
                    {tooltip.monthStr} {tooltip.day}
                  </span>
                  <span className="font-silkscreen text-[0.55rem] text-gray-500">
                    {tooltip.items.length} RELEASE{tooltip.items.length > 1 ? 'S' : ''}
                  </span>
                </div>
                <div className="space-y-2">
                  {tooltip.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-pixel text-xs ${item.type === 'movie' ? 'text-neon-cyan' : 'text-neon-green'} leading-snug break-words`}>
                          {item.title}
                        </span>
                        <span className="font-pixel text-[0.5rem] uppercase text-gray-500 bg-white/5 px-1 rounded">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[0.55rem] font-silkscreen text-gray-400 mt-0.5">
                        <span>{item.seasonEp || item.epTitle || item.desc}</span>
                        <span className={item.status === 'Downloaded' ? 'text-neon-green' : 'text-amber-400'}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-full w-20 bg-[#08080a]/90 backdrop-blur-2xl flex-col items-center justify-center gap-8 border-r border-white/5 z-50 transition-transform duration-500 ease-in-out ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarIcon icon={<Server size={20} />} active />
        <SidebarIcon icon={<Home size={20} />} />
        <SidebarIcon icon={<Play size={20} />} />
        <SidebarIcon icon={<Search size={20} />} />
        <SidebarIcon icon={<Folder size={20} />} />
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full transition-transform duration-500 ease-in-out z-50 ${isNavOpen ? 'translate-y-0' : 'translate-y-[calc(100%-1.2rem)]'}`}>
        <div onClick={() => setIsNavOpen(!isNavOpen)} className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-5 flex items-center justify-center cursor-pointer text-gray-500 hover:text-neon-cyan transition-colors">
          <GripHorizontal size={24} className="drop-shadow-[0_0_8px_rgba(0,0,0,1)]" />
        </div>
        <nav className="w-full h-16 bg-[#08080a]/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">
          <MobileNavIcon icon={<Server size={20} />} label="INFRA" font="font-pixel" active />
          <MobileNavIcon icon={<Home size={20} />} label="HOME" font="font-silkscreen" />
          <MobileNavIcon icon={<Play size={20} />} label="MEDIA" font="font-silkscreen" />
          <MobileNavIcon icon={<Search size={20} />} label="FIND" font="font-silkscreen" />
          <MobileNavIcon icon={<Folder size={20} />} label="DOCS" font="font-pixel" />
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <main id="main-scroll" className="flex-1 flex flex-col h-screen overflow-y-auto w-full md:pl-20 no-scrollbar scroll-smooth relative z-10">
        
        <header className="flex flex-col px-6 md:px-10 pt-8 pb-4 shrink-0 gap-4">
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="font-vt323 text-3xl md:text-4xl text-white tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Hello, Tiago</h2>
              <div className="font-silkscreen text-[0.65rem] md:text-xs text-neon-cyan mt-1 uppercase tracking-widest drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]">
                Command Center
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                <div className="font-silkscreen text-[0.55rem] md:text-[0.65rem] text-gray-400 tracking-widest uppercase mr-2 hidden sm:block">Rio, RJ</div>
                {/* Dynamically expanding weather widget */}
                {weatherData.map((w, idx) => (
                  <div key={idx} className={`flex-col items-center gap-0.5 ${getDisplayClass(idx)}`}>
                    <span className="font-pixel text-[0.45rem] text-gray-500">{w.day}</span>
                    <div className="flex items-center gap-1 text-gray-300">
                      <div className="pixel-icon">{w.icon}</div>
                      <span className="font-pixel text-[0.65rem] text-white">{w.temp}°</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowCV(true)} className="w-10 h-10 bg-black/40 border border-neon-purple/50 rounded-lg flex items-center justify-center text-neon-purple hover:bg-neon-purple/20 transition-colors shadow-[0_0_12px_rgba(167,139,250,0.3)]">
                <User size={18} className="pixel-icon" />
              </button>
            </div>
          </div>

          <div className="mt-2 w-full">
            <div className="font-pixel text-xs md:text-sm text-neon-green/90 leading-loose tracking-widest break-words drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]">
              {luckText}<span className="inline-block w-2.5 h-3.5 bg-neon-green ml-2 animate-pulse align-middle shadow-[0_0_10px_#22c55e]"></span>
            </div>
          </div>
        </header>

        <div className="flex-1 px-6 md:px-10 pb-28 pt-2 space-y-8 md:space-y-10">
          
          <section>
            <div className="font-vt323 text-2xl text-gray-400 tracking-widest mb-4 uppercase flex items-center gap-3">
              <span className="text-neon-purple opacity-50">//</span> SYSTEM METRICS
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <GraphBox 
                title="Processor" 
                value={`${Math.round(graphData[graphData.length-1].cpu)}%`} 
                dataKey="cpu" 
                color="#38bdf8" 
                colorEnd="#0284c7" 
                data={graphData} 
                yDomain={[0, dataMax => Math.max(25, Math.ceil(dataMax * 1.35))]} 
              />
              <GraphBox 
                title="Memory" 
                value={`${graphData[graphData.length-1].ram.toFixed(1)} GB`} 
                dataKey="ram" 
                color="#a78bfa" 
                colorEnd="#7e22ce" 
                data={graphData} 
                yDomain={[dataMin => Math.max(0, Math.floor(dataMin * 0.85)), dataMax => Math.ceil(dataMax * 1.15)]} 
              />
              
              <FlipCard 
                isFlipped={isFlippedNetwork} 
                onClick={() => setIsFlippedNetwork(!isFlippedNetwork)}
                front={
                  <div className="bg-cyber-card/80 backdrop-blur-md p-5 md:p-6 rounded-xl border border-white/5 relative group overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-full min-h-[140px] md:min-h-[160px]">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <div className="text-xs font-silkscreen text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          Network I/O
                          <div className="flex items-center gap-2 ml-2">
                            <div className="w-1.5 h-1.5 bg-neon-green shadow-[0_0_6px_#22c55e]"></div>
                            <div className="w-1.5 h-1.5 bg-neon-purple shadow-[0_0_6px_#a78bfa]"></div>
                          </div>
                        </div>
                        <div className="font-pixel text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] flex items-baseline">
                          {graphData[graphData.length-1].lan.toFixed(2)} <span className="font-pixel text-2xl text-white ml-2">MB/s</span>
                        </div>
                      </div>
                      <div className="pixel-icon opacity-50 text-neon-green"><Activity size={20} /></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-28 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={graphData} margin={{top:0, left:0, right:0, bottom:0}}>
                          <defs>
                            <linearGradient id="colorLan" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.5}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
                            <linearGradient id="colorTail" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a78bfa" stopOpacity={0.5}/><stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/></linearGradient>
                          </defs>
                          <YAxis domain={[0, dataMax => Math.max(0.5, Math.ceil(dataMax * 1.35 * 10) / 10)]} hide />
                          <Area type="monotone" isAnimationActive={false} dataKey="lan" stroke="#22c55e" fillOpacity={1} fill="url(#colorLan)" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 6px #22c55e)' }} />
                          <Area type="monotone" isAnimationActive={false} dataKey="tailscale" stroke="#a78bfa" fillOpacity={1} fill="url(#colorTail)" strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 6px #a78bfa)' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                }
                back={
                  <div className="bg-cyber-card/90 backdrop-blur-md p-5 md:p-6 rounded-xl border border-neon-red/40 shadow-[0_0_30px_rgba(244,63,94,0.15)] flex flex-col justify-between h-full min-h-[140px] md:min-h-[160px] relative overflow-hidden group">
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <div className="text-xs font-silkscreen text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           Server Health <Zap size={12} className="text-neon-cyan" />
                        </div>
                        <div className="font-pixel text-xl md:text-2xl text-neon-red drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                          {cpuTemp}°<span className="text-sm text-neon-red">C</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-pixel text-[0.55rem] md:text-[0.65rem] text-neon-green mb-1.5 drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]">
                          {batteryStats.plugged ? 'AC POWER' : 'BATTERY'}
                        </div>
                        <div className="font-pixel text-xl md:text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{batteryStats.percent}<span className="text-sm">%</span></div>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-28 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={graphData} margin={{top:0, left:0, right:0, bottom:0}}>
                          <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/>
                              <stop offset="95%" stopColor="#9f1239" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <YAxis domain={[dataMin => Math.max(30, Math.floor(dataMin * 0.9)), dataMax => Math.ceil(dataMax * 1.1)]} hide />
                          <Area type="monotone" isAnimationActive={false} dataKey="temp" stroke="#f43f5e" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px #f43f5e)' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                }
              />

              <FlipCard 
                isFlipped={isFlippedStorage} 
                onClick={() => setIsFlippedStorage(!isFlippedStorage)}
                front={
                  <div className="bg-cyber-card/80 backdrop-blur-md p-5 md:p-6 rounded-xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col justify-center gap-6 h-full min-h-[140px] md:min-h-[160px]">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-silkscreen text-gray-400 uppercase tracking-widest">Local NVMe</span>
                            <div className={`w-1.5 h-1.5 bg-neon-cyan rounded-full transition-opacity duration-300 ${nvmeActive ? 'animate-hdd shadow-[0_0_8px_#38bdf8] opacity-100' : 'opacity-30'}`}></div>
                          </div>
                          <span className="text-xs font-pixel text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">{storageStats.nvme.percent}%</span>
                        </div>
                        <SegmentedBar filled={Math.round(storageStats.nvme.percent / 10)} total={10} colorClass="bg-neon-cyan shadow-[0_0_8px_#38bdf8]" emptyClass="bg-[#27272a]" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-silkscreen text-gray-400 uppercase tracking-widest">Google Drive</span>
                            <div className={`w-1.5 h-1.5 bg-neon-red rounded-full transition-opacity duration-300 ${gdriveActive ? 'animate-hdd-delayed shadow-[0_0_8px_#f43f5e] opacity-100' : 'opacity-30'}`}></div>
                          </div>
                          <span className="text-xs font-pixel text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]">{storageStats.gdrive.percent}%</span>
                        </div>
                        <SegmentedBar filled={Math.max(1, Math.round(storageStats.gdrive.percent / 10))} total={10} colorClass="bg-neon-red shadow-[0_0_8px_#f43f5e]" emptyClass="bg-[#27272a]" />
                      </div>
                  </div>
                }
                back={
                  <GraphBox 
                    title="Disk I/O" 
                    value={`${diskIOVal.val} ${diskIOVal.unit}`} 
                    dataKey="diskIO" 
                    color="#f59e0b" 
                    colorEnd="#d97706" 
                    data={graphData} 
                    yDomain={[0, dataMax => Math.max(1, Math.ceil(dataMax * 1.4 * 10) / 10)]} 
                    icon={<HardDrive size={20} />} 
                  />
                }
              />
            </div>
          </section>

          <section className="relative">
            <div className="flex items-center justify-between mb-4 pr-2">
              <div className="font-vt323 text-2xl text-gray-400 tracking-widest uppercase flex items-center gap-3">
                <span className="text-neon-cyan opacity-50">//</span> RELEASE RADAR
              </div>
              <button 
                onClick={() => setShowCalendar(true)}
                className="text-gray-500 hover:text-neon-cyan transition-colors"
              >
                <CalendarIcon size={20} className="pixel-icon drop-shadow-[0_0_4px_rgba(56,189,248,0.5)]" />
              </button>
            </div>
            
            <div className="w-full relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-[#08080a] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-[#08080a] to-transparent z-10 pointer-events-none"></div>
              
              <div ref={carouselRef} onPointerDown={pauseScroll} onWheel={pauseScroll} onTouchStart={pauseScroll} className="flex gap-4 py-2 overflow-x-auto snap-x snap-mandatory no-scrollbar relative z-20 px-2">
                {releaseData.map((item, idx) => <SlimCalendarCard key={idx} {...item} />)}
              </div>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-end mb-4">
              <div className="font-vt323 text-2xl text-gray-400 tracking-widest uppercase flex items-center gap-3">
                <span className="text-neon-green opacity-50">//</span> ACTIVE SERVICES
              </div>
              
              {/* Desktop/Tablet Pagination Controls */}
              <div className="flex xl:hidden items-center gap-4 pr-2">
                <span className="font-pixel text-[0.55rem] text-gray-500 uppercase tracking-widest">
                  PAGE {(activeStackIndex % pagesData.length) + 1}/{pagesData.length}
                </span>
                
                <div className="flex gap-2 mr-3">
                  <button onClick={() => setActiveStackIndex(p => Math.max(0, p - 1))} className="text-gray-500 hover:text-neon-cyan transition-colors"><ChevronLeft size={16}/></button>
                  <button onClick={() => setActiveStackIndex(p => Math.min(p + 1, stackSequence.length - 1))} className="text-gray-500 hover:text-neon-cyan transition-colors"><ChevronRight size={16}/></button>
                </div>

                <div className="flex gap-1">
                   {pagesData.map((_, i) => (
                     <div key={i} className={`w-2 h-2 rounded-sm transition-all ${activeStackIndex % pagesData.length === i ? 'bg-neon-cyan shadow-[0_0_8px_#38bdf8]' : 'bg-gray-700'}`}></div>
                   ))}
                </div>
              </div>
            </div>
            
            {/* MOBILE & TABLET: Infinite Stack */}
            <div 
              className="relative w-full h-[450px] md:h-[470px] touch-pan-y overflow-hidden xl:hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {stackSequence.map((PageComp, idx) => {
                if (idx < activeStackIndex) return null;
                if (idx > activeStackIndex + 1) return null;

                const isActive = idx === activeStackIndex;
                const isUnder = idx === activeStackIndex + 1;

                return (
                  <div 
                    key={idx}
                    className={`absolute top-0 left-0 w-full bg-cyber-card/80 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden flex flex-col transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      isActive ? 'z-20 translate-x-0 scale-100 opacity-100 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' 
                      : isUnder ? 'z-10 translate-x-12 scale-[0.94] opacity-40 pointer-events-none'
                      : 'z-30 -translate-x-32 scale-105 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="hidden md:grid grid-cols-[4fr_5fr_3fr_2fr] gap-4 px-6 py-4 bg-black/40 border-b border-white/5">
                      <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Service</div>
                      <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Description</div>
                      <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Category</div>
                      <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase text-right">Status</div>
                    </div>
                    {PageComp}
                  </div>
                );
              })}
            </div>

            {/* ULTRAWIDE DESKTOP: Side-by-Side Grid */}
            <div className="hidden xl:grid grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
              {pagesData.map((PageComp, idx) => (
                <div key={idx} className="bg-cyber-card/80 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-full">
                  <div className="grid grid-cols-[4fr_5fr_3fr_2fr] gap-4 px-6 py-4 bg-black/40 border-b border-white/5">
                    <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Service</div>
                    <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase truncate">Description</div>
                    <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase">Category</div>
                    <div className="text-xs font-silkscreen text-gray-500 tracking-widest uppercase text-right">Status</div>
                  </div>
                  {PageComp}
                </div>
              ))}
            </div>

          </section>

        </div>
      </main>
    </div>
  );
}

function SidebarIcon({ icon, active }) {
  return (
    <div className={`relative flex justify-center p-3 cursor-pointer group ${active ? 'text-neon-cyan' : 'text-gray-600 hover:text-gray-300'}`}>
      {active && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-neon-cyan shadow-[0_0_12px_#38bdf8] rounded-r-md"></div>}
      <div className={`pixel-icon transition-transform ${active ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-125' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
    </div>
  );
}

function MobileNavIcon({ icon, label, font, active }) {
  return (
    <div className={`relative flex flex-col items-center justify-center p-3 cursor-pointer group ${active ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}`}>
      <div className={`pixel-icon transition-transform mb-1.5 ${active ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-125' : ''}`}>
        {icon}
      </div>
      <span className={`${font} text-xs uppercase tracking-wider ${active ? 'text-neon-cyan drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]' : ''}`}>
        {label}
      </span>
    </div>
  );
}

function GraphBox({ title, value, dataKey, color, colorEnd, data, yDomain, icon = <Activity size={20} /> }) {
  return (
    <div className="bg-cyber-card/80 backdrop-blur-md p-5 md:p-6 rounded-xl border border-white/5 relative group overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-full min-h-[140px] md:min-h-[160px]">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="text-xs font-silkscreen text-gray-500 uppercase tracking-widest mb-2">{title}</div>
          <div className="font-pixel text-2xl text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{value}</div>
        </div>
        <div className="pixel-icon opacity-50" style={{ color: color }}>{icon}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-28 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{top:0, left:0, right:0, bottom:0}}>
            <defs>
              <linearGradient id={`grad${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={colorEnd} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={yDomain} hide />
            <Area type="monotone" isAnimationActive={false} dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#grad${dataKey})`} strokeWidth={2} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FlipCard({ front, back, isFlipped, onClick }) {
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

function SegmentedBar({ filled, total, colorClass, emptyClass }) {
  return (
    <div className="flex gap-[4px] w-full h-2 md:h-2.5">
      {Array.from({ length: total }).map((_, i) => <div key={i} className={`flex-1 rounded-sm ${i < filled ? colorClass : emptyClass}`} />)}
    </div>
  );
}

function SlimCalendarCard({ group, title, desc, icon, color, grad }) {
  const host = typeof window !== 'undefined' ? (window.location.hostname || '192.168.0.48') : '192.168.0.48';
  const jellyfinUrl = `http://${host}:8096`;

  return (
    <a 
      href={jellyfinUrl}
      target="_blank"
      rel="noreferrer"
      title={`Open Jellyfin - ${title}`}
      className="min-w-[280px] md:min-w-[320px] snap-center h-16 md:h-20 bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg pl-5 pr-2 flex items-center hover:border-white/20 hover:bg-black/60 transition-all cursor-pointer flex-shrink-0 group overflow-hidden relative shadow-[0_4px_12px_rgba(0,0,0,0.3)] no-underline"
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${grad} opacity-70 group-hover:opacity-100 transition-opacity`}></div>
      <div className="flex-1 flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1.5">
             <div className="w-2 h-2" style={{ backgroundColor: color === 'neon-cyan' ? '#38bdf8' : color === 'neon-purple' ? '#a78bfa' : '#22c55e', boxShadow: `0 0 6px ${color === 'neon-cyan' ? '#38bdf8' : color === 'neon-purple' ? '#a78bfa' : '#22c55e'}` }}></div>
             <span className="text-[0.55rem] md:text-xs font-pixel text-gray-500 uppercase tracking-widest">{group}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-pixel text-xs md:text-sm text-white whitespace-nowrap">{title}</span>
            <span className="text-xs font-silkscreen text-gray-500 whitespace-nowrap hidden sm:inline">{desc}</span>
          </div>
        </div>
        <div className="w-10 h-10 flex items-center justify-center pixel-icon opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ color: color === 'neon-cyan' ? '#38bdf8' : color === 'neon-purple' ? '#a78bfa' : '#22c55e' }}>{icon}</div>
      </div>
    </a>
  );
}

function ServiceRow({ name, desc, category, status, icon, url }) {
  const isOnline = status === 'online';
  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex flex-col md:grid md:grid-cols-[4fr_5fr_3fr_2fr] px-5 py-4 md:px-6 md:py-4 hover:bg-white/[0.04] transition-colors group cursor-pointer border-b border-white/5 last:border-b-0 hover:z-10 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_-1px_0_0_rgba(255,255,255,0.2)] no-underline items-center">
      <div className="flex items-center justify-between md:justify-start w-full">
        <div className="flex items-center gap-4">
          <div className="text-gray-500 group-hover:text-neon-cyan pixel-icon transition-colors">{icon}</div>
          <span className="font-pixel text-xs md:text-sm text-white tracking-widest group-hover:text-neon-cyan transition-colors">{name}</span>
        </div>
        <div className="md:hidden flex items-center gap-2">
           <span className="font-pixel text-[0.5rem] text-gray-500 uppercase">{isOnline ? '12ms' : 'Err'}</span>
           <div className={`w-2 h-2 rounded-none ${isOnline ? 'bg-neon-green shadow-[0_0_8px_#22c55e]' : 'bg-neon-red shadow-[0_0_8px_#f43f5e]'}`}></div>
        </div>
      </div>
      <div className="flex md:contents mt-2 md:mt-0 ml-9 md:ml-0 items-center gap-4 w-full">
        <div className="font-silkscreen text-xs text-gray-500 tracking-wider truncate flex-1 md:flex-none pt-1 group-hover:text-gray-300 transition-colors max-w-[120px] sm:max-w-none">{desc}</div>
        <div className="md:flex md:items-center">
          <div className="font-pixel text-[0.55rem] text-gray-600 uppercase tracking-widest bg-black/40 border border-white/5 px-2 py-1 rounded inline-block whitespace-nowrap">{category}</div>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-end gap-4 w-full">
        <span className="font-pixel text-xs text-gray-500 uppercase tracking-widest">{isOnline ? '12ms' : 'Error'}</span>
        <div className={`w-2 h-2 rounded-none ${isOnline ? 'bg-neon-green shadow-[0_0_8px_#22c55e]' : 'bg-neon-red shadow-[0_0_8px_#f43f5e]'}`}></div>
      </div>
    </a>
  );
}
