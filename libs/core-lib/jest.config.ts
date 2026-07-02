export default {
  displayName: 'core-lib',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.spec.ts', '<rootDir>/**/*.test.ts'],
  transform: {
    '^.+\\.[tj]s$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/core-lib',
  moduleNameMapper: {
    '^@monorepo/core-lib$': '<rootDir>/../../libs/core-lib/src/index.ts',
    '^@monorepo/back-core-lib$': '<rootDir>/../../libs/back-core-lib/src/index.ts',
    '^@monorepo/te-text-editor$': '<rootDir>/../../libs/te-text-editor/src/index.ts',
  },
};
