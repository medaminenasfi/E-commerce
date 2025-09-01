import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { AuthenticatedRequest } from './errorHandler';
import { AuthenticationError, ForbiddenError } from '../utils/errors';

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token is required');
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);
    
    req.user = payload;
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
      req.user = payload;
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
  }
  
  next();
};
