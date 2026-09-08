/**
 * Homelab Action Dispatcher Client API
 */

export async function dispatchClusterAction(endpoint, body = null) {
  try {
    const options = {
      method: 'POST',
      headers: {},
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`/api/actions${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    return {
      success: res.ok && data?.success !== false,
      status: res.status,
      message: data?.message || (res.ok ? 'Action executed successfully' : `HTTP ${res.status} Error`),
      actionId: data?.actionId,
      timestamp: data?.timestamp || new Date().toISOString(),
      details: data?.details,
    };
  } catch (err) {
    return {
      success: false,
      status: 0,
      message: err?.message || 'Network connection failed',
      timestamp: new Date().toISOString(),
    };
  }
}
