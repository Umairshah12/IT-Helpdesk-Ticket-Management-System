import app from './app';
import { ENV } from './config/env';
import { initDatabase } from './config/db';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Attempt database initialization
    await initDatabase();

    const server = app.listen(ENV.PORT, '0.0.0.0', () => {
      logger.info(`Helpdesk Pro REST API running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
      logger.info(`Health check available at: http://127.0.0.1:${ENV.PORT}/api/health`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      logger.info('Shutting down Helpdesk Pro server...');
      server.close(() => {
        logger.info('HTTP server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

