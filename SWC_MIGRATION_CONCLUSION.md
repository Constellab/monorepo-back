# SWC Migration — Attempt & Conclusion

**Status: Abandoned (kept for history).** The Jest → `@swc/jest` part works; the build/serve part does **not** work out of the box in this monorepo.

## Goal

Follow https://docs.nestjs.com/recipes/swc to speed up `nest build`, `nest start --watch`, and Jest by replacing webpack/tsc + ts-jest with SWC.

## What was tried

1. **`.swcrc`** (new) — `decoratorMetadata: true`, `keepClassNames: true`, `legacyDecorator: true`, `@monorepo/*` alias `paths`.
2. **`nest-cli.json`** — `builder: swc` + `typeCheck: true` (replacing `webpack: true`).
3. **Jest (6 configs)** — `ts-jest` → `@swc/jest` + explicit `moduleNameMapper` for the 3 `@monorepo/*` aliases.
4. **`package.json`** — `:build` scripts set to `nest build <app> --webpack` (attempted webpack-for-prod / SWC-for-dev split), added `@swc/jest` devDep.

## The blocker

**The Nest SWC builder does not compile the `@monorepo/*` path-aliased libraries.** It emits only the app's own `src` (379 files, no `libs/` tree), yet rewrites the alias imports (via the app tsconfig `paths`) to relative requires like:

```js
const _backcorelib = require('../../../libs/back-core-lib/src');
```

From the emitted entry `dist/apps/cn-space-api/apps/cn-space-api/src/cn-main.js`, that resolves to `dist/apps/cn-space-api/libs/back-core-lib/src/index.js` — **which is never generated**. Result, on both `nest build` output AND `nest start`:

```
Error: Cannot find module '../../../libs/back-core-lib/src'
```

Removing `paths` from `.swcrc` made no difference — the rewrite comes from the app tsconfig `paths`, read independently by the SWC builder. The real gap is simply that the libs are never emitted.

## Why the "webpack for prod, SWC for dev" split failed

- `nest build --webpack` (prod) works fine: single bundled `dist/apps/cn-space-api/cn-main.js`, 0 unresolved aliases, Dockerfile + `node dist/cn-main` unchanged. ✅
- But `nest start` (dev serve) uses the **SWC** builder from `nest-cli.json` and hits the exact same missing-lib crash. ❌ So SWC never actually runs the app.

## Attempts to compile the libs into dist (all fragile)

- **SWC CLI over `libs/` with `.swcrc`** → fails on Windows: `failed to canonicalize base url using the path of .swcrc` (relative `baseUrl: "."` can't resolve per-file from nested dirs).
- **SWC CLI `--no-swcrc` + inline `-C` config** → compiles, but:
  - `-d` double-nests the output (`libs/back-core-lib/libs/back-core-lib/src`); needs `--strip-leading-paths`.
  - Inter-lib `@monorepo/*` requires aren't rewritten (both `back-core-lib` and `te-text-editor` import `@monorepo/core-lib`); inline `-C jsc.paths` array syntax is unreliable.

Getting this portable across dev/CI/Docker (no absolute machine paths in `.swcrc`) was not achieved.

## What actually works (proven)

- **`@swc/jest`** — verified: `te-text-editor` = 4 suites / 183 tests pass; SWC decorator-metadata behavior matches ts-jest (Nest DI reads constructor param types identically — confirmed by an incomplete service spec failing the same way under both transforms).
- **Side fix found:** the unit `jest.config.ts` files referenced `jest.preset.js`, which was **deleted with nx** in commit `ada302434 (feat) remove nx`. So `jest --config <unit config>` was already broken pre-SWC (`Preset ../../jest.preset.js not found`). Replaced the dead `preset` line with a standalone `testMatch`.

## Options if revisited

1. **Just do `@swc/jest` for tests**, leave build/serve on webpack. Low risk, real test speedup, no boot issues. (Recommended.)
2. **Runtime shim**: keep SWC serve, add `-r tsconfig-paths/register -r @swc-node/register` so `@monorepo/*` resolves to lib source at boot (transpile lib `.ts` on the fly). More moving parts.
3. **Custom lib-compile pipeline**: `--strip-leading-paths` SWC pass over the 3 libs + inter-lib alias rewrite, wired into serve/build. Most fragile on Windows.

## Files touched in this attempt (for the history branch)

- `.swcrc` (new), `nest-cli.json`, `package.json`, `bun.lock`
- `apps/{cn-space-api,hn-community-api}/jest.config.ts`
- `libs/{back-core-lib,core-lib,te-text-editor}/jest.config.ts`
- `apps/cn-space-api/test/jest-e2e.json`
- `CLAUDE.md` (SWC section — should be reverted if the migration is dropped)
