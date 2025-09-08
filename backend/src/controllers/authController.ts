import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest, CartRequest } from '../middlewares/errorHandler';
import { asyncHandler } from '../middlewares/errorHandler';
import { HTTP_STATUS } from '../utils/errors';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { user, tokens } = await authService.register(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(HTTP_STATUS.CREATED).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: tokens.accessToken,
    });
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { user, tokens } = await authService.login(req.body);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: tokens.accessToken,
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Refresh token is required',
        },
      });
      return;
    }

    const tokens = await authService.refreshToken(refreshToken);

    // Set new refresh token as httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Token refreshed successfully',
      accessToken: tokens.accessToken,
    });
  });

  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (req.user?.userId) {
      await authService.logout(req.user.userId);
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Logout successful',
    });
  });

  logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
        },
      });
      return;
    }

    await authService.logoutAll(req.user.userId);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Logged out from all devices',
    });
  });

  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
        },
      });
      return;
    }

    const user = await authService.getProfile(req.user.userId);

    res.status(HTTP_STATUS.OK).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
        },
      });
      return;
    }

    const user = await authService.updateProfile(req.user.userId, req.body);

    res.status(HTTP_STATUS.OK).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  });

  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
        },
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(req.user.userId, currentPassword, newPassword);

    // Clear refresh token cookie to force re-login
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Password changed successfully. Please login again.',
    });
  });

  // Special endpoint for merging guest cart after login
  mergeCart = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user?.userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
        },
      });
      return;
    }

    // Get session ID from cookies
    const sessionId = req.cookies['sessionId'];
    
    if (!sessionId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID not found in cookies',
        },
      });
      return;
    }


    res.status(HTTP_STATUS.OK).json({
      message: 'Cart merged successfully',
    });
  });
}

export const authController = new AuthController();
