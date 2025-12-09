import mongoose from "mongoose";
import logger from "./logger.js";
import { createIndexes } from "./dbIndexes.js";

// Get MongoDB URI from environment variables
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is not defined in environment variables. Please check your .env file."
  );
}

// Connection options for production-ready setup
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
};

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri, options);
    logger.info("Successfully connected to MongoDB!");

    // Create database indexes for performance
    if (process.env.CREATE_INDEXES !== 'false') {
      await createIndexes();
    }
  } catch (error) {
    logger.error("MongoDB connection failed:", { error: error.message });
    throw error;
  }
}

export default connectToMongoDB;
