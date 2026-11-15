import dotenv from 'dotenv';
import path from 'path';

// Load .env from root, backend dir, or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const defaultDbUrl = 'postgresql://postgres:postgres@localhost:5432/helpdesk_pro?schema=public';

// Ensure DATABASE_URL is explicitly set in process.env so Prisma engine can validate datasource url
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDbUrl;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'helpdesk_pro_jwt_access_secret_super_secure_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'helpdesk_pro_jwt_refresh_secret_super_secure_key_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),

  BUSINESS_HOURS_START: process.env.BUSINESS_HOURS_START || '09:00',
  BUSINESS_HOURS_END: process.env.BUSINESS_HOURS_END || '18:00',
  TIMEZONE: process.env.TIMEZONE || 'UTC',
};

