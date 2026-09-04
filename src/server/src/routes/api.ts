import type { FastifyPluginAsync } from 'fastify';
import { getDashboardState } from '../services/aggregator.js';
import { getFleetQuickStatus, getFullFleetTelemetry } from '../services/fleet.js';

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

  // Feature 2: Fleet Quick Reachability Status (Runs once on page load for the 3 header balls)
  fastify.get('/fleet/status', async (_request, reply) => {
    try {
      const status = await getFleetQuickStatus();
      return status;
    } catch (err: any) {
      fastify.log.error(err);
      reply.status(500).send({
        error: 'Failed to query fleet quick status',
        message: err?.message || String(err),
      });
    }
  });

  // Feature 2: Full Fleet Telemetry (Runs ONLY when fleet deck is expanded)
  fastify.get('/fleet/telemetry', async (_request, reply) => {
    try {
      const telemetry = await getFullFleetTelemetry();
      return telemetry;
    } catch (err: any) {
      fastify.log.error(err);
      reply.status(500).send({
        error: 'Failed to aggregate fleet telemetry',
        message: err?.message || String(err),
      });
    }
  });
};
