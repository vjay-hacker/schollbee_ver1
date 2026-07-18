import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : nodeEnv === 'staging' ? '.env.staging' : '.env.development';
dotenv.config({ path: path.resolve(process.cwd(), '../../', envFile) });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  API_URL: z.string().url().default('http://localhost:3001'),
  APP_NAME: z.string().default('SchoolBee'),
  
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  FCM_PROJECT_ID: z.string().optional(),
  FCM_CLIENT_EMAIL: z.string().optional(),
  FCM_PRIVATE_KEY: z.string().optional(),
  
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_PHONE_NUMBER: z.string().optional(),
  
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 mins
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const parseEnv = envSchema.safeParse(process.env);

if (!parseEnv.success) {
  console.error('❌ Environment configuration error:', JSON.stringify(parseEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parseEnv.data;
