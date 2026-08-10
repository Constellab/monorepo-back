# Testing guide — cn-space-api

This app uses a **two-layer** testing strategy focused on catching regressions
during code changes without drowning in brittle tests.

## The rule

> Test **behavior and workflows**, not **structure**.
> A test that breaks when you rename a method — but the app still works — is the wrong test.

## The two layers

### Layer 1 — E2E / integration (real HTTP + real DB)

One test exercises controller → guard → aggregate service → TypeORM → database.
Best regression-per-test ratio, and it survives internal refactors. This is the
**primary** layer for aggregate workflows.

- Location: `test/*.e2e.spec.ts`
- Runs the whole app via `CnTestE2EHelper` (see `test/test-e2e-helper.class.ts`)
- Reference example: [`test/cn-auth.e2e.spec.ts`](test/cn-auth.e2e.spec.ts) — copy its structure.

### Layer 2 — Unit tests (isolated, no DB)

Fast, isolated tests for code with real branching logic. Mock the dependencies.

- Location: `*.spec.ts` next to the source file
- Reference example:
  [`src/app/cn-spaces/cn-space-aggregate-security.service.spec.ts`](src/app/cn-spaces/cn-space-aggregate-security.service.spec.ts) — copy its structure.

## What to test vs. not

|                                                                     |                               |
| ------------------------------------------------------------------- | ----------------------------- |
| ✅ Aggregate workflows (auth, spaces, user-deletion, folders, labs) | E2E through the controller    |
| ✅ Guards & `*-security.service.ts`                                 | Unit                          |
| ✅ Pure calculators (pricing, stats, 2FA, version/migration logic)  | Unit                          |
| ❌ `"should be defined"` placeholder specs                          | don't write them              |
| ❌ Thin controllers in isolation                                    | already covered by E2E        |
| ❌ `BlAbstractService` wrappers (`findAll` → `findPaginated`)       | that's testing the base class |
| ❌ DTOs / entities / enums                                          | no behaviour                  |

## Running the tests

### Unit tests (no database needed)

```bash
npx jest --config ./apps/cn-space-api/jest.config.ts
# a single file:
npx jest --config ./apps/cn-space-api/jest.config.ts --testPathPatterns "cn-space-aggregate-security"
```

`jest.config.ts` ignores `test/` (the E2E suites) and stubs `jsdom` (eagerly
imported by `te-text-editor`) so app-loading specs run under the node environment.

### E2E tests (require a local MySQL database and Redis)

```bash
npm run cn-space-api:test-e2e
# or directly:
ENVIRONMENT_PROFILE=test npx jest --config ./apps/cn-space-api/test/jest-e2e.json
```

**Local database** — the E2E helper drops and re-creates the schema on every run,
so point it at a throwaway DB, never a real one. Defaults (override with
`DATABASE_*` env vars, see `test/test-config.service.ts`):

| var                 | default         |
| ------------------- | --------------- |
| `DATABASE_HOST`     | `localhost`     |
| `DATABASE_PORT`     | `3306`          |
| `DATABASE_USER`     | `gencoveryUser` |
| `DATABASE_PASSWORD` | `gencovery`     |
| `DATABASE`          | `testDb`        |

**Local Redis** — the OAuth client and authorization-code stores are Redis-backed, so the
OAuth suites need one running at `QUEUE_SERVICE_HOST:QUEUE_SERVICE_PORT` (`localhost:6379`
by default). Keys are namespaced with a `cn:` prefix, so sharing one server with the
Community API is safe.

`CnTestDbInitializerService` (`test/cn-test.module.ts`) drops the DB,
`synchronize()`s the schema from the entities, and seeds a single admin user via
the repository (schema-proof — no raw SQL to drift). The admin credentials live
in [`test/test-credentials.ts`](test/test-credentials.ts).

## Conventions

- **Unit**: `*.spec.ts` beside the source. Instantiate the class directly or use
  `Test.createTestingModule` with mocked providers. No DB, no `CnAppModule`.
- **E2E**: `*.e2e.spec.ts` in `test/`. One `CnTestE2EHelper` per suite:
  `beforeAll` → `initAppModule()` (+ `loginAsAdmin()` for authenticated routes),
  `afterAll` → `close()`. `initAppModule` is slow (schema sync) — give the hook a
  generous timeout (e.g. `beforeAll(fn, 60_000)`).
- Reset the DB **once per suite** (`initAppModule` does it), not per test. Keep
  tests within a file order-independent, or assert the ordering explicitly.
- Need fixtures beyond the admin user (spaces, folders...)? Create them through
  the app's own endpoints/services in the suite so the data stays consistent —
  don't hand-write inserts.

## Rollout order

1. ✅ Auth E2E + one guard/security unit test (the reference templates).
2. ✅ Delete the empty placeholder specs.
3. Expand E2E per module, one PR each: spaces → folders → user-deletion → labs.
4. Add unit tests for the remaining guards/`*-security.service.ts` and pure calculators.
5. Add a MySQL service to CI and gate the E2E suite on DB availability.

> Layer-2 unit tests need no DB, so they give CI regression value **immediately**,
> even before the CI database lands.
