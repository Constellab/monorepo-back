export default {
  displayName: 'te-text-editor',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': '@swc/jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/te-text-editor',
  moduleNameMapper: {
    '^@monorepo/core-lib$': '<rootDir>/../../libs/core-lib/src/index.ts',
    '^@monorepo/back-core-lib$': '<rootDir>/../../libs/back-core-lib/src/index.ts',
    '^@monorepo/te-text-editor$': '<rootDir>/../../libs/te-text-editor/src/index.ts',
  },
};
