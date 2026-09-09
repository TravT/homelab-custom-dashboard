import type { FastifyPluginAsync } from 'fastify';
import { config } from '../config.js';
import {
  triggerJellyfinRefresh,
  triggerBazarrSync,
  triggerMaintainerrClean,
  pushS24Clipboard,
  speakPhoneTTS,
  pingS24Phone,
  toggleS20Screen,
} from '../services/actions.js';

export const actionRoutes: FastifyPluginAsync = async (fastify) => {
  // Security PIN Verification preHandler
  fastify.addHook('preHandler', async (request, reply) => {
    // Allow PIN check endpoint through without header
    if (request.url.includes('/verify-pin')) return;
    if (!config.actionPin) return;

    const clientPin = request.headers['x-action-pin'];
    if (clientPin !== config.actionPin) {
      return reply.status(401).send({
        success: false,
        message: 'Unauthorized: Valid Action PIN required to dispatch commands.',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Verify PIN Endpoint for UI Unlock
  fastify.post<{ Body: { pin: string } }>('/verify-pin', async (request, reply) => {
    const { pin } = request.body || {};
    if (!config.actionPin || pin === config.actionPin) {
      return reply.send({ success: true, message: 'Action PIN verified' });
    }
    return reply.status(401).send({ success: false, message: 'Invalid Action PIN' });
  });

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
};
