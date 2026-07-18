import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { injectTenant } from './middleware/tenant';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';
import { metricsMiddleware, metricsHandler } from './middleware/metrics';

// Routes imports
import authRouter from './features/auth/auth.routes';
import schoolsRouter from './features/schools/schools.routes';
import studentsRouter from './features/students/students.routes';
import attendanceRouter from './features/attendance/attendance.routes';
import announcementsRouter from './features/announcements/announcements.routes';
import transportRouter from './features/transport/transport.routes';
import foodRouter from './features/food/food.routes';
import healthRouter from './features/health/health.routes';
import aiRouter from './features/ai/ai.routes';
import academicsRouter from './features/academics/academics.routes';
import communicationRouter from './features/communication/communication.routes';

const app = express();

// Security HTTP Headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request logging
app.use(morgan('combined', { stream: { write: (message) => logger.http(message.trim()) } }));

// Inject multi-tenant schema headers
app.use(injectTenant);

// Prometheus request metrics
app.use(metricsMiddleware());

// Global Rate Limiter
app.use('/api/', generalLimiter);

// Health Check API
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), version: process.env.npm_package_version || '1.0.0' });
});

// Prometheus Metrics endpoint (scraped by Prometheus)
app.get('/metrics', metricsHandler);

// App API Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/schools', schoolsRouter);
app.use('/api/v1/students', studentsRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/announcements', announcementsRouter);
app.use('/api/v1/transport', transportRouter);
app.use('/api/v1/food', foodRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/academics', academicsRouter);
app.use('/api/v1/communication', communicationRouter);


// Global error handler
app.use(errorHandler);

export default app;
