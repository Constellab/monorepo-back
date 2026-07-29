export default {
  displayName: 'back-core-lib',
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    // resolve the @monorepo/* path aliases (declared in tsconfig.base.json)
    '^@monorepo/core-lib$': '<rootDir>/../../libs/core-lib/src/index.ts',
    '^@monorepo/back-core-lib$': '<rootDir>/../../libs/back-core-lib/src/index.ts',
    '^@monorepo/te-text-editor$': '<rootDir>/../../libs/te-text-editor/src/index.ts',
  },
  coverageDirectory: '../../coverage/libs/back-core-lib',
};
