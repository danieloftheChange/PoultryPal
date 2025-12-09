import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import logger, { requestLogger } from "./config/logger.js";
import connectToMongoDB from "./config/db.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./config/swagger.js";
import { generalLimiter } from "./config/rateLimiter.js";
import { getHelmetConfig } from "./config/helmet.config.js";
import { enforceHTTPS } from "./config/httpsEnforcement.js";
import { errorHandler, notFoundHandler } from "./config/errorHandler.js";
import farmRoutes from "./src/farm/farm.routes.js";
import userRoutes from "./src/users/users.routes.js";
import diagnosisRoutes from "./src/diagnosis/diagnosis.routes.js";
import houseRoutes from "./src/house/house.routes.js";
import stockRoutes from "./src/stock/stock.routes.js";
import batchRoutes from "./src/batch/batch.routes.js";
import productionRoutes from "./src/production/production.routes.js";
import monitoringRoutes from "./src/monitoring/monitoring.routes.js";

const port = process.env.PORT || 3000;
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
app.use(cors(corsOptions));

// Request logging middleware
app.use(requestLogger);

// Apply rate limiting to all API routes
app.use('/api/', generalLimiter);

const swaggerDocs = swaggerJsdoc(swaggerOptions);

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

// Global error handler - must be last
app.use(errorHandler);

// Connect to MongoDB and start the server
connectToMongoDB()
  .then(() => {
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info(`Server is running on http://0.0.0.0:${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle uncaught exceptions and unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down...', { error: err });
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! Shutting down...', { error: err });
      process.exit(1);
    });
  })
  .catch((error) => {
    logger.error("Failed to start server due to MongoDB connection error:", { error });
    process.exit(1);
  });

export default app;
