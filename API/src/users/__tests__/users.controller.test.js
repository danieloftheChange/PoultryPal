/**
 * Unit Tests for User Controller
 */

import request from 'supertest';
import app from '../../../app.js';
import User from '../users.model.js';
import Farm from '../../farm/farm.model.js';
import { createUserAndFarm, generateAccessToken, generateRefreshToken } from '../../../test/helpers/auth.js';
import { validUserData, validLoginData } from '../../../test/helpers/testData.js';
import crypto from 'crypto';

describe('User Controller - Authentication', () => {
  describe('POST /api/v1/user/signup', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User and Farm created successfully');
      expect(response.body.user).toHaveProperty('email', validUserData.email.toLowerCase());
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.farm).toHaveProperty('name');
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/v1/user/signup')
        .send(validUserData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send(validUserData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already in use');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send({
          ...validUserData,
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should hash password before saving', async () => {
      await request(app)
        .post('/api/v1/user/signup')
        .send(validUserData);

      const user = await User.findOne({ email: validUserData.email.toLowerCase() });
      expect(user.password).not.toBe(validUserData.password);
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send({
          ...validUserData,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should require all mandatory fields', async () => {
      const response = await request(app)
        .post('/api/v1/user/signup')
        .send({
          firstName: 'John'
          // Missing other fields
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/v1/user/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await request(app)
        .post('/api/v1/user/signup')
        .send(validUserData);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/user/login')
        .send(validLoginData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toHaveProperty('email', validLoginData.email.toLowerCase());
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should set httpOnly cookie with refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/user/login')
        .send(validLoginData);

      expect(response.headers['set-cookie']).toBeDefined();
      const cookie = response.headers['set-cookie'].find(c => c.startsWith('refreshToken='));
      expect(cookie).toBeDefined();
      expect(cookie).toContain('HttpOnly');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: validLoginData.email,
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!'
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /api/v1/user/refresh', () => {
    let user, farm, refreshToken;

    beforeEach(async () => {
      // Create user and get tokens
      const created = await createUserAndFarm(validUserData);
      user = created.user;
      farm = created.farm;
      refreshToken = generateRefreshToken(user._id);
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/user/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user).toHaveProperty('email', user.email);
    });

    it('should reject request without refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/user/refresh');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No refresh token provided');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/user/refresh')
        .set('Cookie', ['refreshToken=invalid-token']);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should reject refresh token for non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const fakeToken = generateRefreshToken(fakeUserId);

      const response = await request(app)
        .post('/api/v1/user/refresh')
        .set('Cookie', [`refreshToken=${fakeToken}`]);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /api/v1/user/logout', () => {
    it('should clear refresh token cookie', async () => {
      const response = await request(app)
        .post('/api/v1/user/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');

      const cookie = response.headers['set-cookie']?.find(c => c.startsWith('refreshToken='));
      if (cookie) {
        // Cookie should be cleared (either Max-Age=0 or Expires in the past)
        expect(cookie).toMatch(/(?:Max-Age=0|Expires=Thu, 01 Jan 1970)/);
      }
    });
  });

  describe('POST /api/v1/user/forgot-password', () => {
    beforeEach(async () => {
      await createUserAndFarm(validUserData);
    });

    it('should generate reset token for valid email', async () => {
      const response = await request(app)
        .post('/api/v1/user/forgot-password')
        .send({ email: validUserData.email });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('password reset link');

      // In development, should return token
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        expect(response.body).toHaveProperty('resetToken');
      }

      // Verify token was saved in database
      const user = await User.findOne({ email: validUserData.email.toLowerCase() });
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/user/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('If the email exists');
    });

    it('should hash reset token before storing', async () => {
      const response = await request(app)
        .post('/api/v1/user/forgot-password')
        .send({ email: validUserData.email });

      const resetToken = response.body.resetToken;
      const user = await User.findOne({ email: validUserData.email.toLowerCase() });

      // Stored token should be different (hashed)
      expect(user.passwordResetToken).not.toBe(resetToken);
      expect(user.passwordResetToken).toHaveLength(64); // SHA-256 hash length
    });
  });

  describe('POST /api/v1/user/reset-password/:token', () => {
    let user, resetToken;

    beforeEach(async () => {
      // Create user and generate reset token
      const created = await createUserAndFarm(validUserData);
      user = created.user;

      resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewSecure@Pass123';

      const response = await request(app)
        .post(`/api/v1/user/reset-password/${resetToken}`)
        .send({ password: newPassword });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset successful');

      // Verify token was cleared
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.passwordResetToken).toBeUndefined();
      expect(updatedUser.passwordResetExpires).toBeUndefined();
      expect(updatedUser.passwordChangedAt).toBeDefined();

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/v1/user/login')
        .send({ email: user.email, password: newPassword });

      expect(loginResponse.status).toBe(200);
    });

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/v1/user/reset-password/invalid-token')
        .send({ password: 'NewSecure@Pass123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should reject expired reset token', async () => {
      // Set token as expired
      user.passwordResetExpires = Date.now() - 1000; // Expired 1 second ago
      await user.save();

      const response = await request(app)
        .post(`/api/v1/user/reset-password/${resetToken}`)
        .send({ password: 'NewSecure@Pass123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired reset token');
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post(`/api/v1/user/reset-password/${resetToken}`)
        .send({ password: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/v1/user/send-verification', () => {
    let user, farm, accessToken;

    beforeEach(async () => {
      const created = await createUserAndFarm(validUserData);
      user = created.user;
      farm = created.farm;
      accessToken = generateAccessToken(user._id, user.email);
    });

    it('should send verification email to unverified user', async () => {
      const response = await request(app)
        .post('/api/v1/user/send-verification')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Verification email sent');

      // In test, should return token
      expect(response.body).toHaveProperty('verificationToken');

      // Verify token was saved
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.emailVerificationToken).toBeDefined();
      expect(updatedUser.emailVerificationExpires).toBeDefined();
    });

    it('should reject if already verified', async () => {
      // Mark user as verified
      user.emailVerified = true;
      await user.save();

      const response = await request(app)
        .post('/api/v1/user/send-verification')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already verified');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/user/send-verification');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/user/verify-email/:token', () => {
    let user, verificationToken;

    beforeEach(async () => {
      const created = await createUserAndFarm(validUserData);
      user = created.user;

      verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

      user.emailVerificationToken = verificationTokenHash;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save();
    });

    it('should verify email with valid token', async () => {
      const response = await request(app)
        .get(`/api/v1/user/verify-email/${verificationToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Email verified successfully');

      // Verify user is marked as verified
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.emailVerified).toBe(true);
      expect(updatedUser.emailVerificationToken).toBeUndefined();
      expect(updatedUser.emailVerificationExpires).toBeUndefined();
    });

    it('should reject invalid verification token', async () => {
      const response = await request(app)
        .get('/api/v1/user/verify-email/invalid-token');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired verification token');
    });

    it('should reject expired verification token', async () => {
      // Set token as expired
      user.emailVerificationExpires = Date.now() - 1000;
      await user.save();

      const response = await request(app)
        .get(`/api/v1/user/verify-email/${verificationToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid or expired verification token');
    });
  });
});
