import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { authController } from '../src/controllers/authController';
import { errorHandler } from '../src/middlewares/errorHandler';
import { User } from '../src/models/User';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/refresh', authController.refresh);
app.post('/auth/logout', authController.logout);

// Error handling
app.use(errorHandler);

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
      };

      // Register first user
      await request(app).post('/auth/register').send(userData);

      // Try to register with same email
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error.code).toBe('CONFLICT_ERROR');
      expect(response.body.error.message).toBe('User with this email already exists');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: 'T', // Too short
        email: 'invalid-email',
        password: '123', // Too short
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123',
      };
      await request(app).post('/auth/register').send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(credentials.email);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('Invalid email or password');
    });

    it('should return error for invalid password', async () => {
      const credentials = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and login to get refresh token
      const userData = {
        name: 'Refresh Test User',
        email: 'refresh@example.com',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData);

      refreshToken = registerResponse.headers['set-cookie'][0];
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', refreshToken)
        .expect(200);

      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return error for missing refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('Refresh token is required');
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Register and login to get access token
      const userData = {
        name: 'Logout Test User',
        email: 'logout@example.com',
        password: 'password123',
      };

      const registerResponse = await request(app)
        .post('/auth/register')
        .send(userData);

      accessToken = registerResponse.body.accessToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Logout successful');
    });

    it('should return error for missing authorization header', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
      expect(response.body.error.message).toBe('Access token is required');
    });
  });
});
