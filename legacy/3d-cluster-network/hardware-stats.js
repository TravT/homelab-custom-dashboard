(function() {
  // --- Hardware Stats Poll (1s interval) ---
  function fetchHardwareStats() {
    const statsUrl = 'http://' + window.location.hostname + ':8005/stats';
    fetch(statsUrl)
      .then(res => res.json())
      .then(data => {
        if (!data) return;

        // Battery
        if (data.battery_percent !== null && data.battery_percent !== undefined) {
          // Find the flex-row container that holds all resource widgets
          let resContainer = null;
          let lastResource = null;
          
          const resWidget = document.querySelector('.information-widget-resource');
          if (resWidget) {
            resContainer = resWidget.parentElement;
            lastResource = resContainer.querySelector('.information-widget-resource:last-of-type');
          } else {
            // Fallback: look for a generic header right-side container
            const headerRight = document.querySelector('header .flex.items-center.gap-2, header .flex-row');
            if (headerRight) {
              resContainer = headerRight;
              lastResource = headerRight.lastElementChild;
            }
          }

          if (resContainer) {
            let batNode = document.getElementById('custom-resource-battery');
            if (!batNode) {
              batNode = document.createElement('div');
              batNode.id = 'custom-resource-battery';
              batNode.className = 'text-xs font-light tracking-wide';
              // Insert AFTER the last resource widget (as a sibling, not a child)
              if (lastResource && lastResource.nextSibling) {
                resContainer.insertBefore(batNode, lastResource.nextSibling);
              } else {
                resContainer.appendChild(batNode);
              }
            }

            let batteryLevel = data.battery_percent;
            let isCharging = data.power_plugged;
            let iconClass = "text-emerald-400";
            if (batteryLevel < 20 && !isCharging) iconClass = "text-red-500";
            else if (batteryLevel < 50 && !isCharging) iconClass = "text-amber-400";

            let path = isCharging 
              ? '<path d="M17 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-1 11H4V8h12v8zm5-7h-1v6h1V9z"></path><polygon points="10 17 14 11 11 11 12 7 8 13 11 13" fill="currentColor"></polygon>'
              : '<path d="M17 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-1 11H4V8h12v8zm5-7h-1v6h1V9z"></path><rect x="5" y="9" width="' + (10 * (batteryLevel/100)) + '" height="6" fill="currentColor"></rect>';

            let batteryHtml = '<div class="flex items-center"><svg class="' + iconClass + '" fill="currentColor" viewBox="0 0 24 24" style="width:16px;height:16px;margin-right:6px;">' + path + '</svg><span>' + Math.round(batteryLevel) + '%</span><div class="battery-label" style="margin-left: 4px; font-size: 0.78rem;">BAT</div></div>';

            batNode.innerHTML = batteryHtml;
          }
        }
      })
      .catch(err => console.error("Error fetching stats:", err));
  }

  // --- Custom Netdata Charts (Option C) ---
  function injectCustomNetdataCharts() {
    const targetCard = Array.from(document.querySelectorAll('.service-name')).find(el => {
      return el.textContent && el.textContent.trim().includes('Netdata Live Graphs');
    });

    if (!targetCard) {
      setTimeout(injectCustomNetdataCharts, 500);
      return;
    }

    if (document.getElementById('native-custom-charts')) return;

    let column = targetCard.closest('.flex-col');
    if (!column) column = targetCard.parentNode.parentNode;

    const dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'native-custom-charts';
    dashboardContainer.style.width = '100%';
    dashboardContainer.style.marginTop = '12px';
    
    dashboardContainer.innerHTML = `
      <div style="background: rgba(15, 23, 42, var(--ui-opacity)); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 12px;">
        <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
           <div style="height: 120px; position: relative;"><canvas id="chart-cpu"></canvas></div>
           <div style="height: 120px; position: relative;"><canvas id="chart-ram"></canvas></div>
           <div style="height: 120px; position: relative;"><canvas id="chart-temp"></canvas></div>
           <div style="height: 120px; position: relative;"><canvas id="chart-io"></canvas></div>
        </div>
      </div>
    `;

    if (column) column.appendChild(dashboardContainer);

    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = initCharts;
      document.head.appendChild(script);
    } else {
      initCharts();
    }

    function initCharts() {
       const currentIp = window.location.hostname;
       const isIp = /^(?:[0-9]{1,3}\.)[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(currentIp) || currentIp === 'localhost';
       const baseUrl = isIp ? `http://${currentIp}:19999` : 'http://netdata.home.arpa';

       const createConfig = (label, color) => ({
           type: 'line',
           data: { labels: Array(30).fill(''), datasets: [{ label, data: Array(30).fill(0), borderColor: color, backgroundColor: color + '20', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0 }] },
           options: { 
             responsive: true, maintainAspectRatio: false, 
             plugins: { legend: { display: true, labels: { color: '#cbd5e1', boxWidth: 10, font: { size: 10 } } }, tooltip: { enabled: false } },
             scales: {
               x: { display: true, grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 }, maxTicksLimit: 6 } },
               y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 9 }, maxTicksLimit: 5 }, beginAtZero: true }
             },
             animation: { duration: 0 }
           }
       });

       const charts = {
         cpu: new Chart(document.getElementById('chart-cpu').getContext('2d'), createConfig('CPU Usage (%)', '#3b82f6')),
         ram: new Chart(document.getElementById('chart-ram').getContext('2d'), createConfig('RAM Used (MB)', '#10b981')),
         temp: new Chart(document.getElementById('chart-temp').getContext('2d'), createConfig('CPU Temp (°C)', '#ef4444')),
         io: new Chart(document.getElementById('chart-io').getContext('2d'), createConfig('Disk I/O (KB/s)', '#a855f7'))
       };

       const fetchNetdata = async (chartId, chartInstance, processData) => {
         try {
           const res = await fetch(`${baseUrl}/api/v1/data?chart=${chartId}&format=json&points=30&group=average`, { cache: 'no-store' });
           const data = await res.json();
           const values = data.data.map(row => processData(row)).reverse();
           const times = data.data.map(row => {
             const d = new Date(row[0] * 1000);
             return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
           }).reverse();
           chartInstance.data.labels = times;
           chartInstance.data.datasets[0].data = values;
           chartInstance.update();
         } catch(e) { console.error('Netdata fetch error', e); }
       };

       setInterval(() => {
         fetchNetdata('system.cpu', charts.cpu, row => row.slice(1).reduce((a, b) => a + (b || 0), 0));
         fetchNetdata('system.ram', charts.ram, row => row[2] || 0);
         fetchNetdata('sensors.temperature_coretemp-isa-0000_temp1_Package_id_0_input', charts.temp, row => row[1] || 0);
         fetchNetdata('system.io', charts.io, row => Math.abs(row[1] || 0) + Math.abs(row[2] || 0));
       }, 2000);
    }
  }


  function initHardwareStats() {
    if (!document.body) { setTimeout(initHardwareStats, 100); return; }
    if (typeof fetchHardwareStats === 'function') {
      fetchHardwareStats();
      setInterval(fetchHardwareStats, 1000);
    }
    if (typeof injectCustomNetdataCharts === 'function') {
      injectCustomNetdataCharts();
    }
  }
  initHardwareStats();
})();
