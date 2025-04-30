// Handles database connection and configuration.
// This file is responsible for setting up and exporting the Prisma client instance.

import { PrismaClient } from '@prisma/client';
import logger from './logger';

export const prisma = new PrismaClient();

export const createConnection = async () => {
  try {
    logger.info('Attempting to connect to the DB...');
    await prisma.$connect();
    logger.info('Connected to the DB');
  } catch (error) {
    logger.error({ error }, 'Cannot connect to the DB');
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing the DB connection...');
  try {
    await prisma.$disconnect();
    logger.info('DB connection closed. Exiting process.');
  } catch (error) {
    logger.error({ error }, 'Error while disconnecting from the DB');
  } finally {
    process.exit(0);
  }
});
