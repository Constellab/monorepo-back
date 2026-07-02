# hn-community-api — test roadmap

A phased, per-module checklist for building the regression suite. It follows the
same strategy as cn-space-api: **E2E through the controller** for workflows,
**unit tests** for authorization and pure logic. Priority order optimizes for
**core content workflows first** (agents, bricks); external-dependency-heavy flows
(lab API, object storage, mail) come later with all boundaries mocked.

Legend: **[E2E]** = `test/*.e2e.spec.ts` (real HTTP + DB) · **[U]** = unit (`*.spec.ts`, mocked deps)

Status today: ✅ auth E2E (`hn-auth.e2e.spec.ts`) + `HnCommunitySecurity` unit (18 tests)
are done (reference templates). Test harness (`HnTestE2EHelper`, `hn-test.module.ts`,
`test-credentials.ts`) mirrors cn-space-api.

Domain note: this is a **community / documentation** platform — the core entities are
**agents**, **bricks**, **stories**, **community apps**, and **tags**, most with a
DRAFT→PUBLISHED versioning state machine and **creator / co-author** authorization.

---

## Phase 0 — foundation (done / finish first)

- [x] **[E2E]** `hn-auth` — login sets Authorization cookie; unknown email; protected-route access / 401.
- [x] **[U]** `hn-community-security.service` — creator / co-author / admin / space-membership checks.
- [ ] **Test data factory** — helper to create a space + a second non-admin user +
      memberships (and a published brick, since agents depend on bricks) via the
      app's services/endpoints, reused by every E2E suite below.
- [ ] **Second-user login** — extend the seed/helper so E2E can act as a non-creator
      /non-admin (needed for every 403 / "not creator" assertion).

---

## Phase 1 — core content workflows

The daily-driver domains. Each E2E suite covers: happy path, 401 (no token),
403 (not creator/co-author/admin), 404 (missing), 400 (validation) where relevant.

### agent-aggregate

- [ ] **[E2E]** `hn-agent.e2e.spec.ts` — create agent (→ agent + first version +
      brick dependencies, in a transaction); list/get; **publish version** (DRAFT→
      PUBLISHED, updates `latestPublishVersion`); update style. Assert a non-creator
      gets 403 on edit/publish.
- [ ] **[U]** `agent-aggregate/security/hn-agent.security.ts` — `assertCanEdit` /
      `assertIsCreator` / `assertCanView` / `isCreatorOrCoAuthor` (pass + throw per role,
      admin bypass, co-author allowed).
- [ ] **[U]** `agent-version/hn-agent-version.service.ts` — the publish/state logic if
      it branches beyond a thin repo call.

### brick-aggregate

- [ ] **[E2E]** `hn-brick.e2e.spec.ts` — create brick, create version, publish,
      documentation CRUD, folder nesting, visibility toggle (PUBLIC/PRIVATE/PROTECTED).
      Non-creator edit → 403. (Largest aggregate, 1500+ lines — split the E2E by
      concern: brick CRUD, versioning, documentation.)
- [ ] **[U]** `brick-aggregate/security/hn-brick.security.ts` — edit/view authz matrix.

### story

- [ ] **[E2E]** `hn-story.e2e.spec.ts` — create story, add/remove co-author, edit,
      delete. Non-creator (non-co-author, non-admin) → 403.
- [ ] **[U]** `story/security/hn-story.security.ts` — `assertCanEdit` /
      `isCreatorOrCoAuthor`, including the **admin bypass** (`if (user.isAdmin()) return`).

### co-authorship (cross-cutting workflow)

- [ ] **[E2E]** co-author invite → accept → verify access flow (on agents; mirrors on
      bricks/stories). Assert an invited-but-not-accepted user still gets 403.

---

## Phase 2 — authorization hardening (unit, cheap, high value)

Silent authz regressions are the scariest — fast pure-logic tests, bank them early.

- [ ] **[U]** `community-app-aggregate/security/hn-community-app.security.ts` —
      `assertCanEdit` / `assertCanView`.
- [ ] **[U]** `tag-aggregate/security/hn-tag.security.ts` — edit/view authz.
- [ ] **[U]** Guards: - `hn-jwt-auth.guard.ts` — `@Public()` bypass + auth-context set (mock Reflector). - `hn-is-admin.guard.ts` — `@IsAdmin()` gate + `user.isAdmin()`. - `hn-space-auth.guard.ts` — `X-Api-Key` validation against config. - `hn-lab-auth.guard.ts` — lab API-key verification via `HnExternalSpaceApiService`
      (mock it); optional-user path (`@HnLabGuard()`).

---

## Phase 3 — data-integrity / destructive flows

Bugs here lose data, so cover them once the happy paths are locked.

- [ ] **[E2E]** agent version deletion — assert brick dependencies are removed,
      `agent.latestPublishVersion` resets when the published version is deleted, and
      the "minimum 1 version" rule is enforced.
- [ ] **[E2E]** agent deletion — all versions, brick dependencies, co-authors cleaned up.
- [ ] **[E2E]** story / community-app deletion — cascade to co-authors, comments, likes.
- [ ] **[E2E]** user deletion (in `users/hn-user.service.ts`) — assert authored content /
      co-authorships / memberships resolve with no orphans, if such a flow exists.

---

## Phase 4 — pure-logic helpers (unit)

No DB, no app module — direct instantiation. High ROI, very low maintenance.

- [ ] **[U]** `agent-version/hn-agent-version-migrator.class.ts` —
      `migrateAgentVersionFile()`: each schema-version transformation, and an
      already-current file (no-op) case. (Called straight from the controller.)
- [ ] **[U]** `core/utils/hn-markdown.helper.ts` — parse/generate round-trips, edge cases.
- [ ] **[U]** `core/utils/hn-zip.helper.ts` — markdown→ZIP structure/formatting.
- [ ] **[U]** `core/utils/hn-typing-name.class.ts` — name generation/validation branches.

---

## Phase 5 — external boundaries (mock the clients)

Test the **orchestration/error handling**, not the real integrations. Mock at the
service boundary.

- [ ] **[U]** `core/service/hn-external-space-api.service.ts` — `verifyLabApiKey`,
      `verifyLabApiKeyNoUser`, `checkLabBrickAccess`, `checkUser`: success path,
      not-authorized path, and HTTP-error propagation (mock `BlExternalApiService`/HTTP).
- [ ] **[E2E]** a thin lab-authenticated slice (a route behind `HnLabAuthGuard`) with
      `HnExternalSpaceApiService` mocked, to lock the API-key contract.
- [ ] **[U/E2E]** file aggregates — upload/delete with `BlObjectStorageService` mocked;
      assert storage cleanup is invoked on delete (spy), not real S3.
- [ ] **Mail / queue** — for co-author invites / resets, assert the mail/queue job is
      enqueued (spy on the BullMQ/mail service), don't send real mail.

---

## Cross-cutting (do alongside, not a phase)

- [ ] **CI**: add a MySQL service so E2E runs in CI; gate E2E on DB availability.
      Unit tests run anywhere — wire those in first for immediate value.
- [ ] **Error-shape assertions**: standardize checking the exception/error body so 4xx
      responses are asserted by code+message, not just status.
- [ ] **Event side-effects**: for aggregates emitting events (EventEmitter2 / listeners
      like `hn-agent.listener.ts`), assert the event is emitted (spy) rather than
      chasing async listeners in E2E.

---

## Suggested sequencing

1. Finish Phase 0 (factory + second user + a seeded published brick) — unblocks
   agent tests and every permission test.
2. Phase 1 agents → bricks → stories → co-authorship (the core content workflows).
3. Interleave Phase 2 authz units (fast wins) while Phase 1 E2E lands.
4. Phase 3 destructive flows once happy paths are green.
5. Phase 4 pure helpers anytime (independent, no ordering).
6. Phase 5 external boundaries last.

Rule of thumb per module: **one E2E happy-path + the 403/404 it must enforce** beats
five unit tests on thin delegators. Add unit tests only where there's real branching
(security services, version migrator, state machines).
