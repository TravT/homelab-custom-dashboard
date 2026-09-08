# Legacy 3D Container Cluster Network Animation

This directory preserves the signature 3D force-directed container cluster network animation and hardware polling scripts originally developed for GetHomepage (`homepage.home.arpa`), archived on September 8, 2026.

---

## 1. What This Code Does

The script `network-3d.js` renders a live, interactive 3D force-directed graph in the browser background representing the entire homelab container ecosystem:
- **3D Engine**: Uses [Three.js](https://threejs.org/) (`v0.160.0`) and [`3d-force-graph`](https://github.com/vasturiano/3d-force-graph) (`v1.73.2`).
- **Starfield Point Cloud**: Spawns a 15,000-particle ambient starfield with continuous subtle multi-axis rotation (`PointsMaterial`).
- **Container Node Clusters**: Automatically groups containers into three primary subsystem clusters:
  - `Media_Stack`: `radarr`, `sonarr`, `prowlarr`, `qbittorrent`, `jellyfin`, `bazarr`, `jellyseerr`, `flaresolverr`, `rdt-client`
  - `AI_Stack`: `ollama`, `llama-cpp`, `open-webui`, `n8n-server`, `n8n-db`, `agent-orchestrator`
  - `Infra_Stack`: `pihole`, `proxy-manager`, `netdata`, `homepage`, `dozzle`, `uptime-kuma`, `portainer`, `filebrowser`, `homeassistant`, `mosquitto`, `paperless`, `romm`
- **Dynamic Netdata Traffic**:
  - Dynamically discovers all running containers via Netdata's `/api/v1/charts` (`cgroup_*.net_eth0`).
  - Polls live throughput per container (`/api/v1/data?chart=...&points=1&format=json`).
  - Scales link widths, node sizes (`Math.log10(bandwidth)`), link colors (WAN highlights), and emits animated directional particles representing real live network packets traveling through links!
- **Flawless Camera Orbit**: Implements smooth mathematical circular camera rotation around the origin:
  ```javascript
  const radius = Math.sqrt(cam.position.x * cam.position.x + cam.position.z * cam.position.z);
  let currentAngle = Math.atan2(cam.position.x, cam.position.z);
  currentAngle += 0.001;
  Graph.cameraPosition({
      x: radius * Math.sin(currentAngle),
      z: radius * Math.cos(currentAngle)
  });
  ```
- **Focus Mode**: Floating action button that hides foreground UI elements and allows full 3D graph orbit/drag manipulation.

---

## 2. Preserved Files

| File | Purpose | Lines |
|---|---|---|
| `network-3d.js` | Main 3D force-directed graph, starfield, Netdata packet particles, and auto-rotation engine | 389 |
| `hardware-stats.js` | Direct polling for Dell sys-stats (`:8005/stats`) battery, CPU, and RAM | 168 |

---

## 3. How to Convert to React in `homelab-custom-dashboard`

To revive this visualization as an optional cybernetic background or full-screen cluster visualizer inside the new dashboard:

### Option A: Direct Canvas Wrapper Component
1. Install dependencies in `src/client`:
   ```bash
   npm install 3d-force-graph three three-spritetext
   ```
2. Create a React component `src/client/src/components/telemetry/ClusterMesh3D.tsx`:
   - Mount a container `div` using `useRef<HTMLDivElement>(null)`.
   - In `useEffect()`, initialize `ForceGraph3D()(containerRef.current)`.
   - Wire Netdata queries through the Fastify BFF (e.g. `/api/telemetry/netdata-charts`) to avoid direct browser-to-port-19999 requests and prevent CORS.
   - Return cleanup function `() => Graph._destructor()`.

### Option B: React Three Fiber (`@react-three/fiber`)
For seamless integration into React 19 / Vite:
1. Install `@react-three/fiber`, `@react-three/drei`, and `d3-force-3d`.
2. Convert nodes and packet particles into instanced meshes (`<instancedMesh>`) for 60 FPS GPU performance on mobile devices.
