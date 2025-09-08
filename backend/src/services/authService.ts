import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { generateTokenPair, storeRefreshToken, invalidateRefreshToken, JWTPayload } from '../config/jwt';
import { AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../utils/validation';
import jwt from 'jsonwebtoken';
import { getStoredRefreshToken } from '../config/jwt';
import { TokenPair } from '../config/jwt';

export class AuthService {
  async register(userData: RegisterInput): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
const role = userData.role && ['admin', 'user'].includes(userData.role)
  ? userData.role
  : 'user';
    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password, // Will be hashed by pre-save middleware
      role,
    });

    await user.save();

    // Generate tokens
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    // Store refresh token
    await storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user, tokens };
  }

  async login(credentials: LoginInput): Promise<{ user: IUser; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    // Store refresh token
    await storeRefreshToken(user._id.toString(), tokens.refreshToken);

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify the refresh token
      const payload = jwt.verify(refreshToken, process.env['JWT_REFRESH_SECRET'] || 'fallback-refresh-secret') as JWTPayload;

      // Check if the token is stored in Redis
      const storedToken = await getStoredRefreshToken(payload.userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new token pair
      const newTokenPair = generateTokenPair(payload);

      // Store new refresh token and invalidate old one
      await storeRefreshToken(payload.userId, newTokenPair.refreshToken);

      return newTokenPair;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    await invalidateRefreshToken(userId);
  }

  async logoutAll(userId: string): Promise<void> {
    await require('../config/jwt').invalidateAllUserTokens(userId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    // Invalidate all refresh tokens to force re-login
    await this.logoutAll(userId);
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateData: Partial<Pick<IUser, 'name' | 'email'>>): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if email is being updated and if it's already taken
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email.toLowerCase() });
      if (existingUser) {
        throw new ConflictError('Email is already taken');
      }
    }

    // Update user
    Object.assign(user, updateData);
    if (updateData.email) {
      user.email = updateData.email.toLowerCase();
    }

    await user.save();
    return user;
  }
}

export const authService = new AuthService();
