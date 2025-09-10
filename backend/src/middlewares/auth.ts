import { Response, NextFunction, Request } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { AuthenticationError, ForbiddenError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token is required');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    // Ensure payload matches the expected user type
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(new AuthenticationError('Invalid access token'));
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requireUser = requireRole(['user', 'admin']);

export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
  }
  next();
};
