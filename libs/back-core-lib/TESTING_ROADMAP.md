# back-core-lib — test roadmap

A phased, ROI-ordered checklist for building a regression suite for the `Bl`
shared backend library.

Unlike cn-space-api, this is a **pure library** — no controllers, no database, no
app to boot. So there is **no E2E layer**: everything here is **unit tests**
(`*.spec.ts` next to the source, direct instantiation or `Test.createTestingModule`
with mocked deps). That makes the whole suite fast, DB-free, and CI-ready from day
one.

**The rule (same as the app):** test **behaviour**, not structure. Prioritize code
with real branching — parsing, comparison, transformation, security decisions,
metadata-driven logic. Skip thin wrappers, barrel re-exports, type/interface files,
enums, and decorators that only call `SetMetadata`.

Legend: **[U]** = unit test. Everything here is [U].

Status today: Phase 0 done. Run the suite with `bun run back-core-lib:test`.

---

## Phase 0 — foundation (do first)

- [x] **Recreate `jest.config.ts`** — self-contained (no `jest.preset.js`), `node`
      environment, `ts-jest`, `@monorepo/*` `moduleNameMapper`. `isolatedModules` lives
      in `tsconfig.spec.json` (the `ts-jest` transform option is deprecated). No `jsdom`
      stub yet — add one if a spec ever pulls in `te-text-editor`.
- [x] **Restore `tsconfig.spec.json`** and its `./tsconfig.spec.json` reference in
      `tsconfig.json`.
- [x] **Add npm scripts**: `back-core-lib:test` (like `te-text-editor:test`).
- [x] **Add to VS Code Test Explorer** — `back-core-lib` entry in `jest.virtualFolders`.
- [x] **First reference test** — ended up being `modules/bl-jwt/bl-jwt.strategy.spec.ts`
      (Phase 4) rather than `BlVersion`, because the audience-scoped token check landed
      first. It is the template to copy: direct instantiation, a `jest.fn()` for
      `usersService`, one assertion per branch.

**Still open from this phase:** `BlVersion` remains untested — see Phase 1.

---

## Phase 1 — pure-logic utilities (highest ROI, zero deps)

Pure functions / value objects. No mocks, no framework. Fast and near-zero
maintenance — bank these first.

- [ ] **[U]** `utils/bl-version.class.ts` — `BlVersion`: parse `2.1.1` and
      `2.2.0-beta.1`; `getDif()` comparison matrix (equal, major/minor/patch/subPatch
      differ, beta < release, beta.2 > beta.1); beta detection; malformed input.
- [ ] **[U]** `utils/bl-cookie.helper.ts` — `getCookieFromHeader()` /
      `parseCookieFromString()`: null/empty header, match first/middle/none, and a
      value that itself contains `=` (e.g. `Authorization=Bearer%20...`). **This
      backs the whole JWT-cookie auth path — high value.**
- [ ] **[U]** `utils/bl-file-helper.ts` — `BlFileHelper`: extension extraction,
      `extensionIs*` type detection (PDF/Word/Excel/Image), `addIndexToFileName`,
      path parsing; `convertFileStreamToBuffer` (chunk aggregation + error path).
- [ ] **[U]** `utils/bl-csv.helper.ts` — `toCsv()`: header + rows, empty set,
      values needing escaping/commas.
- [ ] **[U]** `models/bl-search/bl-search.class.ts` — `BlSearchParams`:
      `hasFilter` / `removeFilter` / `getFilterValue` (present + missing) / `clone`.
- [ ] **[U]** `models/bl-event.class.ts` — `BlEventResponses`:
      `hasError` / `isSuccess` / `getFirstError` across mixed success/error sets.

---

## Phase 2 — search / pagination logic (pure, but intricate)

The most branching-heavy pure code in the lib — worth its own phase.

- [ ] **[U]** `models/bl-search/bl-search.builder.ts` — `convertFilterValue()`:
      one assertion per operator in the ~15-case switch (EQ, NEQ, LT/GT, BETWEEN with
      array-index safety, START_WITH/END_WITH `%` patterns, IN, NULL, CONTAINS…).
- [ ] **[U]** `bl-search.builder.ts` — `deepMergeWhereOptions()`: recursive merge,
      `FindOperator` special-casing, array concat; and `build()` OR-logic mapping.
- [ ] **[U]** `services/bl-abstract-paginated.service.ts` — `getSafePage()` (clamp
      to ≥0), `getSafePageSize()` (negative → default, over-max → capped at 50),
      `findPaginated()` skip/take math (mock the repository).

---

## Phase 3 — base service + metadata logic (mock the repository)

The base class every app service extends — test **once here**, not per app.

- [ ] **[U]** `services/bl-abstract.service.ts` — `create()` nulls `id` before save;
      `findById()` null-id guard throws; `findByIdAndCheck()` throws
      `BlNotFoundException` when missing; **`updateWithCompare()`** — the key one:
      `@BlNotUpdatable` fields are skipped, `undefined` skipped, `null` applied
      (null ≠ undefined), valid fields assigned. Mock `Repository`/`EntityManager`.
- [ ] **[U]** `decorators/bl-not-updatable.decorator.ts` — `blPropertyIsNotUpdatable()`
      reads back the metadata set by `@BlNotUpdatable()` (the read side has logic; the
      write side is trivial). Underpins the above.
- [ ] **[U]** `decorators/bl-luxon-column.decorator.ts` — the `ValueTransformer`'s
      `to`/`from` (Luxon ↔ DB) round-trip, including null handling.
- [ ] **[U]** `decorators/bl-trim.decorator.ts` + `bl-lower-case.decorator.ts` — the
      transform functions: start/end/both trim; non-string input passthrough.

---

## Phase 4 — framework-integrated logic (mock reflector / context / clients)

Real logic, but wrapped in NestJS plumbing. Instantiate directly and feed a mocked
`Reflector`/`ExecutionContext`/service.

- [ ] **[U]** `pipes/bl-parse-enum.pipe.ts` — valid value passes; unknown value
      throws `BlBadRequestException`.
- [ ] **[U]** `pipes/bl-uploaded-file-utf-8.pipe.ts` — latin1→utf8 re-encode of
      `originalname`; single file vs array; empty.
- [ ] **[U]** `exceptions/bl-core-exception-handler.filter.ts` — the `catch()`
      dispatch chain: `BlHttpException` → `HttpException` → `QueryFailedError`
      (`ER_DATA_TOO_LONG`) → unknown; production mode hides details. Mock the ArgumentsHost/response.
- [ ] **[U]** `interceptors/bl-timeout.interceptor.ts` — reads `BL_TIMEOUT_KEY`;
      passes through under limit; maps `TimeoutError` → `RequestTimeoutException`
      (use RxJS marble/fake timers).
- [x] **[U]** `modules/bl-jwt/bl-jwt.strategy.ts` — `validate()` returns the user when
      found; throws `BlUnauthorizedException` when `usersService` returns null; and
      refuses a resource-scoped token (`aud` present, string or array) without
      querying the database.
- [ ] **[U]** `decorators/bl-public.decorator.ts` — `blIsDecoratedWithPublic()` reads
      class-level and method-level metadata (mock `Reflector`).
- [ ] **[U]** `guards/bl-throttler-behind-proxy.guard.ts` — IP extraction from
      `req.ips[0]` vs fallback.
- [ ] **[U]** `modules/bl-request-context/bl-request-context.helper.ts` —
      `getLangHeader()`: supported lang passes through, unsupported → default.

---

## Phase 5 — config / naming transformations (pure strings)

Low urgency (rarely change) but pure and easy — good filler tasks.

- [ ] **[U]** `configs/bl-naming-strategy.class.ts` — `BlNamingStrategy`: entity →
      snake_case table/column names, FK/index/constraint naming.
- [ ] **[U]** `configs/bl-cors-config.class.ts` — `blGetCorsConfig()`: local →
      permissive regex; non-local → built origin regex list + header concatenation.
- [ ] **[U]** `utils/bl-response.helper.ts` — filename encoding, download vs preview
      `Content-Disposition`, cache headers (mock the `Response`).
- [ ] **[U]** `utils/bl-token.helper.ts` — `encodeToken`/`decodeToken` round-trip and
      the decode error path (light `jsonwebtoken` integration).

---

## Do NOT test

- Type/interface-only files: `bl-user.class.ts`, `bl-credentials.class.ts`,
  `bl-entity-with-id.entity.ts`, `bl-*.dto.ts`.
- Enums: `bl-user-category.enum.ts`, `bl-user-status.enum.ts`.
- Barrel/re-export files (`index.ts`, `public-api.ts`).
- Decorators that only wrap `SetMetadata`/`UseGuards` (`BlPublicSecure`, timeout
  decorator write side) — the read side is covered in Phase 4.
- Thin pass-throughs: `BlJwtService.generateToken()` (delegates to `JwtService.sign`),
  `BlParsePipe` (wraps `plainToClass`), `BlUploadedFile()` decorator.
- `bl-*.module.ts` registrations and infra services (`bl-db-backup.service.ts`,
  mail/storage clients) — those are integration concerns, not unit-testable logic.

---

## Suggested sequencing

1. Phase 0 once (config + reference test + Test Explorer entry).
2. Phase 1 pure utils — quick wins, establishes the pattern.
3. Phase 2 search builder — the intricate pure logic.
4. Phase 3 base service — protects every app service that extends it.
5. Phases 4–5 interleaved, as those areas change or bugs surface.

Rule of thumb: **one focused test per branch that matters** beats broad coverage of
getters/wrappers. If a test would only break on a rename, don't write it.
