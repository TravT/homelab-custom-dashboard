(function() {
  function injectNetworkBackground() {
    if (!document.body) { setTimeout(injectNetworkBackground, 100); return; }
    if (document.getElementById('network-canvas')) return;

    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'network-canvas';
    canvasContainer.style.position = 'fixed';
    canvasContainer.style.top = '0';
    canvasContainer.style.left = '0';
    canvasContainer.style.width = '100vw';
    canvasContainer.style.height = '100vh';
    canvasContainer.style.zIndex = '0';
    canvasContainer.style.overflow = 'hidden';
    canvasContainer.style.pointerEvents = 'none';
    document.body.insertBefore(canvasContainer, document.body.firstChild);

    console.log("[HomeHub] 3D Network Background (Layer 1 - Red Cube Debug) initialized.");

    if (!window.THREE) {
      const scriptThree = document.createElement('script');
      scriptThree.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      scriptThree.onload = () => {
        const scriptForce = document.createElement('script');
        scriptForce.src = 'https://unpkg.com/3d-force-graph@1.73.2/dist/3d-force-graph.min.js';
        scriptForce.onload = initGraph;
        document.head.appendChild(scriptForce);
      };
      document.head.appendChild(scriptThree);
    } else {
      initGraph();
    }

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    async function initGraph() {
      if (typeof SpriteText === 'undefined') {
        await loadScript('https://unpkg.com/three-spritetext');
      }

      const currentIp = window.location.hostname;
      const isIp = /^(?:[0-9]{1,3}\.)[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(currentIp) || currentIp === 'localhost';
      const baseUrl = isIp ? `http://${currentIp}:19999` : 'http://netdata.home.arpa';

      const isNightMode = window.isNightMode === true;
      const colorWAN = isNightMode ? '#d946ef' : '#7c3aed';
      const colorNode = isNightMode ? '#22d3ee' : '#0284c7';
      const colorParticle = isNightMode ? '#2dd4bf' : '#0369a1';
      const textColor = isNightMode ? '#ffffff' : '#1e293b';
      const colorLink = isNightMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(30, 41, 59, 0.6)';

      const imageCache = {};

      function createNodeSprite(node) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Text Background
        ctx.font = '24px "Inter", sans-serif';
        const textWidth = ctx.measureText(node.id).width;
        ctx.fillStyle = isNightMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.roundRect(128 - textWidth/2 - 8, 104, textWidth + 16, 32, 6);
        ctx.fill();

        // Draw Text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = textColor;
        ctx.fillText(node.id, 128, 120);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        const scale = node.type === 'wan' ? 40 : 30;
        sprite.scale.set(scale * 2, scale * 1.1, 1);
        
        if (node.type !== 'wan') {
          const iconName = node.id.toLowerCase().replace(/docker_|-server|-redis|-client|-manager/g, '');
          const fallbackIconName = 'server';
          
          const drawIcon = (img) => {
            ctx.clearRect(0, 0, canvas.width, 100);
            const imgSize = 64;
            ctx.drawImage(img, 128 - imgSize/2, 20, imgSize, imgSize);
            texture.needsUpdate = true;
          };

          if (imageCache[iconName]) {
            drawIcon(imageCache[iconName]);
          } else {
            const img = new Image();
            img.onload = () => {
              imageCache[iconName] = img;
              drawIcon(img);
            };
            img.onerror = () => {
              if (!imageCache[fallbackIconName]) {
                 const fallback = new Image();
                 fallback.onload = () => {
                   imageCache[fallbackIconName] = fallback;
                   drawIcon(fallback);
                 };
                 fallback.src = `/images/database.png`;
              } else {
                 drawIcon(imageCache[fallbackIconName]);
              }
            };
            img.src = `/images/${iconName}.png`;
          }
        } else {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, 100);
              const imgSize = 80;
              ctx.drawImage(img, 128 - imgSize/2, 10, imgSize, imgSize);
              texture.needsUpdate = true;
            };
            img.src = `/images/homeassistant.png`; // Fallback for globe
        }
        
        return sprite;
      }

      const Graph = ForceGraph3D()(canvasContainer)
        .backgroundColor('rgba(0,0,0,0)') 
        .nodeVal('val')
        .nodeThreeObject(node => createNodeSprite(node))
        .linkWidth(link => 1 + Math.log10(Math.max(1, link.bandwidth || 0)) * 0.5)
        .linkColor(link => (link.bandwidth > 1000) ? colorWAN : colorLink)
        .linkOpacity(0.5)
        .linkCurvature(0.25)
        .linkDirectionalParticles(link => {
          const bps = link.bandwidth || 0;
          if (bps < 100) return 0;
          return Math.min(15, Math.ceil(Math.log10(bps)));
        })
        .linkDirectionalParticleWidth(3)
        .linkDirectionalParticleColor(() => colorParticle)
        .linkDirectionalParticleSpeed(link => {
          const bps = link.bandwidth || 0;
          return 0.001 + (Math.min(bps, 5000000) / 5000000) * 0.015;
        })
        .enableNodeDrag(true)
        .showNavInfo(false);

      Graph.width(window.innerWidth).height(window.innerHeight);

      // Native auto-rotate
      Graph.controls().autoRotate = true;
      Graph.controls().autoRotateSpeed = 1.2;

      // Add Starfield Point Cloud
      const scene = Graph.scene();
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      for (let i = 0; i < 15000; i++) {
          vertices.push(THREE.MathUtils.randFloatSpread(6000));
          vertices.push(THREE.MathUtils.randFloatSpread(6000));
          vertices.push(THREE.MathUtils.randFloatSpread(6000));
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const material = new THREE.PointsMaterial({ color: 0x94a3b8, size: 2.5, sizeAttenuation: true, transparent: true, opacity: 0.8 });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      (function animateStars() {
        requestAnimationFrame(animateStars);
        points.rotation.y -= 0.0002;
        points.rotation.x += 0.0001;
        
        // Flawless mathematical camera orbit, completely independent of D3
        const cam = Graph.camera();
        if (cam) {
            const radius = Math.sqrt(cam.position.x * cam.position.x + cam.position.z * cam.position.z);
            let currentAngle = Math.atan2(cam.position.x, cam.position.z);
            currentAngle += 0.001; // Smooth rotation speed
            Graph.cameraPosition({
                x: radius * Math.sin(currentAngle),
                z: radius * Math.cos(currentAngle)
            });
        }

        // Force continuous rendering even if physics engine sleeps
        if (Graph.renderer() && Graph.scene() && Graph.camera()) {
           Graph.renderer().render(Graph.scene(), Graph.camera());
        }
      })();

      Graph.d3Force('charge').strength(-1500);
      Graph.d3Force('link').distance(link => {
        if (!link.target) return 150;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        let hash = 0;
        for (let i = 0; i < targetId.length; i++) hash += targetId.charCodeAt(i);
        const base = link.bandwidth > 1000 ? 300 : 120;
        return base + (hash % 180);
      });

      const ambientLight = new THREE.AmbientLight(0x404040);
      scene.add(ambientLight);

      let nodes = [
        { id: 'Internet', type: 'wan', val: 20 },
        { id: 'Media_Stack', type: 'stack', val: 12 },
        { id: 'AI_Stack', type: 'stack', val: 12 },
        { id: 'Infra_Stack', type: 'stack', val: 12 }
      ];
      let links = [
        { source: 'Internet', target: 'Media_Stack', bandwidth: 0 },
        { source: 'Internet', target: 'AI_Stack', bandwidth: 0 },
        { source: 'Internet', target: 'Infra_Stack', bandwidth: 0 }
      ];

      // Render immediately
      Graph.graphData({ nodes, links });
      Graph.cameraPosition({ z: 600 });

      // Fetch Netdata charts
      async function setupData() {
        try {
          const chartsRes = await fetch(`${baseUrl}/api/v1/charts`);
          const chartsData = await chartsRes.json();
          
          let containerNames = new Set();
          for (const chartId of Object.keys(chartsData.charts)) {
            if (chartId.startsWith('cgroup_')) {
               let name = chartId.split('.')[0].replace('cgroup_', '');
               name = name.replace(/^(docker_|lxc_)/, '');
               containerNames.add(name);
            }
          }
          
          const mediaContainers = ['radarr', 'sonarr', 'prowlarr', 'qbittorrent', 'jellyfin', 'bazarr', 'jellyseerr', 'flaresolverr', 'rdt-client'];
          const aiContainers = ['ollama', 'llama-cpp', 'open-webui', 'n8n-server', 'n8n-db', 'agent-orchestrator'];
          const infraContainers = ['pihole', 'proxy-manager', 'netdata', 'homepage', 'dozzle', 'uptime-kuma', 'portainer', 'filebrowser', 'homeassistant', 'mosquitto', 'paperless', 'paperless-redis', 'romm', 'romm-db'];
          
          for (const name of containerNames) {
              const netChartId = `cgroup_${name}.net_eth0`;
              const hasNet = chartsData.charts[netChartId] !== undefined;
              
              let parentNode = 'Internet';
              if (mediaContainers.includes(name)) parentNode = 'Media_Stack';
              else if (aiContainers.includes(name)) parentNode = 'AI_Stack';
              else if (infraContainers.includes(name)) parentNode = 'Infra_Stack';
              
              nodes.push({ id: name, type: 'container', chartId: hasNet ? netChartId : null, val: 5 });
              links.push({ source: parentNode, target: name, bandwidth: 0 });
          }
          Graph.graphData({ nodes, links });
        } catch (e) {
          console.error("Failed to load netdata charts for 3D Graph", e);
        }
      }
      setupData();

      async function updateTraffic() {
        const { nodes: currentNodes, links: currentLinks } = Graph.graphData();
        let updated = false;

        let stackBw = { 'Media_Stack': 0, 'AI_Stack': 0, 'Infra_Stack': 0 };

        for (const link of currentLinks) {
          const targetNode = typeof link.target === 'object' ? link.target : currentNodes.find(n => n.id === link.target);
          if (!targetNode || !targetNode.chartId) continue;

          try {
            const res = await fetch(`${baseUrl}/api/v1/data?chart=${targetNode.chartId}&points=1&format=json`);
            const data = await res.json();
            if (data && data.data && data.data.length > 0) {
              const [, recv, sent] = data.data[0];
              const totalBwKbps = Math.abs(recv) + Math.abs(sent);
              const totalBps = totalBwKbps * 1000;
              link.bandwidth = totalBps;
              
              const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
              if (stackBw[sourceId] !== undefined) {
                  stackBw[sourceId] += totalBps;
              }
              
              const targetVal = 5 + Math.log10(Math.max(1, totalBps)) * 1.5;
              targetNode.val = targetNode.val * 0.8 + targetVal * 0.2;
              
              updated = true;
            }
          } catch (e) {
            // fail silently
          }
        }
        
        for (const link of currentLinks) {
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            if (stackBw[targetId] !== undefined) {
                link.bandwidth = stackBw[targetId];
                updated = true;
            }
        }

        if (updated) {
          Graph.linkDirectionalParticles(Graph.linkDirectionalParticles())
            .linkWidth(Graph.linkWidth())
            .linkColor(Graph.linkColor())
            .nodeVal(Graph.nodeVal());
        }
      }

      setInterval(updateTraffic, 1000);

      window.addEventListener('resize', () => {
        Graph.width(window.innerWidth).height(window.innerHeight);
      });

      // --- Focus Mode Button ---
      const focusBtn = document.createElement('div');
      focusBtn.id = 'focus-mode-btn';
      focusBtn.title = 'Toggle 3D Network Focus';
      focusBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="width:22px;height:22px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
        </svg>
      `;
      focusBtn.style.position = 'fixed';
      focusBtn.style.bottom = '24px';
      focusBtn.style.right = '24px';
      focusBtn.style.width = '44px';
      focusBtn.style.height = '44px';
      focusBtn.style.borderRadius = '50%';
      focusBtn.style.background = 'rgba(15, 23, 42, 0.85)';
      focusBtn.style.backdropFilter = 'blur(16px)';
      focusBtn.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      focusBtn.style.color = '#f8fafc';
      focusBtn.style.zIndex = '9999';
      focusBtn.style.display = 'flex';
      focusBtn.style.alignItems = 'center';
      focusBtn.style.justifyContent = 'center';
      focusBtn.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
      focusBtn.style.cursor = 'pointer';
      
      let isFocusMode = false;
      focusBtn.addEventListener('click', () => {
        isFocusMode = !isFocusMode;
        
        Array.from(document.body.children).forEach(el => {
          if (el.id !== 'network-canvas' && el.id !== 'focus-mode-btn' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && el.tagName !== 'LINK') {
            if (isFocusMode) {
              el.dataset.origOpacity = el.style.opacity || '1';
              el.dataset.origPointerEvents = el.style.pointerEvents || 'auto';
              el.style.transition = 'opacity 0.4s ease';
              el.style.opacity = '0';
              el.style.pointerEvents = 'none';
            } else {
              el.style.opacity = el.dataset.origOpacity || '1';
              el.style.pointerEvents = el.dataset.origPointerEvents || 'auto';
            }
          }
        });

        if (isFocusMode) {
          canvasContainer.style.pointerEvents = 'auto';
          focusBtn.style.background = 'rgba(59, 130, 246, 0.95)';
          focusBtn.style.borderColor = '#fff';
        } else {
          canvasContainer.style.pointerEvents = 'none';
          focusBtn.style.background = 'rgba(15, 23, 42, 0.85)';
          focusBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
      });
      document.body.appendChild(focusBtn);
    }
  }

  injectNetworkBackground();
})();
