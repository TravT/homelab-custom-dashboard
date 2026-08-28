# Homelab Command Center Dashboard

> Cyber-pixel aesthetic homelab dashboard — React + Vite + Tailwind v4, fully self-contained, no external CDN dependencies.

**Live on local network:** http://192.168.0.165:5173

---

## Quick Start

```bash
npm install
npm run dev          # starts at http://localhost:5173 (also exposed on LAN via --host)
```

---

## Stack

| | |
|---|---|
| **Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Fonts** | Self-hosted TTF (VT323, Press Start 2P, Silkscreen, Pixelify Sans) |
| **Deploy** | Docker ? Nomad |

---

## Project Structure

```
custom_dashboard/
+-- public/
¦   +-- fonts/          # Self-hosted pixel fonts (no Google CDN)
+-- src/
¦   +-- App.jsx         # Entire application (all components in one file)
¦   +-- index.css       # Tailwind + @font-face + design tokens
+-- docs/
¦   +-- adr/            # Architecture Decision Records
+-- GEMINI.md           # ?? Full project wiki — read this for deep context
+-- README.md           # This file
```

---

## Architecture & Design Decisions

Full architecture is documented in **[GEMINI.md](GEMINI.md)**.

Key ADRs:
- [ADR-001](docs/adr/ADR-001-custom-app-vs-homepage-hack.md) — Why we built from scratch instead of hacking gethomepage/homepage
- [ADR-002](docs/adr/ADR-002-single-file-architecture.md) — Single App.jsx file approach
- [ADR-003](docs/adr/ADR-003-mobile-stack-vs-desktop-grid.md) — Mobile swipe stack vs Desktop grid
- [ADR-004](docs/adr/ADR-004-self-hosted-fonts.md) — Self-hosted fonts (air-gap safe)

---

## Features

- ?? **Live system graphs** — CPU, Memory, Network I/O, Disk I/O (1s ticker, Recharts)
- ?? **3D Flip Cards** — Network card flips to Server Health (CPU temp + UPS battery); Storage card flips to Disk I/O chart
- ??? **Release Radar** — Auto-scrolling carousel + full-screen calendar modal (Sonarr/Radarr)
- ??? **Weather widget** — Dynamically expands 2?7 days as screen width grows
- ?? **Active Services** — 25 homelab services across 5 pages; swipe stack on mobile, CSS grid on desktop
- ? **Luck of the Day** — Typewriter terminal animation on load
- ?? **Cyber-pixel aesthetic** — VT323/Press Start 2P/Silkscreen fonts, neon glows, glass morphism

---

## Next Session — Data Integration

Current status: **UI/UX complete. All data is dummy.**

1. Wire **Netdata REST API** ? live hardware metrics
2. Wire **Sonarr + Radarr API** ? real release calendar
3. Optionally wire **Uptime Kuma** ? live service status dots
4. Write **Dockerfile** (multi-stage: Node build ? Nginx serve)
5. Write **Nomad job file**
6. Decide **sidebar navigation** behavior

See the handoff document for the copy-paste onboarding prompt for the next agent.

---

*Built with Antigravity + Gemini. August 2026.*
