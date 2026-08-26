// Types the runner-neutral `testMock` global that `src/test-setup.ts` binds to Jest's `jest`, for
// the specs of `src/lib` that are shared with the upstream Vitest-based repo. Without it those
// calls fail to typecheck, since this project declares only the Jest globals.
declare const testMock: typeof jest;
