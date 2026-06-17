import { Request, Response, NextFunction } from 'express';

import logger from '../utils/logger';

interface OperationalError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: string;
  meta?: unknown;
  details?: unknown[];
  errors?: Array<{ path: Array<string | number>; message: string }>;
}

export const errorHandler = (
  err: OperationalError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log deep trace internally for critical errors
  if (err.statusCode === 500) {
    logger.error({ stack: err.stack }, `💥 CRITICAL ERROR LOG: ${err.message}`);
  } else {
    logger.warn(`Operational Warn [${err.statusCode}] - ${err.message}`);
  }

  // Handle specific Zod payload validation errors
  if (err.name === 'ZodError') {
    const details =
      err.errors?.map((e) => ({
        field: e.path.join('.'),
        issue: e.message,
      })) || [];
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
    logger.error(
      `[Prisma Error] Code: ${err.code}, Meta: ${JSON.stringify(err.meta)}, Message: ${err.message}`
    );
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT_ERROR',
        message:
          'Unable to complete action due to missing account relationship. Please contact administrator.',
        details: [err.meta],
      },
    });
  }

  // Generic envelope response
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.isOperational
        ? err.status.toUpperCase()
        : 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred in the system core',
      details: err.details || [],
    },
  });
};

export default errorHandler;
