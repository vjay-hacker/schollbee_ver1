import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

try {
  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    reconnectOnError: (err) => {
      logger.error('Redis Reconnect Error:', err);
      return true;
    },
  });

  redis.on('connect', () => {
    logger.info('🔌 Redis connected successfully.');
  });

  redis.on('error', (err) => {
    logger.warn(`⚠️ Redis Connection Error: ${err.message}. Backend will degrade gracefully without cache.`);
  });
} catch (error) {
  logger.warn('⚠️ Could not initialize Redis client. Check REDIS_URL.');
}

export { redis };
