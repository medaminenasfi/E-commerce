import jwt from 'jsonwebtoken';
import { redisClient } from './redis';

export interface JWTPayload {
  id: any;
  userId: string;
  email: string;
  role: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// JWT Configuration
const JWT_SECRET = process.env['JWT_SECRET'] || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret';
const ACCESS_TOKEN_EXPIRES_IN = process.env['JWT_ACCESS_EXPIRES_IN'] || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '7d';

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN as any });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN as any });
};

export const generateTokenPair = (payload: JWTPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
};

export const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      const key = `refresh_token:${userId}`;
      await redisClient.setEx(key, 7 * 24 * 60 * 60, refreshToken); // 7 days
    } else {
      console.warn('⚠️ Redis not connected, skipping refresh token storage');
    }
  } catch (error) {
    console.warn('⚠️ Failed to store refresh token in Redis:', error);
  }
};

export const getStoredRefreshToken = async (userId: string): Promise<string | null> => {
  try {
    if (redisClient.isOpen) {
      const key = `refresh_token:${userId}`;
      return await redisClient.get(key);
    } else {
      console.warn('⚠️ Redis not connected, refresh token validation disabled');
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Failed to get refresh token from Redis:', error);
    return null;
  }
};

export const invalidateRefreshToken = async (userId: string): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      const key = `refresh_token:${userId}`;
      await redisClient.del(key);
    }
  } catch (error) {
    console.warn('⚠️ Failed to invalidate refresh token in Redis:', error);
  }
};

export const invalidateAllUserTokens = async (userId: string): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      const pattern = `refresh_token:${userId}`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to invalidate all user tokens in Redis:', error);
  }
};
