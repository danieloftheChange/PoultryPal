import mongoose from 'mongoose';
import logger from '../../config/logger.js';
import metricsCollector from '../../config/metrics.js';

const healthCheck = async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      health.database = { status: 'connected', type: 'MongoDB' };
    } else {
      health.database = { status: 'disconnected', type: 'MongoDB' };
      health.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    health.memory = {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    };

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', { error: error.message, stack: error.stack });
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
    });
  }
};

const readinessCheck = async (req, res) => {
  try {
    // Check if app is ready to serve traffic
    const ready = mongoose.connection.readyState === 1;

    if (ready) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready' });
    }
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({ status: 'error' });
  }
};

const livenessCheck = async (req, res) => {
  // Simple check that app is alive
  res.status(200).json({ status: 'alive' });
};

const getMetrics = async (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    logger.error('Failed to retrieve metrics', { error: error.message, stack: error.stack });
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve metrics',
    });
  }
};

export default { healthCheck, readinessCheck, livenessCheck, getMetrics };
