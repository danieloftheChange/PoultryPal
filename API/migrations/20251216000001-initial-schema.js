/**
 * Initial Schema Migration
 *
 * This migration documents the existing database schema as of Phase 5.
 * It creates indexes for optimal query performance.
 */

export const up = async (db) => {
  // Users collection indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ id: 1 }, { unique: true });
  await db.collection('users').createIndex({ farmId: 1 });
  await db.collection('users').createIndex({ passwordResetToken: 1 });
  await db.collection('users').createIndex({ emailVerificationToken: 1 });

  // Farms collection indexes
  await db.collection('farms').createIndex({ id: 1 }, { unique: true });

  console.log('✓ Initial schema indexes created');
};

export const down = async (db) => {
  // Drop indexes
  await db.collection('users').dropIndex({ email: 1 });
  await db.collection('users').dropIndex({ id: 1 });
  await db.collection('users').dropIndex({ farmId: 1 });
  await db.collection('users').dropIndex({ passwordResetToken: 1 });
  await db.collection('users').dropIndex({ emailVerificationToken: 1 });

  await db.collection('farms').dropIndex({ id: 1 });

  console.log('✓ Initial schema indexes dropped');
};
