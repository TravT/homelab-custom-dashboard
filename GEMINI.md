# GEMINI.md — Homelab Command Center Dashboard

> This is the central knowledge hub for the project. All agents should read this first.

## Project Overview

A fully custom, pixel/cyber-aesthetic homelab dashboard built from scratch with **React 19 + Vite + Tailwind CSS v4**. Replaces the official gethomepage/homepage app which was too rigid for the desired UX. Deployed as a Docker container on a Nomad cluster.

**Live dev:** http://192.168.0.165:5173  
**Repo:** https://github.com/TravT/homelab-custom-dashboard  
**Project path:** C:\Users\tiago\Desktop\Sandbox\AI_Workspace\Projects\Antigravity_projects\Homepage\custom_dashboard

---

## Architecture

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (@tailwindcss/vite) |
| Charts | Recharts (AreaChart, no animation) |
| Icons | Lucide React |
| Fonts | Self-hosted TTF in public/fonts/ (see ADR-004) |
| Deploy target | Docker + Nomad |

**Key files:**
- src/App.jsx — **entire app** (all components in one file, see ADR-002)
- src/index.css — Tailwind import, @theme tokens, @font-face declarations, global utilities
- index.html — minimal HTML shell, no external CDN links
- public/fonts/ — VT323, Press Start 2P, Silkscreen, Pixelify Sans (TTF)

---

## Design System

### Fonts
| Tailwind class | Font | Usage |
|---|---|---|
| ont-vt323 | VT323 | Section headers, large titles |
| ont-pixel | Press Start 2P | Primary data values, pixel labels |
| ont-silkscreen | Silkscreen | Subtext, categories, metadata |
| ont-pixelify | Pixelify Sans | (secondary decorative) |

### Colors (Tailwind tokens)
- 
eon-cyan #38bdf8 — Primary accent, active states
- 
eon-purple #a78bfa — Secondary accent, modals
- 
eon-green #22c55e — Online/healthy status
- 
eon-red #f43f5e — Error/warning status
- cyber-bg #08080a — Page background
- cyber-card #121214 — Card background

### Key patterns
- All cards: g-cyber-card/80 backdrop-blur-md rounded-xl border border-white/5
- Dotted page background via inline style on root div (radial-gradient 24px grid)
- pixel-icon class: image-rendering: pixelated; filter: drop-shadow(...) on Lucide icons

---

## UI Sections

### 1. Header
- "Hello, Tiago" greeting (VT323) + "Command Center" subtext
- **Luck of the Day**: terminal typewriter animation, blinking cursor (Press Start 2P, neon-green)
- **Weather widget**: dynamically expands from 2 days (mobile) to 7 days (2xl) using breakpoint-conditional lex/hidden classes
- **CV button**: opens a modal with a QR code placeholder

### 2. System Metrics (4-card grid)
- **Processor** + **Memory**: standard GraphBox with live Recharts AreaChart (1s interval dummy data)
- **Network I/O** ? **FlipCard**: front = live network chart; back = Server Health (CPU temp + UPS battery % + live temp area chart)
- **Storage** ? **FlipCard**: front = segmented bars for NVMe/GDrive; back = Disk I/O AreaChart

### 3. Release Radar
- Auto-scrolling horizontal carousel (setInterval 4500ms)
- Calendar icon button opens full-screen modal (blur overlay)
- Mobile: calendar cells are small; Desktop: md:aspect-square min-h-[80px]

### 4. Active Services
- **25 services** across 5 pages (5 per page), organized by type:
  - Page 1: Core Infra (Traefik, Pi-hole, Uptime Kuma, Home Assistant, Mosquitto)
  - Page 2: Media (Jellyfin, Jellyseerr, Sonarr, Radarr, Bazarr)
  - Page 3: Downloads (qBittorrent, Prowlarr, FlareSolverr, RDT-Client, Maintainerr)
  - Page 4: AI & Docs (Open WebUI, Ollama, Llama.cpp, Paperless-ngx, FileBrowser)
  - Page 5: Utilities (Guacamole, ws-scrcpy, Netdata, Dozzle, n8n)
- **Mobile/Tablet:** Tinder-style swipeable stacked cards (touch gestures)
- **Desktop (xl+):** CSS Grid rendering all pages side by side

### 5. Navigation
- **Desktop:** Fixed left sidebar (80px wide), auto-hides on scroll down
- **Mobile:** Bottom nav bar, slides up/down; GripHorizontal braille-style pull tab

---

## Known Issues / Caveats

1. **PowerShell template literal stripping:** When writing JSX to files via PowerShell Set-Content, backticks are escaped. Always run the post-process replace after writing:
   `powershell
   (Get-Content src/App.jsx) -replace '\\', '' -replace '\\\$', '$' | Set-Content src/App.jsx
   `
2. **All data is currently dummy:** generateInitialData() in App.jsx produces fake graphs. Real Netdata/Sonarr API calls are the next major task.
3. **Sidebar icons are decorative:** They don't route yet. Decision on behavior is pending (see next session objectives).

---

## ADRs
- [ADR-001: Custom App vs Homepage Hack](docs/adr/ADR-001-custom-app-vs-homepage-hack.md)
- [ADR-002: Single-File Architecture](docs/adr/ADR-002-single-file-architecture.md)
- [ADR-003: Mobile Stack vs Desktop Grid](docs/adr/ADR-003-mobile-stack-vs-desktop-grid.md)
- [ADR-004: Self-Hosted Fonts](docs/adr/ADR-004-self-hosted-fonts.md)

---

## Next Steps (Data Integration Phase)

1. **Netdata REST API** ? replace generateInitialData() with /api/v1/data calls for CPU, RAM, Network, Disk
2. **Sonarr/Radarr API** ? replace eleaseData with /api/v3/calendar calls
3. **Uptime Kuma** (optional) ? live status dots for each service
4. **Dockerize** ? multi-stage Dockerfile (Node build ? Nginx serve)
5. **Nomad job file** ? deploy to homelab cluster
6. **Sidebar icons** ? decide routing/navigation behavior
