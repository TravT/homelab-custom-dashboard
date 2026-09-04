import path from 'node:path';

const HOST_IP = process.env.HOST_IP || '192.168.0.48';

export const config = {
  port: parseInt(process.env.PORT || '80', 10),
  hostIp: HOST_IP,
  netdataUrl: process.env.NETDATA_URL || `http://${HOST_IP}:19999`,
  nomadUrl: process.env.NOMAD_URL || `http://${HOST_IP}:4646`,
  traefikUrl: process.env.TRAEFIK_URL || `http://${HOST_IP}:8081`,
  batteryUrl: process.env.BATTERY_URL || `http://${HOST_IP}:8005`,
  sonarrUrl: process.env.SONARR_URL || `http://${HOST_IP}:8989`,
  radarrUrl: process.env.RADARR_URL || `http://${HOST_IP}:7878`,
  sonarrApiKey: process.env.SONARR_API_KEY || '8d39d99bab98425c8f22e809a405ddbc',
  radarrApiKey: process.env.RADARR_API_KEY || 'c47ae26b45084cbb8c31d60d32487cb7',
  staticDir: process.env.STATIC_DIR || path.resolve(process.cwd(), 'public'),
  cacheTtlMs: 2000,
};
