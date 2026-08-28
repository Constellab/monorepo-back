export default {
  displayName: 'te-text-editor',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  // 2 workers, not the jest default of cpus-1: each worker reloads the full
  // import graph of its specs, so the default peaked at 3GB RSS and ran slower
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/te-text-editor',
  moduleNameMapper: {
    '^@monorepo/core-lib$': '<rootDir>/../../libs/core-lib/src/index.ts',
    '^@monorepo/back-core-lib$': '<rootDir>/../../libs/back-core-lib/src/index.ts',
    '^@monorepo/te-text-editor$': '<rootDir>/../../libs/te-text-editor/src/index.ts',
  },
};
