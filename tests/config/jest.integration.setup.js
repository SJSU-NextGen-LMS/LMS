const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

require('@testing-library/jest-dom');

// Integration test specific setup
beforeAll(() => {
  // Setup code that runs once before all integration tests
});

afterAll(() => {
  // Cleanup code that runs once after all integration tests
});

afterEach(() => {
  // Cleanup code that runs after each integration test
  jest.clearAllMocks();
});