import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { logger } from '../utils/logger';

// ─── Prometheus Registry ──────────────────────────────────────────────────────
const register = new Registry();

// Collect default Node.js metrics (CPU, memory, event loop lag, etc.)
collectDefaultMetrics({
  register,
  prefix: 'schoolbee_nodejs_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ─── Custom Metrics ────────────────────────────────────────────────────────────

/** Total HTTP requests by method, path, status code */
export const httpRequestsTotal = new Counter({
  name: 'schoolbee_http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code', 'tenant'],
  registers: [register],
});

/** HTTP request duration histogram */
export const httpRequestDuration = new Histogram({
  name: 'schoolbee_http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/** Active HTTP connections */
export const activeConnections = new Gauge({
  name: 'schoolbee_active_connections',
  help: 'Current number of active HTTP connections',
  registers: [register],
});

/** Supabase DB query duration */
export const dbQueryDuration = new Histogram({
  name: 'schoolbee_db_query_duration_seconds',
  help: 'Supabase database query latency',
  labelNames: ['operation', 'table'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
  registers: [register],
});

/** School-level request counter for multi-tenant analytics */
export const requestsPerSchool = new Counter({
  name: 'schoolbee_requests_per_school_total',
  help: 'Total requests grouped by school tenant',
  labelNames: ['school_id', 'feature'],
  registers: [register],
});

/** AI assistant call counter */
export const aiCallsTotal = new Counter({
  name: 'schoolbee_ai_calls_total',
  help: 'Total SchoolBee AI assistant interactions',
  labelNames: ['intent', 'school_id'],
  registers: [register],
});

/** Push notifications sent counter */
export const notificationsSent = new Counter({
  name: 'schoolbee_notifications_sent_total',
  help: 'Total push/SMS/email notifications dispatched',
  labelNames: ['channel', 'type'],
  registers: [register],
});

/** Bus GPS log rate gauge */
export const gpsLogsRate = new Gauge({
  name: 'schoolbee_gps_logs_per_minute',
  help: 'GPS log entries received per minute',
  registers: [register],
});

/** Authentication events */
export const authEventsTotal = new Counter({
  name: 'schoolbee_auth_events_total',
  help: 'Authentication events (login, logout, refresh, failed)',
  labelNames: ['event', 'role'],
  registers: [register],
});

/** Errors by type */
export const errorsTotal = new Counter({
  name: 'schoolbee_errors_total',
  help: 'Total application errors by type',
  labelNames: ['type', 'route'],
  registers: [register],
});

// ─── Middleware: Request tracking ─────────────────────────────────────────────

export function metricsMiddleware(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip metrics endpoint itself
    if (req.path === '/metrics') return next();

    const startTime = process.hrtime.bigint();
    activeConnections.inc();

    // Normalize route (replace UUIDs and IDs with :param)
    const normalizedRoute = req.route?.path || req.path.replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      '/:id'
    ).replace(/\/\d+/g, '/:id');

    res.on('finish', () => {
      const durationNs = process.hrtime.bigint() - startTime;
      const durationSec = Number(durationNs) / 1e9;
      const statusCode = String(res.statusCode);
      const schoolId = (req as any).tenant?.schoolId || 'unknown';

      // Record metrics
      httpRequestsTotal.inc({
        method: req.method,
        route: normalizedRoute,
        status_code: statusCode,
        tenant: schoolId,
      });

      httpRequestDuration.observe(
        { method: req.method, route: normalizedRoute, status_code: statusCode },
        durationSec
      );

      if (schoolId !== 'unknown') {
        const feature = normalizedRoute.split('/')[3] || 'unknown';  // e.g. 'students'
        requestsPerSchool.inc({ school_id: schoolId, feature });
      }

      if (res.statusCode >= 500) {
        errorsTotal.inc({ type: 'server_error', route: normalizedRoute });
      } else if (res.statusCode >= 400) {
        errorsTotal.inc({ type: 'client_error', route: normalizedRoute });
      }

      activeConnections.dec();
    });

    next();
  };
}

// ─── Metrics Endpoint Handler ─────────────────────────────────────────────────

export async function metricsHandler(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (err) {
    logger.error('Metrics endpoint error:', err);
    res.status(500).end('Metrics collection error');
  }
}

export { register };
