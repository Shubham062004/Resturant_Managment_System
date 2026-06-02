module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/tests/**'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
