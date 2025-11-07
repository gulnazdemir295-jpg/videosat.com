/**
 * Jest Configuration
 * Test yapılandırma dosyası
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test dosyalarını bul
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // Coverage ayarları
  collectCoverage: false, // Default: false, --coverage ile açılır
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/jest.config.js',
    '!app.js', // Main app file excluded
    '!**/*.config.js'
  ],

  // Coverage threshold
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 15,
      statements: 15
    }
  },

  // Coverage rapor formatları
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Reset mocks between tests
  resetMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Coverage path ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/coverage/',
    '/.git/'
  ],

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/'
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Test results processor
  // testResultsProcessor: undefined,

  // Globals
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
