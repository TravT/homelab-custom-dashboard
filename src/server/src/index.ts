import fs from 'node:fs';
import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import { config } from './config.js';
import { apiRoutes } from './routes/api.js';
import { dropzoneRoutes } from './routes/dropzone.js';
import { initDropzone, cleanupExpiredDrops } from './services/dropzone.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

async function main() {
  await fastify.register(cors, {
    origin: true,
  });

  // Support up to 2GB multipart streaming uploads
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 2 * 1024 * 1024 * 1024,
    },
  });

  // Initialize dropzone persistence
  await initDropzone();

  // Periodic cleanup of expired drops every 10 minutes
  setInterval(async () => {
    try {
      const count = await cleanupExpiredDrops();
      if (count > 0) {
        fastify.log.info(`Cleaned up ${count} expired drops`);
      }
    } catch (err) {
      fastify.log.error(err, 'Dropzone periodic cleanup error');
    }
  }, 10 * 60 * 1000);

  // Register API routes (/api/*)
  await fastify.register(apiRoutes, { prefix: '/api' });

  // Register Dropzone routes (/api/drop and /d/:id)
  await fastify.register(dropzoneRoutes);

  // Serve static files if directory exists
  if (fs.existsSync(config.staticDir)) {
    fastify.log.info(`Serving static files from ${config.staticDir}`);
    await fastify.register(fastifyStatic, {
      root: config.staticDir,
      prefix: '/',
    });

    // Fallback for SPA routing
    fastify.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api') || request.url.startsWith('/d/')) {
        reply.status(404).send({ error: 'Not Found', url: request.url });
        return;
      }
      reply.sendFile('index.html');
    });
  } else {
    fastify.log.warn(`Static directory ${config.staticDir} does not exist. API mode only.`);
  }

  try {
    const address = await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    fastify.log.info(`BFF Server running at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();

const signals = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    fastify.log.info(`Received ${signal}, closing server...`);
    await fastify.close();
    process.exit(0);
  });
});
