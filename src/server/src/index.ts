import fs from 'node:fs';
import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { config } from './config.js';
import { apiRoutes } from './routes/api.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

async function main() {
  await fastify.register(cors, {
    origin: true,
  });

  // Register API routes
  await fastify.register(apiRoutes, { prefix: '/api' });

  // Serve static files if directory exists
  if (fs.existsSync(config.staticDir)) {
    fastify.log.info(`Serving static files from ${config.staticDir}`);
    await fastify.register(fastifyStatic, {
      root: config.staticDir,
      prefix: '/',
    });

    // Fallback for SPA routing
    fastify.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api')) {
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
