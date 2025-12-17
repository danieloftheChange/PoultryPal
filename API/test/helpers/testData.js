/**
 * Test Data Helpers
 * Provides factory functions for creating test data
 */

export const createTestUser = (overrides = {}) => ({
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test@123456',
  role: 'Manager',
  ...overrides
});

export const createTestFarm = (overrides = {}) => ({
  name: 'Test Farm',
  location: 'Test Location',
  ...overrides
});

export const createTestBatch = (farmId, overrides = {}) => ({
  farmId,
  name: 'Test Batch',
  arrivalDate: new Date(),
  ageAtArrival: 1,
  chickenType: 'Broiler',
  originalCount: 1000,
  supplier: 'Test Supplier',
  ...overrides
});

export const validUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'SecureP@ss123'
};

export const invalidUserData = {
  weakPassword: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'weak' // Too weak
  },
  invalidEmail: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'not-an-email', // Invalid format
    password: 'SecureP@ss123'
  },
  missingField: {
    firstName: 'John',
    // Missing lastName
    email: 'john@example.com',
    password: 'SecureP@ss123'
  }
};

export const validLoginData = {
  email: 'john@example.com',
  password: 'SecureP@ss123'
};

export const invalidLoginData = {
  wrongPassword: {
    email: 'john@example.com',
    password: 'WrongPass123!'
  },
  nonExistentUser: {
    email: 'nonexistent@example.com',
    password: 'SecureP@ss123'
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'SecureP@ss123'
  }
};
