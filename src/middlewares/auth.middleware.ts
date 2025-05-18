// Middleware for handling authentication and authorization.
// Includes functionality for validating tokens, ensuring protected routes, and managing user roles and permissions to restrict access as needed.

import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import logger from '../config/logger';
import { TokenHelper } from '../utils/token.helper';
import { AppError } from '../utils/application.error';

export const checkToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  logger.debug('checkToken middleware: Received authentication request', { path: req.path, method: req.method });

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    logger.warn('checkToken middleware: No token provided');
    next(new AppError('You must be logged in to access this resource.', httpStatus.UNAUTHORIZED));
    return;
  }
  try {
    const decoded = TokenHelper.verifyToken(token);
    // Asignar el usuario decodificado tanto a req.body.user (para compatibilidad)
    // como a req.user (para cumplir con la interfaz IAuthRequest)
    req.body.user = decoded;
    (req as any).user = decoded;
    logger.info('checkToken middleware: Token verified successfully');
    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.warn('checkToken middleware: Invalid token', { error: errorMessage });
    next(new AppError('Invalid token.', httpStatus.UNAUTHORIZED));
  }
};

// Alias for checkToken to maintain consistency
export const authMiddleware = checkToken;
