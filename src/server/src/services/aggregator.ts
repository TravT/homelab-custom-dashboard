import { config } from '../config.js';

export interface DashboardState {
  timestamp: string;
  netdata: {
    cpu: any;
    ram: any;
    lan: any;
    tailscale: any;
    temp: any;
    diskSpace: any;
    diskIo: any;
  };
  battery: any;
  nomad: any;
  traefik: any;
  sonarr: any;
  radarr: any;
}

interface TelemetryCache {
  netdata: DashboardState['netdata'];
  battery: any;
  nomad: any;
  traefik: any;
  expiresAt: number;
}

interface CalendarCache {
  sonarr: any;
  radarr: any;
  expiresAt: number;
}

let telemetryCache: TelemetryCache | null = null;
let calendarCache: CalendarCache | null = null;

async function fetchWithTimeout(url: string, timeoutMs = 2500): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function getTelemetryData(): Promise<Omit<TelemetryCache, 'expiresAt'>> {
  const now = Date.now();
  if (telemetryCache && telemetryCache.expiresAt > now) {
    return telemetryCache;
  }

  const netdataBase = `${config.netdataUrl}/api/v1`;

  const [
    cpuRes,
    ramRes,
    lanRes,
    tailRes,
    tempRes,
    diskSpaceRes,
    diskIoRes,
    batteryRes,
    nomadRes,
    traefikRes,
  ] = await Promise.allSettled([
    fetchWithTimeout(`${netdataBase}/data?chart=system.cpu&points=1&after=-3`),
    fetchWithTimeout(`${netdataBase}/data?chart=system.ram&points=1&after=-3`),
    fetchWithTimeout(`${netdataBase}/data?chart=net.enp0s31f6&points=1&after=-3`),
    fetchWithTimeout(`${netdataBase}/data?chart=net.tailscale0&points=1&after=-3`),
    fetchWithTimeout(`${netdataBase}/data?chart=sensors.temperature_coretemp-isa-0000_temp1_Package_id_0_input&points=1&after=-3`),
    fetchWithTimeout(`${netdataBase}/data?chart=disk_space./&points=1&after=-5`),
    fetchWithTimeout(`${netdataBase}/data?chart=disk.sda&points=1&after=-3`),
    fetchWithTimeout(`${config.batteryUrl}/stats`),
    fetchWithTimeout(`${config.nomadUrl}/v1/jobs`),
    fetchWithTimeout(`${config.traefikUrl}/api/http/services`),
  ]);

  const freshTelemetry: Omit<TelemetryCache, 'expiresAt'> = {
    netdata: {
      cpu: cpuRes.status === 'fulfilled' ? cpuRes.value : null,
      ram: ramRes.status === 'fulfilled' ? ramRes.value : null,
      lan: lanRes.status === 'fulfilled' ? lanRes.value : null,
      tailscale: tailRes.status === 'fulfilled' ? tailRes.value : null,
      temp: tempRes.status === 'fulfilled' ? tempRes.value : null,
      diskSpace: diskSpaceRes.status === 'fulfilled' ? diskSpaceRes.value : null,
      diskIo: diskIoRes.status === 'fulfilled' ? diskIoRes.value : null,
    },
    battery: batteryRes.status === 'fulfilled' ? batteryRes.value : null,
    nomad: nomadRes.status === 'fulfilled' ? nomadRes.value : null,
    traefik: traefikRes.status === 'fulfilled' ? traefikRes.value : null,
  };

  telemetryCache = {
    ...freshTelemetry,
    expiresAt: now + config.cacheTtlMs, // 2s TTL
  };

  return freshTelemetry;
}

async function getCalendarData(): Promise<Omit<CalendarCache, 'expiresAt'>> {
  const now = Date.now();
  if (calendarCache && calendarCache.expiresAt > now) {
    return calendarCache;
  }

  const nowDate = new Date();
  const pastDate = new Date(nowDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  const futureDate = new Date(nowDate.getTime() + 180 * 24 * 60 * 60 * 1000);
  const startStr = pastDate.toISOString().split('T')[0];
  const endStr = futureDate.toISOString().split('T')[0];

  const [sonarrRes, radarrRes] = await Promise.allSettled([
    fetchWithTimeout(`${config.sonarrUrl}/api/v3/calendar?apiKey=${config.sonarrApiKey}&includeSeries=true&start=${startStr}&end=${endStr}`, 4000),
    fetchWithTimeout(`${config.radarrUrl}/api/v3/calendar?apiKey=${config.radarrApiKey}&start=${startStr}&end=${endStr}`, 4000),
  ]);

  const freshCalendar: Omit<CalendarCache, 'expiresAt'> = {
    sonarr: sonarrRes.status === 'fulfilled' ? sonarrRes.value : null,
    radarr: radarrRes.status === 'fulfilled' ? radarrRes.value : null,
  };

  calendarCache = {
    ...freshCalendar,
    expiresAt: now + 60000, // 60s TTL
  };

  return freshCalendar;
}

export async function getDashboardState(): Promise<DashboardState> {
  const [telemetry, calendar] = await Promise.all([
    getTelemetryData(),
    getCalendarData(),
  ]);

  return {
    timestamp: new Date().toISOString(),
    netdata: telemetry.netdata,
    battery: telemetry.battery,
    nomad: telemetry.nomad,
    traefik: telemetry.traefik,
    sonarr: calendar.sonarr,
    radarr: calendar.radarr,
  };
}
