import http from 'node:http';

export interface HttpJsonOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}

export interface HttpResponse<T = any> {
  status: number;
  data: T;
  raw: string;
}

/**
 * Node HTTP client that preserves custom Host headers across Docker bridge networks and Traefik routing.
 * Unlike WHATWG fetch (undici), node:http permits custom Host headers without stripping or rewriting them.
 */
export function sendHttpJson<T = any>(
  urlStr: string,
  options: HttpJsonOptions = {}
): Promise<HttpResponse<T>> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const postData = options.body
      ? typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
      : null;

    const headers: Record<string, string | number> = {
      ...(options.headers || {}),
    };
    if (postData) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port ? parseInt(url.port, 10) : 80,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers,
        timeout: options.timeoutMs || 4000,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let data: any = null;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
          resolve({ status: res.statusCode || 0, data, raw });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`HTTP request timed out after ${options.timeoutMs || 4000}ms`));
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}
