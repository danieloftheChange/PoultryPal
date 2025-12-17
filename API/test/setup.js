import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import logger from '../config/logger.js';

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  try {
    // Disconnect any existing connections first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    // Silence logger during tests
    logger.transports.forEach(transport => {
      transport.silent = true;
    });

    console.log('Test database connected');
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Test database disconnected');
  } catch (error) {
    console.error('Error tearing down test database:', error);
  }
});

// Clear all collections after each test
afterEach(async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-at-least-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-at-least-32-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.PORT = '3000';
