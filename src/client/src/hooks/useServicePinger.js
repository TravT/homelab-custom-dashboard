import { useEffect } from 'react';
import { servicesCatalog } from '../data/servicesCatalog.jsx';

export function useServicePinger(setServiceHealth) {
  useEffect(() => {
    let isMounted = true;
    const pingServices = async () => {
      const flatCatalog = servicesCatalog.flat();
      await Promise.allSettled(flatCatalog.map(async (svc) => {
        if (!isMounted) return;
        const start = performance.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        try {
          await fetch(svc.url, { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: controller.signal });
          clearTimeout(timeoutId);
          const duration = Math.max(1, Math.round(performance.now() - start));
          if (isMounted) {
            setServiceHealth(prev => ({
              ...prev,
              [svc.id]: {
                ...(prev[svc.id] || { status: 'online' }),
                latency: `${duration}ms`
              }
            }));
          }
        } catch {
          clearTimeout(timeoutId);
        }
      }));
    };

    pingServices();
    const pingInterval = setInterval(pingServices, 15000);
    return () => {
      isMounted = false;
      clearInterval(pingInterval);
    };
  }, [setServiceHealth]);
}
