# cn-space-api — test roadmap

A phased, per-module checklist for building the regression suite. It follows the
strategy in [TESTING.md](TESTING.md): **E2E through the controller** for workflows,
**unit tests** for authorization and pure logic. Priority order optimizes for
**core user-facing workflows first**; labs (large + external-dependency heavy)
come later with all boundaries (cloud/SSH/external API) mocked.

Legend: **[E2E]** = `test/*.e2e.spec.ts` (real HTTP + DB) · **[U]** = unit (`*.spec.ts`, mocked deps)

Status today: ✅ auth E2E + `CnSpaceAggregateSecurity` unit are done (reference templates).

---

## Phase 0 — foundation (done / finish first)

- [x] **[E2E]** `cn-auth` — login, bad/unknown credentials, protected-route access.
- [x] **[U]** `cn-space-aggregate-security` — role/ownership branches.
- [x] **Test data factory** — `test/cn-test-fixture.factory.ts` seeds (via
      repositories) a bucket chain + an enterprise space owned by admin + a
      second non-admin user + memberships. Enabled per-suite with
      `initAppModule({ seedFixtures: true })`; results on `helper.fixtures`.
- [x] **Second-user login** — `helper.loginAsSecondUser()` +
      `helper.setCurrentSpaceDomain(domain)` (sets the `local-space` cookie the
      guard reads) so E2E can act as a non-admin and drive 403/permission checks.

---

## Phase 1 — core user-facing workflows

The daily-driver domains. Each E2E suite covers: happy path, 401 (no token),
403 (wrong role/not a member), 404 (missing), 400 (validation) where relevant.

### cn-spaces

- [x] **[E2E]** `cn-spaces.e2e.spec.ts` — `my-spaces`; `current-info`; find by
      id; rename; add/remove user; change role; deactivate/activate; delete.
      Asserts 401 (no token) and 403 for a non-member on space-scoped routes.
      (Enterprise space comes from the fixture factory rather than the
      cloud-dependent create endpoint.)
- [ ] **[U]** `cn-space-user.service` — membership lookups / role transitions if
      they contain branching beyond thin repo calls. _(deferred: current methods
      are thin repo calls; the branching lives in `cn-space-aggregate-security`,
      already covered.)_

### cn-users / cn-user-accounts

- [x] **[E2E]** `cn-user-accounts.e2e.spec.ts` — admin lock → locked user
      refused login → admin unlock → login again; user edits own profile; 401
      when a non-admin tries to lock. _(signup→activation deferred: signup
      provisions a personal space via a real cloud region lookup.)_
- [x] **[U]** `cn-user-accounts.service` — `lockUser`/`unlockUser` status
      transitions + admin guard + invalid-state rejections.

### cn-groups

- [x] **[E2E]** `cn-groups.e2e.spec.ts` — create team in the current space, list
      teams by space, get, rename, delete; 401 with no token.
- [x] **[U]** `cn-groups.security` — `checkAuthorizationToGetTeam` /
      `getAndCheckAuthorizationToUpdateTeam` / `...FindAllTeamBySpace` /
      `...CreateTeam` (pass + throw per role).

### cn-folders-aggregate (folders / documents / notes)

- [x] **[E2E]** `cn-folders.e2e.spec.ts` — create root folder (space default
      storage), find, rename, list, cross-user 403, move-to-trash. _(nesting +
      document/note flows deferred to a later pass.)_
- [x] **[U]** `cn-folders-security.service` (trash guard + role threshold) +
      `cn-folders-security-user` (`checkCreateRootFolder` / `checkFindAllBySpace`
      and per-user viewer/editor/owner access checks).

---

## Phase 2 — authorization hardening (unit, cheap, high value)

Silent authz regressions are the scariest even though workflows come first — these
are fast pure-logic tests, so bank them early once Phase 1 is moving.

- [ ] **[U]** `cn-object-storages.security` — `checkAuthorizationForSpaceCredentials`,
      `...ForGenericCredentials`, `...ToGetBucket`, `...ToModifyEntity`.
- [ ] **[U]** `cn-groups.security` (if not already covered in Phase 1).
- [ ] **[U]** `cn-cloud-provider.security` — modify/get authorization.
- [ ] **[U]** `cn-config-entity.security` + `cn-abstract-security.layer` — the base
      security layer other services extend (test once, here).
- [ ] **[U]** Guards: `cn-user-category-guard.service` (role gate),
      `cn-enterprise-license.guard` (license gate),
      `cn-jwt-auth.guard` (cookie extraction + `@BlPublic` bypass),
      `cn-hierarchy-object-token-guard.service` (token-based folder access).

---

## Phase 3 — data-integrity / destructive flows

Bugs here lose data, so cover them once the happy paths are locked.

- [ ] **[E2E]** `cn-user-deletion-aggregate` — delete a user and assert the cascade
      (owned groups, memberships, folders/documents) resolves correctly and
      leaves no orphans. This is a multi-step aggregate — the highest-value E2E
      in this phase.
- [ ] **[E2E]** space deletion — assert child objects (buckets, documents,
      memberships) are cleaned up / detached as designed.
- [ ] **[E2E]** folder/hierarchy deletion — cascade + the hierarchy-object-token
      access path.

---

## Phase 4 — pure-logic calculators (unit)

No DB, no app module — direct instantiation. High ROI, very low maintenance.

- [ ] **[U]** `cn-server-price.service` + `cn-storage-price.service` — pricing math
      across tiers/regions/durations; boundary values.
- [ ] **[U]** `cn-user-2-f-a.service` — code generation/validation, expiry, wrong-code
      rejection (mock the store).
- [ ] **[U]** `cn-stats.service` / `cn-stats.class` + `cn-lab-stats-aggregate` —
      aggregation/rollup math.
- [ ] **[U]** `cn-lab-migration-*` — version selection / ordering of the real
      migrations (2.0.0 → 2.13.0). (Rewrite against the current API — the old spec
      tested removed methods and was deleted.)

---

## Phase 5 — labs (logic only, boundaries mocked)

Largest domain, most external coupling. Mock `CnLabManagerService`,
`CnLabConfigurerService`, cloud providers (OVH/Azure/GCP), SSH, and the external
lab API. Test the **orchestration/state logic**, not the infra.

- [ ] **[U]** `cn-labs.security` — the full `checkAuthorization*` matrix
      (create/update/find/delete/restore, admin vs user).
- [ ] **[U]** `cn-labs.service` — lab status state machine / `CnAbstractWithStatusService`
      transitions.
- [ ] **[U]** `cn-lab-aggregate.service` — start/stop/configure orchestration with
      all boundary clients mocked; assert the sequence of calls + error handling,
      not real provisioning. Split by concern rather than one giant spec.
- [ ] **[E2E]** a thin lab-admin CRUD slice (create/list/find/delete) with cloud
      calls mocked at the provider factory, to lock the API contract.

---

## Cross-cutting (do alongside, not a phase)

- [ ] **CI**: add a MySQL service so E2E runs in CI; gate E2E on DB availability.
      Unit tests already run anywhere — wire those into CI first for immediate value.
- [ ] **Error-shape assertions**: standardize checking the exception/error body
      (via `CnCoreExceptionHandlerFilter`) so 4xx responses are asserted by
      code+message, not just status.
- [ ] **Event side-effects**: for aggregates that emit events (EventEmitter2),
      assert the event is emitted (spy) rather than chasing async listeners in E2E.

---

## Suggested sequencing

1. Finish Phase 0 (factory + second user) — unblocks all permission tests.
2. Phase 1 spaces → folders → groups → users (the daily workflows).
3. Interleave Phase 2 authz units (fast wins) while Phase 1 E2E lands.
4. Phase 3 destructive flows once happy paths are green.
5. Phase 4 calculators anytime (independent, no ordering).
6. Phase 5 labs last.

Rule of thumb per module: **one E2E happy-path + the 403/404 it must enforce**
beats five unit tests on thin delegators. Add unit tests only where there's real
branching (security services, calculators, state machines).
