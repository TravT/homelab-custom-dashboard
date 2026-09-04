import type { FastifyPluginAsync } from 'fastify';
import { getDashboardState } from '../services/aggregator.js';

export const apiRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async (_request, _reply) => {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  });

  fastify.get('/dashboard-state', async (_request, reply) => {
    try {
      const state = await getDashboardState();
      return state;
    } catch (err: any) {
      fastify.log.error(err);
      reply.status(500).send({
        error: 'Failed to aggregate homelab dashboard state',
        message: err?.message || String(err),
      });
    }
  });

  fastify.get('/version', async () => {
    return {
      name: 'homelab-custom-dashboard-bff',
      version: '1.0.0',
      phase: 0,
    };
  });
};
