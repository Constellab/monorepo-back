// Binds the runner-neutral `testMock` global that the `src/lib` specs shared with the upstream
// Vitest-based repo call, so the same spec source runs here on Jest. `test-globals.d.ts` types it
// as a const, so the binding goes through Object.assign rather than an assignment to globalThis.
Object.assign(globalThis, { testMock: jest });
