module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    'packages/@liquid-ui/*/src/**/*.{ts,tsx}',
    '!packages/@liquid-ui/*/src/**/*.d.ts',
    '!packages/@liquid-ui/*/src/**/*.test.{ts,tsx}',
    '!packages/@liquid-ui/*/src/**/*.spec.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@liquid-ui/core$': '<rootDir>/packages/@liquid-ui/core/src',
    '^@liquid-ui/events$': '<rootDir>/packages/@liquid-ui/events/src',
    '^@liquid-ui/flows$': '<rootDir>/packages/@liquid-ui/flows/src',
    '^@liquid-ui/ai-engine$': '<rootDir>/packages/@liquid-ui/ai-engine/src',
    '^@liquid-ui/react-native$': '<rootDir>/packages/@liquid-ui/react-native/src',
    '^@liquid-ui/cloudflare$': '<rootDir>/packages/@liquid-ui/cloudflare/src',
    '^@liquid-ui/dev-tools$': '<rootDir>/packages/@liquid-ui/dev-tools/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
