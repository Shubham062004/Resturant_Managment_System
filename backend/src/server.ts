import app from './app';
import env from './config/env';
import { connectMongoDB } from './config/mongo';
import { connectDatabases, disconnectDatabases } from './config/db';
import { initSocket } from './config/socket';
import logger from './utils/logger';

const startServer = async () => {
  try {
    // 1. Establish database connection sessions
    await connectDatabases();
    await connectMongoDB();

    // 2. Start Express Port Listener
    const server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 Oven Xpress RMS Service listening on http://localhost:${env.PORT} in [${env.NODE_ENV}] mode`,
      );
    });

    // Initialize Socket.io Real-Time Engine
    initSocket(server);

    // 3. Graceful termination protocols
    const gracefulShutdown = async (signal: string) => {
      logger.warn(`Received ${signal}. Starting shutdown protocols...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabases();
        logger.info('Graceful shutdown completed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Root bootstrapper crashed during startup sequence:', error);
    process.exit(1);
  }
};

// Handle unhandled exceptions globally
process.on('uncaughtException', (err) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down server...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 UNHANDLED REJECTION! Shutting down server...', { reason, promise });
  process.exit(1);
});

startServer();
