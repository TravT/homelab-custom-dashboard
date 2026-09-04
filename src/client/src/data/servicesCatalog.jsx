import React from 'react';
import {
  Activity, Wifi, Home, Cpu, Play, Search, Folder,
  Download, Database, Network, MessageSquare
} from 'lucide-react';

/**
 * Complete directory catalog of all 25 registered homelab cluster services.
 * Structured into 5 functional pages: Infra, Media, Ingestion, AI, and Remote Tools.
 */
export const servicesCatalog = [
  // Page 1: Infrastructure & Core
  [
    { id: 'traefik', name: 'Traefik', desc: 'Core Reverse Proxy', category: 'Infra', icon: <Activity size={18} />, url: 'http://traefik.home.arpa/' },
    { id: 'pihole', name: 'Pi-hole', desc: 'DNS & Ad Blocking', category: 'Infra', icon: <Wifi size={18} />, url: 'http://pihole.home.arpa/admin/' },
    { id: 'kuma', name: 'Uptime Kuma', desc: 'Status Monitoring', category: 'Infra', icon: <Activity size={18} />, url: 'http://uptime-kuma.home.arpa/' },
    { id: 'ha', name: 'Home Assistant', desc: 'Smart Home Hub', category: 'Smart Home', icon: <Home size={18} />, url: 'http://homeassistant.home.arpa/' },
    { id: 'vscode', name: 'VSCode Server', desc: 'Web Code Editor', category: 'Dev Tools', icon: <Cpu size={18} />, url: 'http://vscode.home.arpa/' },
  ],
  // Page 2: Media Center
  [
    { id: 'jellyfin', name: 'Jellyfin', desc: 'Main Media Server', category: 'Media', icon: <Play size={18} />, url: 'http://jellyfin.home.arpa/' },
    { id: 'jellyseerr', name: 'Jellyseerr', desc: 'Media Requests', category: 'Media', icon: <Search size={18} />, url: 'http://jellyseerr.home.arpa/' },
    { id: 'sonarr', name: 'Sonarr', desc: 'TV Management', category: 'Media Mgmt', icon: <Search size={18} />, url: 'http://sonarr.home.arpa/' },
    { id: 'radarr', name: 'Radarr', desc: 'Movie Management', category: 'Media Mgmt', icon: <Search size={18} />, url: 'http://radarr.home.arpa/' },
    { id: 'bazarr', name: 'Bazarr', desc: 'Subtitle Management', category: 'Media Mgmt', icon: <Folder size={18} />, url: 'http://bazarr.home.arpa/' },
  ],
  // Page 3: Downloads & Ingestion
  [
    { id: 'qbittorrent', name: 'qBittorrent', desc: 'Download Client', category: 'Downloads', icon: <Download size={18} />, url: 'http://qbittorrent.home.arpa/' },
    { id: 'prowlarr', name: 'Prowlarr', desc: 'Indexer Management', category: 'Downloads', icon: <Database size={18} />, url: 'http://prowlarr.home.arpa/' },
    { id: 'flaresolverr', name: 'FlareSolverr', desc: 'Cloudflare Bypass', category: 'Downloads', icon: <Network size={18} />, url: 'http://flaresolverr.home.arpa/' },
    { id: 'rdt', name: 'RDT-Client', desc: 'Real-Debrid Client', category: 'Downloads', icon: <Download size={18} />, url: 'http://rdt.home.arpa/' },
    { id: 'maintainerr', name: 'Maintainerr', desc: 'Media Cleanup', category: 'Media Mgmt', icon: <Folder size={18} />, url: 'http://maintainerr.home.arpa/' },
  ],
  // Page 4: AI & Knowledge
  [
    { id: 'openwebui', name: 'Open WebUI', desc: 'Local LLM Interface', category: 'AI', icon: <MessageSquare size={18} />, url: 'http://openwebui.home.arpa/' },
    { id: 'ollama', name: 'Ollama', desc: 'LLM Runner', category: 'AI', icon: <Cpu size={18} />, url: 'http://ollama.home.arpa/' },
    { id: 'llama', name: 'Llama.cpp', desc: 'Model Inference', category: 'AI', icon: <Cpu size={18} />, url: 'http://llama.home.arpa/' },
    { id: 'paperless', name: 'Paperless-ngx', desc: 'Document OCR & Mgmt', category: 'Docs', icon: <Folder size={18} />, url: 'http://paperless.home.arpa/' },
    { id: 'files', name: 'FileBrowser', desc: 'Web File Manager', category: 'Docs', icon: <Folder size={18} />, url: 'http://filebrowser.home.arpa/' },
  ],
  // Page 5: Tools & Remote Control
  [
    { id: 'guacamole', name: 'Guacamole', desc: 'Remote Desktop', category: 'Infra', icon: <Network size={18} />, url: 'http://guacamole.home.arpa/' },
    { id: 'wsscrcpy', name: 'ws-scrcpy', desc: 'Android Mirroring', category: 'Infra', icon: <Network size={18} />, url: 'http://ws-scrcpy.home.arpa/' },
    { id: 'netdata', name: 'Netdata', desc: 'Hardware Metrics', category: 'Infra', icon: <Activity size={18} />, url: 'http://netdata.home.arpa/' },
    { id: 'dozzle', name: 'Dozzle', desc: 'Docker Logs', category: 'Infra', icon: <Database size={18} />, url: 'http://dozzle.home.arpa/' },
    { id: 'n8n', name: 'n8n', desc: 'Workflow Automation', category: 'Smart Home', icon: <Activity size={18} />, url: 'http://n8n.home.arpa/' },
  ]
];
