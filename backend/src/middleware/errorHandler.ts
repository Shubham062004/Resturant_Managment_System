import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log deep trace internally for critical errors
  if (err.statusCode === 500) {
    logger.error(`💥 CRITICAL ERROR LOG: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`Operational Warn [${err.statusCode}] - ${err.message}`);
  }

  // Handle specific Zod payload validation errors
  if (err.name === 'ZodError') {
    const details = err.errors.map((e: any) => ({
      field: e.path.join('.'),
      issue: e.message,
    }));
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input payload parameters',
        details,
      },
    });
  }

  // Handle Prisma Database errors (e.g. unique constraint violates)
  if (err.code && err.code.startsWith('P20')) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT_ERROR',
        message: 'Database relational conflict constraint violated',
        details: [err.meta],
      },
    });
  }

  // Generic envelope response
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.isOperational ? err.status.toUpperCase() : 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred in the system core',
      details: err.details || [],
    },
  });
};

export default errorHandler;
