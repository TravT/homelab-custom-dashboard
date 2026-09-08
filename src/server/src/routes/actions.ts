import type { FastifyPluginAsync } from 'fastify';
import {
  triggerJellyfinRefresh,
  triggerBazarrSync,
  triggerMaintainerrClean,
  pushS24Clipboard,
  speakPhoneTTS,
  pingS24Phone,
  toggleS20Screen,
  restartNomadJob,
} from '../services/actions.js';

export const actionRoutes: FastifyPluginAsync = async (fastify) => {
  // Media Routes
  fastify.post('/media/scan-jellyfin', async (_request, reply) => {
    const result = await triggerJellyfinRefresh();
    reply.status(result.success ? 200 : 500).send(result);
  });

  fastify.post('/media/sync-subtitles', async (_request, reply) => {
    const result = await triggerBazarrSync();
    reply.status(result.success ? 200 : 500).send(result);
  });

  fastify.post('/media/clean-watched', async (_request, reply) => {
    const result = await triggerMaintainerrClean();
    reply.status(result.success ? 200 : 500).send(result);
  });

  // Android Mobile Routes
  fastify.post<{ Body: { text: string } }>('/phone/clipboard', async (request, reply) => {
    const { text } = request.body || {};
    const result = await pushS24Clipboard(text);
    reply.status(result.success ? 200 : 400).send(result);
  });

  fastify.post<{ Body: { message: string } }>('/phone/tts', async (request, reply) => {
    const { message } = request.body || {};
    const result = await speakPhoneTTS(message);
    reply.status(result.success ? 200 : 400).send(result);
  });

  fastify.post('/phone/ping', async (_request, reply) => {
    const result = await pingS24Phone();
    reply.status(result.success ? 200 : 500).send(result);
  });

  fastify.post<{ Body: { state?: 'toggle' | 'on' | 'off' } }>('/phone/screen', async (request, reply) => {
    const { state } = request.body || {};
    const result = await toggleS20Screen(state);
    reply.status(result.success ? 200 : 500).send(result);
  });

  // Cluster Container Routes
  fastify.post<{ Body: { job: string } }>('/cluster/restart-job', async (request, reply) => {
    const { job } = request.body || {};
    if (!job) {
      return reply.status(400).send({
        success: false,
        actionId: 'cluster_restart_job',
        message: 'Missing "job" parameter in request body.',
        timestamp: new Date().toISOString(),
      });
    }
    const result = await restartNomadJob(job);
    reply.status(result.success ? 200 : 500).send(result);
  });
};
