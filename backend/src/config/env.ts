import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';
import logger from '../utils/logger';

// Load environmental variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL relational link is required',
  }),
  MONGODB_URI: z.string({
    required_error: 'MONGODB_URI document database link is required',
  }),
  JWT_SECRET: z
    .string({
      required_error: 'JWT_SECRET signature key is required',
    })
    .min(32, 'JWT_SECRET key must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z
    .string({
      required_error: 'JWT_REFRESH_SECRET signature key is required',
    })
    .min(32, 'JWT_REFRESH_SECRET key must be at least 32 characters long'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

type EnvConfig = z.infer<typeof envSchema>;

let parsedEnv: EnvConfig;

try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    const missingFields = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
    logger.error('❌ Invalid or missing environment configuration parameters:');
    missingFields.forEach((field) => logger.error(`   -> ${field}`));
    process.exit(1);
  }
  logger.error('❌ Global environment parameters parsing crashed.');
  process.exit(1);
}

export const env = parsedEnv;
export default env;
