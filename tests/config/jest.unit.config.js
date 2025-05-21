module.exports = {
  ...require('./jest.config.js'),
  testMatch: [
    '**/unit/**/*.test.ts',
    '**/unit/**/*.test.tsx'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000, // Shorter timeout for unit tests
};