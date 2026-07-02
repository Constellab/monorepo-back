# Testing guide — hn-community-api

This app uses a **two-layer** testing strategy focused on catching regressions
during code changes without drowning in brittle tests. It mirrors the setup in
`apps/cn-space-api`.

## The rule

> Test **behavior and workflows**, not **structure**.
> A test that breaks when you rename a method — but the app still works — is the wrong test.

## The two layers

### Layer 1 — E2E / integration (real HTTP + real DB)

One test exercises controller → guard → service → TypeORM → database. Best
regression-per-test ratio, survives internal refactors.

- Location: `test/*.e2e.spec.ts`, runs the whole app via `HnTestE2EHelper`.
- Reference example: [`test/hn-auth.e2e.spec.ts`](test/hn-auth.e2e.spec.ts) — copy its structure.

### Layer 2 — Unit tests (isolated, no DB)

Fast, isolated tests for code with real branching logic. Mock the dependencies.

- Location: `*.spec.ts` next to the source file.
- Reference example:
  [`src/app/core/security/hn-community-security.service.spec.ts`](src/app/core/security/hn-community-security.service.spec.ts) — copy its structure.

## What to test vs. not

|                                            |                               |
| ------------------------------------------ | ----------------------------- |
| ✅ Aggregate workflows, auth               | E2E through the controller    |
| ✅ Guards & `*-security.service.ts`        | Unit                          |
| ✅ Pure logic / calculators                | Unit                          |
| ❌ `"should be defined"` placeholder specs | don't write them              |
| ❌ Thin controllers in isolation           | already covered by E2E        |
| ❌ `BlAbstractService` wrappers            | that's testing the base class |
| ❌ DTOs / entities / enums                 | no behaviour                  |

## Running the tests

### Unit tests (no database needed)

```bash
bun run hn-community-api:test
# a single file:
bun run hn-community-api:test -- --testPathPatterns "hn-community-security"
```

`jest.config.ts` ignores `test/` (the E2E suites) and stubs `jsdom` (eagerly
imported by `te-text-editor`) so app-loading specs run under the node environment.

### E2E tests (require a local MySQL database)

```bash
bun run hn-community-api:test-e2e
```

**Local database** — the E2E helper drops and re-creates the schema on every run,
so it must point at a throwaway DB. It uses the dedicated **`community-test-db`**
docker container (port 3312), NOT the dev DB. Config comes from
`src/environments/hn-test.env` (loaded automatically when `ENVIRONMENT_PROFILE=test`),
overridable via `DATABASE_*` env vars. Defaults:

| var                 | default         |
| ------------------- | --------------- |
| `DATABASE_HOST`     | `localhost`     |
| `DATABASE_PORT`     | `3312`          |
| `DATABASE_USER`     | `gencoveryUser` |
| `DATABASE_PASSWORD` | `gencovery`     |
| `DATABASE`          | `testDb`        |

`HnTestDbInitializerService` (`test/hn-test.module.ts`) drops the DB,
`synchronize()`s the schema from the entities, and seeds a single admin user via
the repository. It refuses to run against a database whose name doesn't contain
"test". Admin credentials live in [`test/test-credentials.ts`](test/test-credentials.ts).

> Note: hn local login is **email-only** — `HnUser` has no password column, so
> login succeeds for any known email. An unknown email returns `2FA_REQUIRED`.

## Conventions

- **Unit**: `*.spec.ts` beside the source. Instantiate directly or use
  `Test.createTestingModule` with mocked providers. No DB, no `HnAppModule`.
- **E2E**: `*.e2e.spec.ts` in `test/`. One `HnTestE2EHelper` per suite:
  `beforeAll` → `initAppModule()` (+ `loginAsAdmin()` for authenticated routes),
  `afterAll` → `close()`. `initAppModule` is slow — give the hook a generous
  timeout (e.g. `beforeAll(fn, 60_000)`).
- Reset the DB **once per suite**, not per test. Keep tests order-independent or
  assert ordering explicitly.

## Rollout order

1. ✅ Auth E2E + one guard/security unit test (the reference templates).
2. ✅ Delete the empty placeholder specs.
3. Expand E2E per module (brick, agent, story, comment aggregates...), one PR each.
4. Add unit tests for the remaining guards/`*-security.service.ts` and pure logic.
5. Add a MySQL service to CI and gate the E2E suite on DB availability.

> Layer-2 unit tests need no DB, so they give CI regression value **immediately**,
> even before the CI database lands.
