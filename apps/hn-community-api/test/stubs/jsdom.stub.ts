/**
 * Test stub for `jsdom`.
 *
 * The `te-text-editor` lib eagerly imports `jsdom` at module load, which pulls a
 * browser-only runtime that cannot initialise under the jest `node` test
 * environment. None of the E2E flows exercise it, so we replace jsdom with a
 * minimal stub.
 *
 * If a test ever needs real DOM parsing, switch that suite to the jsdom test
 * environment instead of relying on this stub.
 */
export class JSDOM {
  window: unknown;

  constructor() {
    throw new Error(
      'jsdom is stubbed in tests (see test/stubs/jsdom.stub.ts). ' +
        'Use the jsdom test environment for suites that need real DOM parsing.'
    );
  }
}
