/**
 * Server Entry Point
 * Starts the Express server with MongoDB connection
 */

import logger from "./config/logger.js";
import connectToMongoDB from "./config/db.js";
import app from "./app.js";

const port = process.env.PORT || 3000;

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
