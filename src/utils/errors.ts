export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
  public readonly details?: any;
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

// Error response formatter
export const formatErrorResponse = (error: Error | AppError): ErrorResponse => {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && error.details && { details: error.details }),
      },
    };
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError' && 'errors' in error) {
    const zodError = error as any;
    return {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: zodError.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError' && 'errors' in error) {
    const mongooseError = error as any;
    const details = Object.keys(mongooseError.errors).map(key => ({
      field: key,
      message: mongooseError.errors[key].message,
    }));
    
    return {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details,
      },
    };
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    return {
      error: {
        code: 'CONFLICT_ERROR',
        message: `${field} already exists`,
      },
    };
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return {
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid token',
      },
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Token expired',
      },
    };
  }

  // Default error response
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env['NODE_ENV'] === 'production' ? 'Internal server error' : error.message,
    },
  };
};

// HTTP status codes for common errors
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;
