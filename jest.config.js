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
    'packages/@inference-ui/*/src/**/*.{ts,tsx}',
    '!packages/@inference-ui/*/src/**/*.d.ts',
    '!packages/@inference-ui/*/src/**/*.test.{ts,tsx}',
    '!packages/@inference-ui/*/src/**/*.spec.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@inference-ui/core$': '<rootDir>/packages/@inference-ui/core/src',
    '^@inference-ui/events$': '<rootDir>/packages/@inference-ui/events/src',
    '^@inference-ui/flows$': '<rootDir>/packages/@inference-ui/flows/src',
    '^@inference-ui/ai-engine$': '<rootDir>/packages/@inference-ui/ai-engine/src',
    '^@inference-ui/react-native$': '<rootDir>/packages/@inference-ui/react-native/src',
    '^@inference-ui/cloudflare$': '<rootDir>/packages/@inference-ui/cloudflare/src',
    '^@inference-ui/dev-tools$': '<rootDir>/packages/@inference-ui/dev-tools/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  passWithNoTests: true,
};
