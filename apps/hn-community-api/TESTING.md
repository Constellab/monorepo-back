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

### E2E tests (require the test database)

```bash
bun run test-db:up                  # MariaDB + Redis, throwaway, ~5s to healthy
bun run hn-community-api:test-e2e
bun run test-db:down                # when you are done
```

**Backing services** — [`compose.test.yml`](../../compose.test.yml) at the repo root owns
them, and CI runs that same file
([`.github/workflows/tests.yml`](../../.github/workflows/tests.yml)) so "green locally" and
"green in CI" are the same statement. Nothing persists: the datadir is a tmpfs and
`test-db:down` removes it. If the ports are still held by hand-made containers from before
this file existed, remove those (`docker rm -f community-test-db`) — compose is the source
of truth now.

**Database** — the E2E helper drops and re-creates the schema on every run, so it must
point at a throwaway DB: the `community-test-db` service (port **3312**), NOT the dev DB.
Config comes from `src/environments/hn-test.env` (loaded automatically when
`ENVIRONMENT_PROFILE=test`); a real env var wins over the file (`@nestjs/config` never
overwrites what is already in `process.env`), which is the hook for pointing a run
elsewhere:

| var                 | value           |
| ------------------- | --------------- |
| `DATABASE_HOST`     | `localhost`     |
| `DATABASE_PORT`     | `3312`          |
| `DATABASE_USER`     | `gencoveryUser` |
| `DATABASE_PASSWORD` | `gencovery`     |
| `DATABASE`          | `testDb`        |

### Everything one release gate runs

```bash
bun run hn-community-api:test-ci   # unit + E2E + the shared libs (back-core-lib, te-text-editor)
```

The libs are in there because both apps import them: a change to `back-core-lib` or
`core-lib` can only break the _other_ app, which is exactly what a per-app suite misses.

`HnTestDbInitializerService` (`test/hn-test.module.ts`) drops the DB,
`synchronize()`s the schema from the entities, and seeds a single admin user via
the repository. It refuses to run against a database whose name doesn't contain
"test". Admin credentials live in [`test/test-credentials.ts`](test/test-credentials.ts).

> Note: hn local login is **email-only** — `HnUser` has no password column, so
> login succeeds for any known email. An unknown email returns `2FA_REQUIRED`.

**Suites run serially** (`maxWorkers: 1`). Every suite drops and re-synchronizes the
same database in `beforeAll`, so two in parallel would tear down each other's schema
mid-test. Adding an E2E file therefore costs wall-clock time, not correctness.

**The rate limiter is disabled by default**, via `overrideGuard` in
`HnTestE2EHelper.initAppModule`. `/auth/login` allows 10 requests per minute per IP,
every supertest request comes from the same IP, and a suite runs well inside one
minute — so a functional suite that logs in more than ten times fails on a 429 that
has nothing to do with what it asserts. Opt back in with
`initAppModule({ throttling: true })`, which only
[`hn-throttle.e2e.spec.ts`](test/hn-throttle.e2e.spec.ts) does, since the limit is
what it tests. Disabling rather than raising the limit for tests keeps the shipped
value the one that runs in production.

> The E2E app is built by `Test.createTestingModule` + `app.init()`, so **`hn-main.ts`
> never runs**: global pipes, CORS and `trust proxy` are not applied. E2E covers the
> module graph and the HTTP contract, not the bootstrap configuration.

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
5. ✅ CI runs the suites on every PR and on master, and `hn_*` tags do not build an
   image until they pass (`.github/workflows/ci.yml`, `build-community-api.yml`).
