module.exports = {
  ...require('./jest.config.js'),
  testMatch: [
    '**/integration/**/*.test.ts',
    '**/integration/**/*.test.tsx'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  testTimeout: 30000, // Increased timeout for integration tests
};