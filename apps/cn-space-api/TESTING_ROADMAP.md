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
- [ ] **Test data factory** — a small helper to create a space + a second non-admin
      user + memberships via the app's services/endpoints, reused by every E2E
      suite below. Do this before Phase 1 so suites don't hand-roll fixtures.
- [ ] **Second-user login** — extend the seed/helper so E2E can act as a
      non-admin (needed for every 403/permission assertion).

---

## Phase 1 — core user-facing workflows

The daily-driver domains. Each E2E suite covers: happy path, 401 (no token),
403 (wrong role/not a member), 404 (missing), 400 (validation) where relevant.

### cn-spaces

- [ ] **[E2E]** `cn-spaces.e2e.spec.ts` — create enterprise space; `my-spaces`;
      `current-info`; rename; add/remove user; change role; deactivate/activate;
      delete. Assert a non-member gets 403 on space-scoped routes.
- [ ] **[U]** `cn-space-user.service` — membership lookups / role transitions if
      they contain branching beyond thin repo calls.

### cn-users / cn-user-accounts

- [ ] **[E2E]** account lifecycle: signup → activation → profile edit; login lock
      after N failed attempts (`FAILED_LOGIN_LOCK`), and unlock path.
- [ ] **[U]** `cn-user-accounts.service` — status transitions, lock/unlock logic.

### cn-groups

- [ ] **[E2E]** `cn-groups.e2e.spec.ts` — create team, add/remove members, list
      teams by space, delete. 403 for non-space-admin.
- [ ] **[U]** `cn-groups.security` — `checkAuthorizationToGetTeam` /
      `...FindAllTeamBySpace` / `...CreateTeam` (pass + throw per role).

### cn-folders-aggregate (folders / documents / notes)

- [ ] **[E2E]** `cn-folders.e2e.spec.ts` — create root folder, nest a folder,
      create a document/note, move, rename, delete (cascade). Cross-user access
      denied.
- [ ] **[U]** `cn-folders-security.service` + `cn-folders-security-user` —
      `checkAuthorizationToCreateRootFolder` / `checkFindAllBySpace` and the
      per-user access checks (viewer vs editor vs admin).

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
