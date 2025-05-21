module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: [
    '<rootDir>/../client',
    '<rootDir>/../server'
  ],
  testMatch: [
    '**/unit/**/*.test.ts',
    '**/unit/**/*.test.tsx',
    '**/integration/**/*.test.ts',
    '**/integration/**/*.test.tsx'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json'
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../client/src/$1',
    '^@clerk/(.*)$': '<rootDir>/../node_modules/@clerk/$1'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  moduleDirectories: ['node_modules', '<rootDir>/../node_modules'],
} 