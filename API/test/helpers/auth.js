/**
 * Authentication Test Helpers
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import User from '../../src/users/users.model.js';
import Farm from '../../src/farm/farm.model.js';
import bcrypt from 'bcrypt';

/**
 * Create a test user and farm
 */
export const createUserAndFarm = async (userData = {}) => {
  const farmData = {
    name: `${userData.firstName || 'Test'}'s Farm`,
  };

  const farm = await Farm.create(farmData);

  const hashedPassword = await bcrypt.hash(userData.password || 'Test@123456', 10);

  const user = await User.create({
    farmId: farm.id,
    firstName: userData.firstName || 'Test',
    lastName: userData.lastName || 'User',
    email: userData.email || 'test@example.com',
    password: hashedPassword,
    role: userData.role || 'Manager',
    emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : false,
  });

  return { user, farm };
};

/**
 * Generate a JWT access token for testing
 */
export const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Generate a JWT refresh token for testing
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Login a user via API and return tokens
 */
export const loginUser = async (app, credentials) => {
  const response = await request(app)
    .post('/api/v1/user/login')
    .send(credentials);

  return {
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken,
    user: response.body.user,
    cookies: response.headers['set-cookie']
  };
};

/**
 * Create an authenticated request with access token
 */
export const authenticatedRequest = (app, method, url, token) => {
  const req = request(app)[method.toLowerCase()](url);
  return req.set('Authorization', `Bearer ${token}`);
};
