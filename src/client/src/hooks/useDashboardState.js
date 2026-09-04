import { useState, useEffect } from 'react';
import React from 'react';
import { Play, Eye, Download, HardDrive } from 'lucide-react';
import { defaultReleaseData } from '../data/releaseConfig.jsx';

const generateInitialData = () => [
  { time: 0, cpu: 0, ram: 0, lan: 0, tailscale: 0, diskIO: 0, temp: 0 }
];

export function useDashboardState() {
  const [graphData, setGraphData] = useState(generateInitialData());
  const [cpuTemp, setCpuTemp] = useState(50);
  const [batteryStats, setBatteryStats] = useState({ percent: 100, plugged: true });
  const [storageStats, setStorageStats] = useState({
    nvme: { total_gb: 465.4, used_gb: 223.1, percent: 47.9 },
    gdrive: { total_tb: 5.0, used_tb: 0.65, percent: 13.0 }
  });
  const [diskIOVal, setDiskIOVal] = useState({ val: '0.0', unit: 'MB/s' });
  const [nvmeActive, setNvmeActive] = useState(false);
  const [gdriveActive, setGdriveActive] = useState(false);
  const [releaseData, setReleaseData] = useState(defaultReleaseData);
  const [rawReleases, setRawReleases] = useState([]);
  const [serviceHealth, setServiceHealth] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardState = async () => {
      try {
        const res = await fetch('/api/dashboard-state');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data) return;

        // 1. Process Netdata metrics
        if (data.netdata) {
          const { cpu: cpuData, ram: ramData, lan: lanData, tailscale: tailData, temp: tempData, diskSpace: diskSpaceData, diskIo: diskIoData } = data.netdata;

          let liveCpu = 20;
          if (cpuData?.data?.[0]) {
            const labels = cpuData.labels;
            const vals = cpuData.data[0];
            const total = labels.reduce((acc, label, idx) => {
              if (idx > 0 && label !== 'idle') return acc + (Number(vals[idx]) || 0);
              return acc;
            }, 0);
            liveCpu = Math.max(1, Math.min(100, total));
          }

          let liveRam = 8.0;
          if (ramData?.data?.[0]) {
            const labels = ramData.labels;
            const vals = ramData.data[0];
            const usedIdx = labels.indexOf('used');
            if (usedIdx !== -1) {
              liveRam = (Number(vals[usedIdx]) || 0) / 1024;
            }
          }

          let liveLan = 0;
          if (lanData?.data?.[0]) {
            const vals = lanData.data[0];
            const recv = Math.abs(Number(vals[1]) || 0);
            const sent = Math.abs(Number(vals[2]) || 0);
            liveLan = (recv + sent) / (8 * 1024);
          }

          let liveTailscale = 0;
          if (tailData?.data?.[0]) {
            const vals = tailData.data[0];
            const recv = Math.abs(Number(vals[1]) || 0);
            const sent = Math.abs(Number(vals[2]) || 0);
            liveTailscale = (recv + sent) / (8 * 1024);
          }

          let liveTemp = 50;
          if (tempData?.data?.[0]) {
            liveTemp = Number(tempData.data[0][1]) || 50;
            setCpuTemp(Math.round(liveTemp));
          }

          if (diskSpaceData?.data?.[0]) {
            const labels = diskSpaceData.labels;
            const vals = diskSpaceData.data[0];
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

          let liveDiskIOMB = 0;
          if (diskIoData?.data?.[0]) {
            const vals = diskIoData.data[0];
            const reads = Math.abs(Number(vals[1]) || 0);
            const writes = Math.abs(Number(vals[2]) || 0);
            const totalKiB = reads + writes;
            liveDiskIOMB = totalKiB / 1024;

            if (liveDiskIOMB >= 1) {
              setDiskIOVal({ val: liveDiskIOMB.toFixed(1), unit: 'MB/s' });
            } else {
              setDiskIOVal({ val: Math.round(totalKiB).toString(), unit: 'KB/s' });
            }

            setNvmeActive(totalKiB > 50);
            setGdriveActive(liveTailscale > 0.1 || (liveLan > 2 && totalKiB > 200));
          }

          setGraphData(prev => {
            const last = prev[prev.length - 1];
            const nextPoint = {
              time: (last?.time || 0) + 1,
              cpu: liveCpu,
              ram: liveRam,
              lan: liveLan,
              tailscale: liveTailscale,
              diskIO: liveDiskIOMB,
              temp: Math.round(liveTemp)
            };
            let currentList = prev;
            if (currentList.length >= 3 && currentList[0]?.time === 0) {
              currentList = currentList.slice(1);
            }
            if (currentList.length < 30) {
              return [...currentList, nextPoint];
            }
            return [...currentList.slice(1), nextPoint];
          });
        }

        // 2. Process Battery & Storage stats
        if (data.battery) {
          setBatteryStats({
            percent: Math.round(data.battery.battery_percent ?? 100),
            plugged: !!data.battery.power_plugged
          });
          if (data.battery.storage?.nvme) {
            setStorageStats(prev => ({
              ...prev,
              nvme: data.battery.storage.nvme,
              gdrive: data.battery.storage.gdrive || prev.gdrive
            }));
          }
        }

        // 3. Process Sonarr & Radarr releases
        const now = new Date();
        const allReleases = [];

        if (Array.isArray(data.sonarr)) {
          data.sonarr.forEach(item => {
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

        if (Array.isArray(data.radarr)) {
          data.radarr.forEach(item => {
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
          allReleases.sort((a, b) => a.date - b.date);
          setRawReleases(allReleases);

          const futureOnly = allReleases.filter(r => r.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()));
          const list = futureOnly.length > 0 ? futureOnly : allReleases;

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

        // 4. Process Traefik & Nomad service health
        const healthMap = {};
        if (Array.isArray(data.traefik)) {
          data.traefik.forEach(svc => {
            const name = svc.name || '';
            const cleanName = name.split('@')[0].toLowerCase();
            const serverStatus = svc.serverStatus || {};
            const servers = Object.values(serverStatus);
            const isUp = svc.status === 'enabled' && (servers.length === 0 || servers.includes('UP'));
            healthMap[cleanName] = {
              status: isUp ? 'online' : 'offline',
              latency: '...'
            };
          });
        }

        if (Array.isArray(data.nomad)) {
          data.nomad.forEach(job => {
            const jId = (job.ID || '').toLowerCase();
            const isRunning = job.Status === 'running';
            if (jId === 'ollama') healthMap['ollama'] = { status: isRunning ? 'online' : 'offline', latency: '...' };
            if (jId === 'llama-cpp' || jId === 'llama') healthMap['llama'] = { status: isRunning ? 'online' : 'offline', latency: '...' };
            if (jId === 'mosquitto') healthMap['mosquitto'] = { status: isRunning ? 'online' : 'offline', latency: '...' };
          });
        }

        if (healthMap['traefik-dash'] || healthMap['api']) healthMap['traefik'] = { status: 'online', latency: '...' };
        if (healthMap['files']) healthMap['files'] = { status: healthMap['files'].status, latency: '...' };
        if (healthMap['wsscrcpy']) healthMap['wsscrcpy'] = { status: healthMap['wsscrcpy'].status, latency: '...' };
        if (healthMap['vscode']) healthMap['vscode'] = { status: healthMap['vscode'].status, latency: '...' };

        setServiceHealth(prev => ({ ...prev, ...healthMap }));
      } catch (err) {
        console.error('BFF dashboard-state polling error:', err);
      }
    };

    fetchDashboardState();
    const stateInterval = setInterval(fetchDashboardState, 2000);

    return () => {
      isMounted = false;
      clearInterval(stateInterval);
    };
  }, []);

  return {
    graphData,
    cpuTemp,
    batteryStats,
    storageStats,
    diskIOVal,
    nvmeActive,
    gdriveActive,
    releaseData,
    rawReleases,
    serviceHealth,
    setServiceHealth,
  };
}
