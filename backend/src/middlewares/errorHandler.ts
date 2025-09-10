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

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorResponse = formatErrorResponse(error);

  // Set status code based on error type
  if (error instanceof AppError) {
    statusCode = error.statusCode;
  } else if (error.name === 'ZodError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  } else if (error.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
  } else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
  }

  // Log error in development
  if (process.env['NODE_ENV'] === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
      user: (req as AuthenticatedRequest).user,
    });
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
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
