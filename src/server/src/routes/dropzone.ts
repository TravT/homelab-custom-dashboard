import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fs from 'node:fs';
import {
  createDrop,
  getDrop,
  verifyPassword,
  onDownloadStarted,
  deleteDrop,
  listActiveDrops,
} from '../services/dropzone.js';

export const dropzoneRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // 1. POST /api/drop - Upload new drop
  fastify.post('/api/drop', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file provided in multipart payload' });
    }

    const fields = data.fields as Record<string, any>;
    const ttlStr = fields.ttl?.value ? String(fields.ttl.value) : '1440';
    const ttlMinutes = parseInt(ttlStr, 10) || 1440;
    const oneTime = fields.oneTime?.value === 'true' || fields.oneTime?.value === true;
    const password = fields.password?.value ? String(fields.password.value) : undefined;

    try {
      const dropInfo = await createDrop({
        filename: data.filename,
        mimeType: data.mimetype,
        stream: data.file,
        ttlMinutes,
        oneTime,
        password,
      });

      return reply.code(201).send(dropInfo);
    } catch (err: any) {
      request.log.error(err, 'Failed to process drop upload');
      return reply.code(500).send({ error: 'Failed to process file drop' });
    }
  });

  // 2. GET /api/drop - List all active drops
  fastify.get('/api/drop', async (_request, reply) => {
    const drops = listActiveDrops();
    return reply.send({ drops, count: drops.length });
  });

  // 3. DELETE /api/drop/:id - Manual revocation / purge
  fastify.delete<{ Params: { id: string } }>('/api/drop/:id', async (request, reply) => {
    const { id } = request.params;
    const deleted = await deleteDrop(id);
    if (!deleted) {
      return reply.code(404).send({ error: 'Drop not found or already expired' });
    }
    return reply.send({ success: true, id });
  });

  // 4. GET /d/:id - Public download gateway with password & one-time handling
  fastify.get<{ Params: { id: string }; Querystring: { pwd?: string } }>(
    '/d/:id',
    async (request, reply) => {
      const { id } = request.params;
      const pwd = request.query.pwd;
      const target = getDrop(id);

      if (!target) {
        return reply
          .code(410)
          .type('text/html; charset=utf-8')
          .send(renderRetroErrorPage('410 GONE', 'SIGNAL LOST: DROP EXPIRED OR ALREADY BURNED'));
      }

      const { drop, filePath } = target;

      // Handle password check
      if (drop.hasPassword && !verifyPassword(drop, pwd)) {
        return reply
          .code(200)
          .type('text/html; charset=utf-8')
          .send(renderPasswordUnlockPage(drop, !!pwd));
      }

      // Stream file download
      const stat = await fs.promises.stat(filePath);
      reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(drop.filename)}"`);
      reply.header('Content-Type', drop.mimeType || 'application/octet-stream');
      reply.header('Content-Length', stat.size);

      // Record download and burn if one-time
      await onDownloadStarted(drop.id);

      const stream = fs.createReadStream(filePath);
      return reply.send(stream);
    }
  );
};

function renderRetroErrorPage(code: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signal Lost — Homelab Dropzone</title>
  <style>
    body {
      background: #0a0a0c;
      color: #f43f5e;
      font-family: monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    h1 { font-size: 54px; margin-bottom: 8px; text-shadow: 0 0 15px #f43f5e; }
    p { color: #94a3b8; font-size: 14px; max-width: 480px; line-height: 1.6; }
    a { color: #38bdf8; text-decoration: none; margin-top: 24px; padding: 10px 20px; border: 1px solid #38bdf8; border-radius: 8px; }
    a:hover { background: #38bdf8; color: #000; }
  </style>
</head>
<body>
  <h1>${code}</h1>
  <p>${message}</p>
  <a href="/">Return to Command Center</a>
</body>
</html>`;
}

function renderPasswordUnlockPage(drop: any, isWrongPassword = false): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unlock Drop — ${drop.filename}</title>
  <style>
    body {
      background: #0a0a0c;
      color: #e2e8f0;
      font-family: monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .card {
      background: #0d0d14;
      border: 1px solid rgba(56, 189, 248, 0.4);
      box-shadow: 0 0 40px rgba(56, 189, 248, 0.2);
      border-radius: 16px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
    }
    h2 { color: #fff; font-size: 20px; margin-bottom: 8px; word-break: break-all; }
    .meta { color: #94a3b8; font-size: 12px; margin-bottom: 24px; }
    input {
      width: 100%;
      background: #050508;
      border: 1px solid #334155;
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
      outline: none;
      box-sizing: border-box;
    }
    input:focus { border-color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.5); }
    button {
      width: 100%;
      background: #38bdf8;
      color: #000;
      border: none;
      font-weight: bold;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }
    button:hover { background: #7dd3fc; }
    .err { color: #f43f5e; font-size: 12px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🔒 Protected Drop</h2>
    <div class="meta">${drop.filename} (${(drop.sizeBytes / (1024 * 1024)).toFixed(2)} MB)</div>
    ${isWrongPassword ? '<div class="err">Invalid passphrase. Access denied.</div>' : ''}
    <form method="GET" action="/d/${drop.id}">
      <input type="password" name="pwd" placeholder="Enter passphrase..." autofocus required />
      <button type="submit">Download File</button>
    </form>
  </div>
</body>
</html>`;
}
