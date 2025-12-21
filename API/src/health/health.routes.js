import express from 'express';
import healthController from './health.controller.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API including database connection and memory usage
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is degraded or unhealthy
 */
router.get('/health', healthController.healthCheck);

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Returns whether the service is ready to accept traffic (K8s readiness probe)
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', healthController.readinessCheck);

/**
 * @swagger
 * /alive:
 *   get:
 *     summary: Liveness check endpoint
 *     description: Returns whether the service is alive (K8s liveness probe)
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/alive', healthController.livenessCheck);

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Application metrics endpoint
 *     description: Returns application metrics including request counts, response times, and error rates
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *       500:
 *         description: Failed to retrieve metrics
 */
router.get('/metrics', healthController.getMetrics);

export default router;
