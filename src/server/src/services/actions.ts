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


function getS24PrivateKey(): string | Buffer | null {
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

function executeS24SSH(cmd: string, timeoutMs = 5000): Promise<{ stdout: string; stderr: string }> {
  const privateKey = getS24PrivateKey();
  if (!privateKey) {
    return Promise.reject(new Error('No SSH private key configured for S24 Ultra'));
  }

  return new Promise((resolve, reject) => {
    const conn = new SSHClient();
    let isDone = false;

    const timeoutTimer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        try { conn.end(); } catch {}
        reject(new Error(`S24 Ultra SSH command timed out after ${timeoutMs}ms (device asleep or unreachable)`));
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
      host: config.s24Host,
      port: config.s24SshPort,
      username: config.s24SshUser,
      privateKey,
      readyTimeout: 4000,
    });
  });
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

export async function speakPhoneTTS(message: string): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  if (!message || typeof message !== 'string') {
    return {
      success: false,
      actionId: 'phone_tts',
      message: 'TTS message cannot be empty',
      timestamp,
    };
  }

  try {
    const trimmed = message.slice(0, 300);
    const b64 = Buffer.from(trimmed, 'utf8').toString('base64');
    await executeS24SSH(`echo "${b64}" | base64 -d | /data/data/com.termux/files/usr/bin/termux-tts-speak`);
    return {
      success: true,
      actionId: 'phone_tts',
      message: `Announcement broadcasted to Galaxy S24 Ultra speaker.`,
      timestamp,
    };
  } catch (err: any) {
    return {
      success: false,
      actionId: 'phone_tts',
      message: `TTS dispatch failed: ${err?.message || String(err)}`,
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

export async function toggleS20Screen(state: 'toggle' | 'on' | 'off' = 'toggle'): Promise<ActionResult> {
  const timestamp = new Date().toISOString();
  const subcmd =
    state === 'on'
      ? 'shell input keyevent KEYCODE_WAKEUP'
      : state === 'off'
      ? 'shell input keyevent KEYCODE_SLEEP'
      : 'shell input keyevent 26';

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

    // 2. Dispatch keyevent
    const res = await sendHttpJson(`${adbBase}/api/adb/command`, {
      method: 'POST',
      headers,
      body: {
        target: `${config.s20Host}:5555`,
        commands: [subcmd],
      },
    });

    if (res.status === 200) {
      return {
        success: true,
        actionId: 'phone_s20_screen',
        message: `S20 FE display command '${state}' executed.`,
        timestamp,
      };
    }
    throw new Error(`ADB command responded with status ${res.status}: ${res.raw}`);
  } catch (err: any) {
    return {
      success: false,
      actionId: 'phone_s20_screen',
      message: `Failed to toggle S20 screen: ${err?.message || String(err)}`,
      timestamp,
    };
  }
}


