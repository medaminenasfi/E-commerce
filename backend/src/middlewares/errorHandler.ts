import { Request, Response, NextFunction } from 'express';
import { formatErrorResponse, AppError, HTTP_STATUS } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string; // Add the `id` field
    userId: string;
    email: string;
    role: string;
  };
}

export interface CartRequest extends Request {
  cartIdentifier?: string;
  isGuestCart?: boolean;
}

export function errorHandler(err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: {
      code: 'NOT_FOUND_ERROR',
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

// The following code was removed because 'res' is an Express response object, not a fetch Response.
// If you need to handle fetch responses, move this logic to the appropriate client-side or fetch handler.
