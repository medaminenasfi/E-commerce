import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CartRequest } from './errorHandler';

export const cartSession = (req: CartRequest, res: Response, next: NextFunction): void => {
  let sessionId = req.cookies['sessionId'];

  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  req.cartIdentifier = sessionId;
  req.isGuestCart = true;
  next();
};

export const getCartIdentifier = (req: CartRequest): string => {
  return req.cartIdentifier || req.cookies['sessionId'] || '';
};

export const isGuestCart = (req: CartRequest): boolean => {
  return req.isGuestCart || false;
};

export const isUserCart = (req: CartRequest): boolean => {
  return !req.isGuestCart;
};
