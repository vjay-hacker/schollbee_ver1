import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error details: ${err.message}`, { stack: err.stack, path: req.path });

  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // Handle generic errors
  const message = env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message;
  return ApiResponse.error(res, message, 500, env.NODE_ENV !== 'production' ? err.stack : undefined);
};
