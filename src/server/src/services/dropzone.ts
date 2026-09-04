import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';
import type { Readable } from 'node:stream';
import { config } from '../config.js';

export interface DropMetadata {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  expiresAt: string;
  oneTime: boolean;
  hasPassword: boolean;
  passwordHash?: string;
  downloadCount: number;
}

export interface PublicDropInfo {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  expiresAt: string;
  oneTime: boolean;
  hasPassword: boolean;
  downloadCount: number;
  downloadUrl: string;
}

const INDEX_FILE = path.join(config.dropzoneDir, 'drops.json');
const FILES_DIR = path.join(config.dropzoneDir, 'files');

let dropsIndex: Map<string, DropMetadata> = new Map();

export async function initDropzone(): Promise<void> {
  try {
    await fs.promises.mkdir(FILES_DIR, { recursive: true });
    if (fs.existsSync(INDEX_FILE)) {
      const raw = await fs.promises.readFile(INDEX_FILE, 'utf-8');
      const items: DropMetadata[] = JSON.parse(raw);
      dropsIndex = new Map(items.map(item => [item.id, item]));
    } else {
      dropsIndex = new Map();
      await saveIndex();
    }
    // Run initial cleanup
    await cleanupExpiredDrops();
  } catch (err) {
    console.error('Failed to initialize dropzone storage:', err);
  }
}

async function saveIndex(): Promise<void> {
  const items = Array.from(dropsIndex.values());
  const tempFile = `${INDEX_FILE}.tmp.${Date.now()}`;
  await fs.promises.writeFile(tempFile, JSON.stringify(items, null, 2), 'utf-8');
  await fs.promises.rename(tempFile, INDEX_FILE);
}

export async function createDrop(params: {
  filename: string;
  mimeType: string;
  stream: Readable;
  ttlMinutes?: number;
  oneTime?: boolean;
  password?: string;
}): Promise<PublicDropInfo> {
  const id = crypto.randomBytes(4).toString('hex'); // 8 hex chars (e.g. 8a3f91b2)
  const safeFilename = path.basename(params.filename) || 'download.bin';
  const dropFileDir = path.join(FILES_DIR, id);
  const targetFilePath = path.join(dropFileDir, safeFilename);

  await fs.promises.mkdir(dropFileDir, { recursive: true });

  // Stream file to disk while computing size
  const writeStream = fs.createWriteStream(targetFilePath);
  let bytesWritten = 0;

  params.stream.on('data', chunk => {
    bytesWritten += chunk.length;
  });

  await pipeline(params.stream, writeStream);

  const now = new Date();
  const ttlMs = (params.ttlMinutes && params.ttlMinutes > 0 ? params.ttlMinutes : 1440) * 60 * 1000;
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

  let passwordHash: string | undefined = undefined;
  if (params.password && params.password.trim()) {
    passwordHash = crypto.createHash('sha256').update(params.password.trim()).digest('hex');
  }

  const drop: DropMetadata = {
    id,
    filename: safeFilename,
    sizeBytes: bytesWritten,
    mimeType: params.mimeType || 'application/octet-stream',
    createdAt: now.toISOString(),
    expiresAt,
    oneTime: !!params.oneTime,
    hasPassword: !!passwordHash,
    passwordHash,
    downloadCount: 0
  };

  dropsIndex.set(id, drop);
  await saveIndex();

  return toPublicDropInfo(drop);
}

export function getDrop(id: string): { drop: DropMetadata; filePath: string } | null {
  const drop = dropsIndex.get(id);
  if (!drop) return null;

  if (new Date(drop.expiresAt).getTime() <= Date.now()) {
    // Expired
    deleteDrop(id).catch(() => {});
    return null;
  }

  const filePath = path.join(FILES_DIR, id, drop.filename);
  if (!fs.existsSync(filePath)) {
    deleteDrop(id).catch(() => {});
    return null;
  }

  return { drop, filePath };
}

export function verifyPassword(drop: DropMetadata, password?: string): boolean {
  if (!drop.hasPassword || !drop.passwordHash) return true;
  if (!password) return false;
  const hash = crypto.createHash('sha256').update(password.trim()).digest('hex');
  return hash === drop.passwordHash;
}

export async function onDownloadStarted(id: string): Promise<void> {
  const drop = dropsIndex.get(id);
  if (!drop) return;

  drop.downloadCount += 1;
  await saveIndex();
}

export async function burnDrop(id: string): Promise<void> {
  dropsIndex.delete(id);
  await saveIndex().catch(() => {});
}

export async function shredDropFiles(id: string): Promise<void> {
  try {
    const dropFileDir = path.join(FILES_DIR, id);
    if (fs.existsSync(dropFileDir)) {
      await fs.promises.rm(dropFileDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`Failed to shred drop files for ${id}:`, err);
  }
}

export async function deleteDrop(id: string): Promise<boolean> {
  await burnDrop(id);
  await shredDropFiles(id);
  return true;
}

export async function cleanupExpiredDrops(): Promise<number> {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, drop] of dropsIndex.entries()) {
    if (new Date(drop.expiresAt).getTime() <= now) {
      await deleteDrop(id);
      cleaned++;
    }
  }
  return cleaned;
}

export function listActiveDrops(): PublicDropInfo[] {
  const now = Date.now();
  const list: PublicDropInfo[] = [];

  for (const drop of dropsIndex.values()) {
    if (new Date(drop.expiresAt).getTime() > now) {
      list.push(toPublicDropInfo(drop));
    }
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function toPublicDropInfo(drop: DropMetadata): PublicDropInfo {
  return {
    id: drop.id,
    filename: drop.filename,
    sizeBytes: drop.sizeBytes,
    mimeType: drop.mimeType,
    createdAt: drop.createdAt,
    expiresAt: drop.expiresAt,
    oneTime: drop.oneTime,
    hasPassword: drop.hasPassword,
    downloadCount: drop.downloadCount,
    downloadUrl: `/d/${drop.id}`
  };
}
