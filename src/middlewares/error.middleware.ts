// Global error-handling middleware for the application.
// Catches and processes errors thrown in the application, returning appropriate responses.

import { type NextFunction, type Request, type Response } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import { AppError } from '../utils/application.error';
import logger from '../config/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): Response => {
  logger.error({ error: err, path: req.path, method: req.method }, 'An error occurred'); // Log the error for debugging purposes

  // If it's a custom error (AppError), use its status code and message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // If it's not a custom error, return a generic error response
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    error: 'An unexpected error occurred, please contact the system administrator.',
  });
};
