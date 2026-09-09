/**
 * Homelab Action Dispatcher Client API
 */

export function getStoredActionPin() {
  try {
    return sessionStorage.getItem('action_pin') || '';
  } catch {
    return '';
  }
}

export function setStoredActionPin(pin) {
  try {
    sessionStorage.setItem('action_pin', pin);
  } catch {}
}

export function clearStoredActionPin() {
  try {
    sessionStorage.removeItem('action_pin');
  } catch {}
}

export async function verifyActionPin(pin) {
  try {
    const res = await fetch('/api/actions/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data?.success) {
      setStoredActionPin(pin);
      return { success: true, message: 'Action PIN verified' };
    }
    return { success: false, message: data?.message || 'Invalid Action PIN' };
  } catch (err) {
    return { success: false, message: err?.message || 'Verification failed' };
  }
}

export async function dispatchClusterAction(endpoint, body = null) {
  try {
    const pin = getStoredActionPin();
    const options = {
      method: 'POST',
      headers: {
        'X-Action-Pin': pin,
      },
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const res = await fetch(`/api/actions${endpoint}`, options);
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      clearStoredActionPin();
      return {
        success: false,
        status: 401,
        message: data?.message || 'Unauthorized: Action PIN required or expired.',
        timestamp: new Date().toISOString(),
        needsPin: true,
      };
    }

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
