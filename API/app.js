import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger, { requestLogger } from "./config/logger.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./config/swagger.js";
import { generalLimiter } from "./config/rateLimiter.js";
import { getHelmetConfig } from "./config/helmet.config.js";
import { enforceHTTPS } from "./config/httpsEnforcement.js";
import { errorHandler, notFoundHandler } from "./config/errorHandler.js";
import { requestIdMiddleware, responseTimeMiddleware, errorTrackingMiddleware } from "./config/requestTracking.js";
import healthRoutes from "./src/health/health.routes.js";
import farmRoutes from "./src/farm/farm.routes.js";
import userRoutes from "./src/users/users.routes.js";
import diagnosisRoutes from "./src/diagnosis/diagnosis.routes.js";
import houseRoutes from "./src/house/house.routes.js";
import stockRoutes from "./src/stock/stock.routes.js";
import batchRoutes from "./src/batch/batch.routes.js";
import productionRoutes from "./src/production/production.routes.js";
import monitoringRoutes from "./src/monitoring/monitoring.routes.js";

const app = express();

// Trust proxy when behind reverse proxy (nginx, load balancer)
app.set('trust proxy', 1);

// Security: Enforce HTTPS in production
app.use(enforceHTTPS);

// Security: Set security headers with Helmet
app.use(getHelmetConfig());

// Configure CORS with environment variables
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',').map(origin => origin.trim()) || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

// Request tracking middleware
app.use(requestIdMiddleware);
app.use(responseTimeMiddleware);

// Request logging middleware
app.use(requestLogger);

// Apply rate limiting to all API routes
app.use('/api/', generalLimiter);

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Health check endpoints (no rate limiting, no auth)
app.use("/api/v1", healthRoutes);

app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/api/v1/farm", farmRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/diagnosis", diagnosisRoutes);
app.use("/api/v1/house", houseRoutes);
app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/batch", batchRoutes);
app.use("/api/v1/production", productionRoutes);
app.use("/api/v1/monitoring", monitoringRoutes);


// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error tracking - before error handler
app.use(errorTrackingMiddleware);

// Global error handler - must be last
app.use(errorHandler);

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NODE_ENV',
  'PORT'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', { missing: missingEnvVars });
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Production-specific validation
if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET too short in production');
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    logger.error('JWT_REFRESH_SECRET too short in production');
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
  }
  if (process.env.MONGODB_URI.includes('localhost')) {
    logger.warn('MONGODB_URI uses localhost in production - ensure this is intentional');
  }
}

logger.info('Environment validation passed');

export default app;
