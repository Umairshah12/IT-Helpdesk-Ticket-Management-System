import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { dbStore } from '../data/store';
import { ENV } from './env';

let prismaInstance: PrismaClient | null = null;
let isPostgresConnected = false;

export const initDatabase = async (): Promise<boolean> => {
  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: ENV.DATABASE_URL,
        },
      },
      log: ['error'],
    });
    // Quick test query to verify Postgres availability
    await client.$connect();
    prismaInstance = client;
    isPostgresConnected = true;
    logger.info('Connected to PostgreSQL Database via Prisma ORM.');
    return true;
  } catch (err: any) {
    const reason = err?.message ? err.message.split('\n')[0] : 'Connection refused';
    logger.warn(
      `PostgreSQL is currently offline or unreachable (${reason}). Operating with high-availability in embedded relational store mode.`
    );
    isPostgresConnected = false;
    return false;
  }
};

export const getPrisma = (): PrismaClient | null => prismaInstance;
export const isPgActive = (): boolean => isPostgresConnected;
export { dbStore };

