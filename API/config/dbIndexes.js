/**
 * Database Indexes Configuration
 *
 * Creates indexes for improved query performance
 * Run this after database connection is established
 */

import logger from './logger.js';
import User from '../src/users/users.model.js';
import Farm from '../src/farm/farm.model.js';
import { Batch, BatchAllocation } from '../src/batch/batch.model.js';
import Diagnosis from '../src/diagnosis/diagnosis.model.js';
import Stock from '../src/stock/stock.model.js';
import House from '../src/house/house.model.js';
import Production from '../src/production/production.model.js';
import Monitoring from '../src/monitoring/monitoring.model.js';

/**
 * Create all database indexes
 * This improves query performance for frequently accessed fields
 */
export const createIndexes = async () => {
  try {
    logger.info('Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ id: 1 }, { unique: true });
    await User.collection.createIndex({ farmId: 1 }); // For farm-based queries
    await User.collection.createIndex({ role: 1, farmId: 1 }); // Compound index for role filtering
    logger.info('✓ User indexes created');

    // Farm indexes
    await Farm.collection.createIndex({ id: 1 }, { unique: true });
    await Farm.collection.createIndex({ name: 1 }); // For search by name
    logger.info('✓ Farm indexes created');

    // Batch indexes
    await Batch.collection.createIndex({ id: 1 }, { unique: true });
    await Batch.collection.createIndex({ farmId: 1 }); // Most common query
    await Batch.collection.createIndex({ farmId: 1, isArchived: 1 }); // Active batches query
    await Batch.collection.createIndex({ farmId: 1, arrivalDate: -1 }); // Sort by date
    await Batch.collection.createIndex({ chickenType: 1, farmId: 1 }); // Filter by type
    logger.info('✓ Batch indexes created');

    // Batch Allocation indexes
    await BatchAllocation.collection.createIndex({ id: 1 }, { unique: true });
    await BatchAllocation.collection.createIndex({ batchId: 1 });
    await BatchAllocation.collection.createIndex({ houseId: 1 });
    await BatchAllocation.collection.createIndex({ batchId: 1, houseId: 1 }); // Compound lookup
    logger.info('✓ Batch Allocation indexes created');

    // Diagnosis indexes
    await Diagnosis.collection.createIndex({ id: 1 }, { unique: true });
    await Diagnosis.collection.createIndex({ farmId: 1 });
    await Diagnosis.collection.createIndex({ farmId: 1, createdAt: -1 }); // Recent diagnoses
    await Diagnosis.collection.createIndex({ disease: 1, farmId: 1 }); // Filter by disease
    logger.info('✓ Diagnosis indexes created');

    // Stock indexes
    await Stock.collection.createIndex({ id: 1 }, { unique: true });
    await Stock.collection.createIndex({ farmId: 1 });
    await Stock.collection.createIndex({ farmId: 1, category: 1 }); // Filter by category
    await Stock.collection.createIndex({ farmId: 1, quantity: 1 }); // Low stock queries
    await Stock.collection.createIndex({ itemName: 'text' }); // Text search
    logger.info('✓ Stock indexes created');

    // House indexes
    await House.collection.createIndex({ id: 1 }, { unique: true });
    await House.collection.createIndex({ farmId: 1 });
    await House.collection.createIndex({ farmId: 1, status: 1 }); // Filter by status
    logger.info('✓ House indexes created');

    // Production indexes
    await Production.collection.createIndex({ id: 1 }, { unique: true });
    await Production.collection.createIndex({ farmId: 1 });
    await Production.collection.createIndex({ farmId: 1, date: -1 }); // Recent production
    await Production.collection.createIndex({ batchId: 1 }); // Production per batch
    logger.info('✓ Production indexes created');

    // Monitoring indexes
    await Monitoring.collection.createIndex({ id: 1 }, { unique: true });
    await Monitoring.collection.createIndex({ farmId: 1 });
    await Monitoring.collection.createIndex({ farmId: 1, timestamp: -1 }); // Recent readings
    await Monitoring.collection.createIndex({ houseId: 1, timestamp: -1 }); // House monitoring
    logger.info('✓ Monitoring indexes created');

    // Compound index for timestamps (common in all collections)
    await User.collection.createIndex({ createdAt: 1 });
    await Farm.collection.createIndex({ createdAt: 1 });
    await Batch.collection.createIndex({ createdAt: 1 });
    logger.info('✓ Timestamp indexes created');

    logger.info('✅ All database indexes created successfully');
  } catch (error) {
    logger.error('Error creating database indexes:', { error: error.message });
    throw error;
  }
};

/**
 * List all indexes for a collection
 * Useful for debugging and verification
 */
export const listIndexes = async (model) => {
  try {
    const indexes = await model.collection.getIndexes();
    logger.info(`Indexes for ${model.collection.collectionName}:`, indexes);
    return indexes;
  } catch (error) {
    logger.error(`Error listing indexes for ${model.collection.collectionName}:`, {
      error: error.message
    });
    throw error;
  }
};

/**
 * Drop all indexes for a collection (except _id)
 * Use with caution - only for maintenance
 */
export const dropIndexes = async (model) => {
  try {
    await model.collection.dropIndexes();
    logger.info(`Dropped all indexes for ${model.collection.collectionName}`);
  } catch (error) {
    logger.error(`Error dropping indexes for ${model.collection.collectionName}:`, {
      error: error.message
    });
    throw error;
  }
};

/**
 * Analyze query performance
 * Returns execution stats for a query
 */
export const analyzeQuery = async (model, query) => {
  try {
    const explain = await model.find(query).explain('executionStats');
    logger.info('Query analysis:', {
      collection: model.collection.collectionName,
      executionTimeMs: explain.executionStats.executionTimeMs,
      totalDocsExamined: explain.executionStats.totalDocsExamined,
      totalKeysExamined: explain.executionStats.totalKeysExamined,
      indexUsed: explain.executionStats.executionStages.indexName || 'COLLSCAN'
    });
    return explain;
  } catch (error) {
    logger.error('Error analyzing query:', { error: error.message });
    throw error;
  }
};

export default {
  createIndexes,
  listIndexes,
  dropIndexes,
  analyzeQuery
};
