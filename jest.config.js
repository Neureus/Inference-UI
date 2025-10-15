module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  collectCoverageFrom: [
    'packages/@velvet/*/src/**/*.{ts,tsx}',
    '!packages/@velvet/*/src/**/*.d.ts',
    '!packages/@velvet/*/src/**/*.test.{ts,tsx}',
    '!packages/@velvet/*/src/**/*.spec.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@velvet/core$': '<rootDir>/packages/@velvet/core/src',
    '^@velvet/events$': '<rootDir>/packages/@velvet/events/src',
    '^@velvet/flows$': '<rootDir>/packages/@velvet/flows/src',
    '^@velvet/ai-engine$': '<rootDir>/packages/@velvet/ai-engine/src',
    '^@velvet/react-native$': '<rootDir>/packages/@velvet/react-native/src',
    '^@velvet/cloudflare$': '<rootDir>/packages/@velvet/cloudflare/src',
    '^@velvet/dev-tools$': '<rootDir>/packages/@velvet/dev-tools/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  passWithNoTests: true,
};
