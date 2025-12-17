export default {
  testEnvironment: 'node',

  // Coverage settings
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    'config/**/*.js',
    '!src/seed/**',
    '!**/*.test.js',
    '!**/__tests__/**',
  ],

  // Coverage thresholds - apply to tested modules only
  // Enforces quality standards for modules with comprehensive tests
  coverageThreshold: {
    './src/users/**/*.js': {
      branches: 69,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './src/health/**/*.js': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90
    },
    './src/common/validators/user.validator.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    './config/requestTracking.js': {
      branches: 70,
      functions: 100,
      lines: 80,
      statements: 80
    },
    './config/metrics.js': {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Test files pattern
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // Transform settings for ES modules
  transform: {},

  // Module resolution
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // Timeouts
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Detect open handles
  detectOpenHandles: true,

  // Force exit after tests
  forceExit: true,
};
