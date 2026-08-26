export default {
  displayName: 'hn-community-api',
  rootDir: '.',
  testEnvironment: 'node',
  // 2 workers, not the jest default of cpus-1: each worker reloads the full
  // import graph of its specs, so the default peaked at 3GB RSS and ran slower
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // the DB-backed E2E suites live in test/ and run via test/jest-e2e.json
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test/'],
  moduleNameMapper: {
    // stub jsdom (eagerly imported by te-text-editor) so specs that load the
    // app module don't pull a browser-only runtime into the node environment
    '^jsdom$': '<rootDir>/test/stubs/jsdom.stub.ts',
    // resolve the @monorepo/* path aliases (declared in tsconfig.base.json)
    '^@monorepo/core-lib$': '<rootDir>/../../libs/core-lib/src/index.ts',
    '^@monorepo/back-core-lib$': '<rootDir>/../../libs/back-core-lib/src/index.ts',
    '^@monorepo/te-text-editor$': '<rootDir>/../../libs/te-text-editor/src/index.ts',
  },
  coverageDirectory: '../../coverage/apps/hn-community-api',
};
