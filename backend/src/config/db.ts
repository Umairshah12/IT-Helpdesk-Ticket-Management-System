import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { dbStore } from '../data/store';

let prismaInstance: PrismaClient | null = null;
let isPostgresConnected = false;

export const initDatabase = async (): Promise<boolean> => {
  try {
    const client = new PrismaClient({
      log: ['error', 'warn'],
    });
    // Quick test query to verify Postgres availability
    await client.$connect();
    prismaInstance = client;
    isPostgresConnected = true;
    logger.info('Connected to PostgreSQL Database via Prisma ORM.');
    return true;
  } catch (err: any) {
    logger.warn(
      'PostgreSQL is currently not running or unreachable. Falling back to the embedded relational store for immediate execution.',
      err.message
    );
    isPostgresConnected = false;
    return false;
  }
};

export const getPrisma = (): PrismaClient | null => prismaInstance;
export const isPgActive = (): boolean => isPostgresConnected;
export { dbStore };

