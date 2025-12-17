/**
 * Unit Tests for Health Controller
 */

import request from 'supertest';
import app from '../../../app.js';
import mongoose from 'mongoose';

describe('Health Controller - Monitoring Endpoints', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status with 200 when all systems are operational', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('status', 'connected');
      expect(response.body.database).toHaveProperty('type', 'MongoDB');
      expect(response.body).toHaveProperty('memory');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('rss');
    });

    it('should include memory usage in readable format', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.memory.heapUsed).toMatch(/\d+MB/);
      expect(response.body.memory.heapTotal).toMatch(/\d+MB/);
      expect(response.body.memory.rss).toMatch(/\d+MB/);
    });
  });

  describe('GET /api/v1/ready', () => {
    it('should return ready status with 200 when database is connected', async () => {
      const response = await request(app)
        .get('/api/v1/ready');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ready');
    });

    it('should return 503 when database is not connected', async () => {
      // Save original connection state
      const originalState = mongoose.connection.readyState;

      // Temporarily set to disconnected state
      Object.defineProperty(mongoose.connection, 'readyState', {
        writable: true,
        value: 0
      });

      const response = await request(app)
        .get('/api/v1/ready');

      expect(response.status).toBe(503);
      expect(response.body).toHaveProperty('status', 'not ready');

      // Restore original state
      Object.defineProperty(mongoose.connection, 'readyState', {
        writable: true,
        value: originalState
      });
    });
  });

  describe('GET /api/v1/alive', () => {
    it('should return alive status with 200', async () => {
      const response = await request(app)
        .get('/api/v1/alive');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
    });
  });

  describe('GET /api/v1/metrics', () => {
    it('should return metrics with request counts', async () => {
      const response = await request(app)
        .get('/api/v1/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('requests');
      expect(response.body.requests).toHaveProperty('total');
      expect(response.body.requests).toHaveProperty('byMethod');
      expect(response.body.requests).toHaveProperty('byStatus');
      expect(response.body.requests).toHaveProperty('byRoute');
    });

    it('should return response time metrics', async () => {
      const response = await request(app)
        .get('/api/v1/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('responseTimes');
      expect(response.body.responseTimes).toHaveProperty('total');
      expect(response.body.responseTimes).toHaveProperty('count');
      expect(response.body.responseTimes).toHaveProperty('min');
      expect(response.body.responseTimes).toHaveProperty('max');
      expect(response.body.responseTimes).toHaveProperty('avg');
    });

    it('should return error metrics', async () => {
      const response = await request(app)
        .get('/api/v1/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveProperty('total');
      expect(response.body.errors).toHaveProperty('byType');
    });

    it('should include timestamp and uptime', async () => {
      const response = await request(app)
        .get('/api/v1/metrics');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('Request Tracking Headers', () => {
    it('should add X-Request-ID header to response', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.headers['x-request-id']).toBeTruthy();
    });

    it('should use provided X-Request-ID if sent in request', async () => {
      const requestId = 'test-request-123';

      const response = await request(app)
        .get('/api/v1/health')
        .set('X-Request-ID', requestId);

      expect(response.headers['x-request-id']).toBe(requestId);
    });

    it('should add X-Response-Time header to response', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.headers).toHaveProperty('x-response-time');
      expect(response.headers['x-response-time']).toMatch(/\d+ms/);
    });
  });
});
