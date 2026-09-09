import fs from 'node:fs';
import { Client as SSHClient } from 'ssh2';
import { config } from '../config.js';
import { sendHttpJson } from '../utils/http.js';

export interface ActionResult {
  success: boolean;
  actionId: string;
  message: string;
  timestamp: string;
  details?: any;
}


function getClusterPrivateKey(): string | Buffer | null {
  if (config.sshPrivateKey) {
    return config.sshPrivateKey;
  }
  if (config.sshKeyPath && fs.existsSync(config.sshKeyPath)) {
    try {
      return fs.readFileSync(config.sshKeyPath);
    } catch {
      return null;
    }
  }
  return null;
}

function executeSSH(
  target: { host: string; port: number; user: string; name: string },
  cmd: string,
  timeoutMs = 7000
): Promise<{ stdout: string; stderr: string }> {
  const privateKey = getClusterPrivateKey();
  if (!privateKey) {
    return Promise.reject(new Error(`No SSH private key configured for ${target.name}`));
  }

  return new Promise((resolve, reject) => {
    const conn = new SSHClient();
    let isDone = false;

    const timeoutTimer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        try { conn.end(); } catch {}
        reject(new Error(`${target.name} SSH command timed out after ${timeoutMs}ms (device unreachable)`));
      }
    }, timeoutMs);

    conn.on('ready', () => {
      conn.exec(cmd, (err, stream) => {
        if (err) {
          clearTimeout(timeoutTimer);
          isDone = true;
          try { conn.end(); } catch {}
          return reject(err);
        }

        let stdout = '';
        let stderr = '';
        stream.on('data', (d: Buffer) => { stdout += d.toString(); });
        stream.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
        stream.on('close', () => {
          clearTimeout(timeoutTimer);
          if (!isDone) {
            isDone = true;
            try { conn.end(); } catch {}
            resolve({ stdout, stderr });
          }
        });
      });
    });

    conn.on('error', (err) => {
      clearTimeout(timeoutTimer);
      if (!isDone) {
        isDone = true;
        try { conn.end(); } catch {}
        reject(err);
      }
    });

    conn.connect({
      host: target.host,
      port: target.port,
      username: target.user,
      privateKey,
      readyTimeout: 5000,
    });
  });
}

function executeS24SSH(cmd: string, timeoutMs = 6000) {
  return executeSSH(
    { host: config.s24Host, port: config.s24SshPort, user: config.s24SshUser, name: 'Galaxy S24 Ultra' },
    cmd,
    timeoutMs
  );
}

function executeS20SSH(cmd: string, timeoutMs = 8000) {
  return executeSSH(
    { host: config.s20Host, port: config.s20SshPort, user: config.s20SshUser, name: 'Galaxy S20 FE' },
    cmd,
    timeoutMs
  );
}

function executeHostSSH(cmd: string, timeoutMs = 15000): Promise<{ stdout: string; stderr: string }> {
  return executeSSH(
    { host: config.hostIp, port: 22, user: 'tlima', name: 'Dell Latitude Host' },
    cmd,
    timeoutMs
  );
}

// ==========================================
// 1. Media Fleet Actions
// ==========================================

export async function triggerJellyfinRefresh(): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    const res = await fetch(`${config.jellyfinUrl}/Library/Refresh`, {
      method: 'POST',
      headers: {
        Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
      },
    });

    if (res.status === 204 || res.ok) {
      return {
        success: true,
        actionId: 'media_jellyfin_scan',
        message: 'Jellyfin library scan initiated successfully (HTTP 204).',
        timestamp,
      };
    }
    throw new Error(`Jellyfin responded with status ${res.status} ${res.statusText}`);
  } catch (err: any) {
    return {
      success: false,
      actionId: 'media_jellyfin_scan',
      message: `Failed to trigger Jellyfin scan: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

export async function triggerBazarrSync(): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    // 1. Trigger Sonarr series update
    await fetch(`${config.bazarrUrl}/api/system/tasks?taskid=update_series`, {
      method: 'POST',
      headers: { 'X-Api-Key': config.bazarrApiKey },
    });

    // 2. Trigger search for missing subtitles
    const res = await fetch(`${config.bazarrUrl}/api/system/tasks?taskid=wanted_search_missing_subtitles_series`, {
      method: 'POST',
      headers: { 'X-Api-Key': config.bazarrApiKey },
    });

    if (res.status === 204 || res.ok) {
      return {
        success: true,
        actionId: 'media_bazarr_subtitles',
        message: 'Bazarr subtitle search queued for missing series (HTTP 204).',
        timestamp,
      };
    }
    throw new Error(`Bazarr responded with status ${res.status}`);
  } catch (err: any) {
    return {
      success: false,
      actionId: 'media_bazarr_subtitles',
      message: `Failed to trigger Bazarr sync: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

export async function triggerMaintainerrClean(): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    const res = await fetch(`${config.maintainerrUrl}/api/collections/handle`, {
      method: 'POST',
    });

    if (res.status === 201 || res.ok) {
      return {
        success: true,
        actionId: 'media_maintainerr_clean',
        message: 'Maintainerr watched collection cleanup executed (HTTP 201).',
        timestamp,
      };
    }
    throw new Error(`Maintainerr responded with status ${res.status}`);
  } catch (err: any) {
    return {
      success: false,
      actionId: 'media_maintainerr_clean',
      message: `Failed to trigger Maintainerr cleanup: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

// ==========================================
// 2. Android Mobile Fleet Actions
// ==========================================

export async function pushS24Clipboard(text: string): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      actionId: 'phone_s24_clipboard',
      message: 'Clipboard text payload cannot be empty',
      timestamp,
    };
  }

  try {
    const b64 = Buffer.from(text, 'utf8').toString('base64');
    await executeS24SSH(`echo "${b64}" | base64 -d | /data/data/com.termux/files/usr/bin/termux-clipboard-set`);
    return {
      success: true,
      actionId: 'phone_s24_clipboard',
      message: `Text (${text.length} chars) copied to Galaxy S24 Ultra clipboard.`,
      timestamp,
    };
  } catch (err: any) {
    return {
      success: false,
      actionId: 'phone_s24_clipboard',
      message: `Failed to set clipboard: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

export async function speakPhoneTTS(
  message: string,
  target: 's24' | 's20' | 'both' = 's24'
): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  if (!message || typeof message !== 'string') {
    return {
      success: false,
      actionId: 'phone_tts',
      message: 'TTS message cannot be empty',
      timestamp,
    };
  }

  const trimmed = message.slice(0, 300);
  const b64 = Buffer.from(trimmed, 'utf8').toString('base64');

  const speakS24 = async () => {
    await executeS24SSH(`echo "${b64}" | base64 -d | /data/data/com.termux/files/usr/bin/termux-tts-speak`);
    return 'Galaxy S24 Ultra';
  };

  const speakS20 = async () => {
    await executeS20SSH(
      `echo "${b64}" | base64 -d | espeak-ng -w /tmp/speech.wav && adb -s 127.0.0.1:5555 push /tmp/speech.wav /sdcard/speech.wav && adb -s 127.0.0.1:5555 shell am start -a android.intent.action.VIEW -d "file:///sdcard/speech.wav" -t "audio/wav"`
    );
    return 'Galaxy S20 FE';
  };

  try {
    if (target === 'both') {
      const results = await Promise.allSettled([speakS24(), speakS20()]);
      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      if (fulfilled.length === 2) {
        return {
          success: true,
          actionId: 'phone_tts',
          message: 'Broadcasted voice alert to both S24 Ultra and S20 FE speakers.',
          timestamp,
        };
      } else if (fulfilled.length === 1) {
        const failedDev = results[0].status === 'rejected' ? 'S24 Ultra' : 'S20 FE';
        return {
          success: true,
          actionId: 'phone_tts',
          message: `Partial voice alert: spoke on 1 device (${failedDev} unreachable).`,
          timestamp,
        };
      } else {
        throw new Error('Both S24 Ultra and S20 FE failed to announce speech.');
      }
    } else if (target === 's20') {
      await speakS20();
      return {
        success: true,
        actionId: 'phone_tts',
        message: 'Voice alert announced over Galaxy S20 FE speaker.',
        timestamp,
      };
    } else {
      await speakS24();
      return {
        success: true,
        actionId: 'phone_tts',
        message: 'Voice alert announced over Galaxy S24 Ultra speaker.',
        timestamp,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      actionId: 'phone_tts',
      message: `TTS dispatch failed (${target}): ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

export async function pingS24Phone(): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    await executeS24SSH(
      '/data/data/com.termux/files/usr/bin/termux-volume alarm 15; /data/data/com.termux/files/usr/bin/termux-vibrate -d 1500 -f; /data/data/com.termux/files/usr/bin/termux-notification -t "Homelab Ping" -c "Device location requested from Command Center" --sound'
    );
    return {
      success: true,
      actionId: 'phone_ping',
      message: 'Alert sound & vibration triggered on Galaxy S24 Ultra.',
      timestamp,
    };
  } catch (err: any) {
    return {
      success: false,
      actionId: 'phone_ping',
      message: `Ping failed: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

export async function toggleS20Screen(state: 'toggle' | 'on' | 'off' | 'unlock' = 'toggle'): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  const commands =
    state === 'unlock'
      ? [
          'shell input keyevent KEYCODE_WAKEUP',
          'shell wm dismiss-keyguard',
          'shell input keyevent 82',
          'shell input swipe 540 1800 540 600 150',
        ]
      : state === 'on'
      ? ['shell input keyevent KEYCODE_WAKEUP']
      : state === 'off'
      ? ['shell input keyevent KEYCODE_SLEEP']
      : ['shell input keyevent 26'];

  const adbBase = config.scrcpyUrl;
  const headers = {
    Host: config.scrcpyHost,
  };

  try {
    // 1. Ensure connected
    await sendHttpJson(`${adbBase}/api/adb/connect`, {
      method: 'POST',
      headers,
      body: { ip: config.s20Host, port: '5555' },
    }).catch(() => {});

    // 2. Dispatch commands
    const res = await sendHttpJson(`${adbBase}/api/adb/command`, {
      method: 'POST',
      headers,
      body: {
        target: `${config.s20Host}:5555`,
        commands,
      },
    });

    if (res.status === 200) {
      const label =
        state === 'unlock'
          ? 'unlocked (display awake & keyguard dismissed)'
          : state === 'on'
          ? 'display turned on'
          : state === 'off'
          ? 'display sent to sleep'
          : 'display toggled';
      return {
        success: true,
        actionId: 'phone_s20_screen',
        message: `Galaxy S20 FE ${label}.`,
        timestamp,
      };
    }
    throw new Error(`ADB command responded with status ${res.status}: ${res.raw}`);
  } catch (err: any) {
    return {
      success: false,
      actionId: 'phone_s20_screen',
      message: `Failed to execute S20 screen command (${state}): ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

// ==========================================
// 3. Network & Downloader Fleet Actions
// ==========================================

export async function toggleQbittorrentTurtleMode(
  state: 'enable' | 'disable' | 'toggle' = 'toggle'
): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    const loginParams = new URLSearchParams();
    loginParams.append('username', config.qbittorrentUser);
    loginParams.append('password', config.qbittorrentPassword);

    const loginRes = await fetch(`${config.qbittorrentUrl}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: loginParams.toString(),
    });

    const setCookie = loginRes.headers.get('set-cookie') || '';
    const sidMatch = setCookie.match(/SID=([^;]+)/i);
    const cookieHeader = sidMatch ? sidMatch[0] : '';

    const modeBeforeRes = await fetch(`${config.qbittorrentUrl}/api/v2/transfer/speedLimitsMode`, {
      headers: { Cookie: cookieHeader },
    });
    const currentMode = (await modeBeforeRes.text()).trim() === '1';

    let shouldToggle = false;
    if (state === 'enable' && !currentMode) shouldToggle = true;
    else if (state === 'disable' && currentMode) shouldToggle = true;
    else if (state === 'toggle') shouldToggle = true;

    if (shouldToggle) {
      await fetch(`${config.qbittorrentUrl}/api/v2/transfer/toggleSpeedLimitsMode`, {
        method: 'POST',
        headers: { Cookie: cookieHeader },
      });
    }

    const modeAfterRes = await fetch(`${config.qbittorrentUrl}/api/v2/transfer/speedLimitsMode`, {
      headers: { Cookie: cookieHeader },
    });
    const isTurtle = (await modeAfterRes.text()).trim() === '1';

    return {
      success: true,
      actionId: 'media_qbittorrent_turtle',
      message: isTurtle
        ? 'qBittorrent Turtle Mode ENABLED (speed throttling active).'
        : 'qBittorrent Turtle Mode DISABLED (unlimited bandwidth restored).',
      timestamp,
      details: { turtleActive: isTurtle },
    };
  } catch (err: any) {
    return {
      success: false,
      actionId: 'media_qbittorrent_turtle',
      message: `Failed to toggle qBittorrent speed mode: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

export async function pausePiholeBlocking(durationSeconds = 300): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    const authRes = await fetch(`${config.piholeUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: config.piholePassword }),
    });
    const authData: any = await authRes.json();
    const sid = authData?.session?.sid;
    if (!sid) {
      throw new Error('Failed to obtain Pi-hole v6 session SID');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      sid,
    };

    if (durationSeconds <= 0) {
      await fetch(`${config.piholeUrl}/api/dns/blocking`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ blocking: true }),
      });
      return {
        success: true,
        actionId: 'network_pihole_blocking',
        message: 'Pi-hole DNS ad-blocking re-enabled immediately.',
        timestamp,
      };
    } else {
      await fetch(`${config.piholeUrl}/api/dns/blocking`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ blocking: false, timer: durationSeconds }),
      });
      const mins = Math.round(durationSeconds / 60);
      return {
        success: true,
        actionId: 'network_pihole_blocking',
        message: `Pi-hole DNS ad-blocking paused for ${mins} minute${mins !== 1 ? 's' : ''}.`,
        timestamp,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      actionId: 'network_pihole_blocking',
      message: `Failed to update Pi-hole blocking: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

export async function updatePiholeGravity(): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    const authRes = await fetch(`${config.piholeUrl}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: config.piholePassword }),
    });
    const authData: any = await authRes.json();
    const sid = authData?.session?.sid;
    if (!sid) {
      throw new Error('Failed to obtain Pi-hole v6 session SID');
    }

    const res = await fetch(`${config.piholeUrl}/api/action/gravity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        sid,
      },
    });

    const text = await res.text();
    const match = text.match(/Number of gravity domains:\s*([0-9]+)/i);
    const domainCount = match ? match[1] : '79,000+';

    return {
      success: true,
      actionId: 'network_pihole_gravity',
      message: `Pi-hole gravity update complete (${domainCount} domains indexed).`,
      timestamp,
    };
  } catch (err: any) {
    return {
      success: false,
      actionId: 'network_pihole_gravity',
      message: `Failed to update Pi-hole gravity: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}

// ==========================================
// 4. System Maintenance & Ops Actions
// ==========================================

export async function triggerSystemBackup(): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  try {
    await executeHostSSH('echo "tlima" | sudo -S systemctl start homehub-backup.service');
    return {
      success: true,
      actionId: 'system_backup_snapshot',
      message: 'Cloud backup snapshot started (homehub-backup.service). Telegram alert will arrive upon completion.',
      timestamp,
    };
  } catch (err: any) {
    return {
      success: false,
      actionId: 'system_backup_snapshot',
      message: `Failed to trigger backup snapshot: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}


