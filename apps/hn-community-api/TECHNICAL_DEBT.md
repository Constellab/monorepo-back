# Technical Debt - hn-community-api

This document lists known technical debt items, ordered by priority within each batch:

- **Items 1–7** — identified during a code review (April 2026).
- **Items 8–14** — assumed v1 trade-offs from the MCP server + OAuth 2.1 implementation (July 2026). These were conscious shortcuts, not oversights; each one lists what triggers revisiting it.

---

## 1. Monolithic Brick Aggregate Service

**File:** `src/app/brick-aggregate/hn-brick-aggregate.service.ts` (~1540 lines, 18 injected dependencies)

**Problem:** This service handles too many responsibilities: brick CRUD, filtering, visibility checks, folder management, documentation management, technical doc handling, version management, co-author invitations, file operations, and permission checks. This violates the Single Responsibility Principle and makes it hard to test, maintain, and reason about.

**Suggested refactoring:**

- `HnBrickQueryService` — finding, filtering, listing bricks
- `HnBrickMutationService` — creating, editing, deleting bricks
- `HnBrickPermissionService` — access control and visibility checks
- `HnBrickDocStructureService` — folder/doc tree operations (move, reorder, path updates)
- `HnBrickTechnicalDocService` — technical documentation operations

**Risk:** High regression risk. Requires thorough testing after split.

---

## 2. N+1 Query Problems

**Locations:**

- `hn-brick-aggregate.service.ts:734-750` — `updateChildCompletePath()` runs one UPDATE per doc + recursive calls per subfolder. Deep hierarchies cause exponential queries.
- `hn-agent-aggregate.service.ts:296-305` — `getAllAgentsMap()` loops through agents and fetches versions one by one.
- `hn-tag-aggregate.service.ts:40-49` — tag key fetching without batch queries.

**Suggested fix:**

- Use batch UPDATE with `IN` clauses or TypeORM `createQueryBuilder` for folder path updates.
- Use `leftJoinAndSelect` or batch ID queries instead of looping with individual `find` calls.
- Consider a SQL recursive CTE for deep folder path recalculation.

---

## 3. Excessive Eager Loading

**Problem:** Almost all entities use `eager: true` on their `@ManyToOne` relations (createdBy, lastModifiedBy, space, brickMajorVersion, etc.). This means every query on any entity automatically JOINs and loads all related entities, even when they are not needed. Combined with `@OneToMany` eager loading (e.g., `HnBrick.brickUsers`), this causes:

- Unnecessary memory usage
- Slow queries with multiple JOINs
- Cascading eager loads (loading a brick loads its users, each user loads their data, etc.)

**Affected entities (non-exhaustive):**

- `HnBrick` — eagerly loads `brickUsers` (OneToMany), `createdBy`, `lastModifiedBy`, `space`
- `HnBrickMajorVersion` — eagerly loads `brick`
- `HnBrickVersion` — eagerly loads `brickMajorVersion`
- `HnFolder` — eagerly loads `brickMajorVersion`
- All like entities — eagerly load `likedBy` and target entity
- All comment entities — eagerly load `createdBy`

**Suggested fix:**

- Remove `eager: true` from entity definitions.
- Explicitly load relations where needed using `relations: [...]` option in `find` calls or `leftJoinAndSelect` in query builders.
- This is a large refactor: every `find`/`findOne` call that relies on implicit eager loading must be updated to explicitly request the relations it needs.

---

## 4. Rate limiting on auth endpoints — RESOLVED (July 2026)

**Files:** `src/hn-app.module.ts`, `apps/cn-space-api/src/cn-app.module.ts`,
`libs/back-core-lib/src/lib/decorators/bl-public.decorator.ts`, both auth controllers

This item used to read "no rate limiting", which was wrong: `@BlPublicSecure()` has always
applied `BlThrottlerBehindProxyGuard`. Three real defects sat underneath it.

**1. The window was 1000× too short.** `ttl: 60` with `@nestjs/throttler` ≥ v5, which
counts `ttl` in **milliseconds** — so 10 requests per 60ms (~166/s) instead of the intended
10 per minute. The commit of 2024-10-14 migrated the config to v5's `throttlers: [...]`
shape without converting the value that the same major version had redefined. Both apps.
Fixed: `ttl: 60_000`.

**2. Per-route overrides silently did nothing.** `BlPublicSecure({ limit, ttl })` built
`Throttle({ test: { … } })` with a hardcoded `test` key (carrying a `// TODO TO CHECK KEY`)
matching no throttler declared in `forRoot`, so the route quietly stayed on the global
limit. Fixed: the key is now `default`, which is what an unnamed `forRoot` throttler is
called. Verified on a running instance — `/auth/login` cuts off at 10, `/auth/refresh` at 60.

**3. Fixing (1) naively would have capped community logins globally.** `cn`'s
`external/check-credentials` and `external/check-2fa` are called server-to-server by
`HnSpaceAuthService`, so every community user shares one source IP — hn's server. At 10/min
that becomes a global ceiling on logins, and since `checkUserCredential` swallows the
failure into `{ status: 'ERROR' }`, users would have seen "wrong credentials". These two
routes now carry a flood ceiling (1000/min) instead; brute-force protection for those
credentials belongs on the caller's own login route, which is keyed on the real client IP.

**Limits now:** 60/min per IP globally, 10/min on the routes that verify a credential
(`login`, `login-2fa` in both apps), 1000/min on `cn`'s two `external/*` routes.

**Still open — deliberately not done here:** rate limiting at the reverse proxy
(nginx/CapRover) as the primary protection, with the application-level throttler as defense
in depth. Also, `cn`'s other `@BlPublicSecure()` routes (signup, password-forgotten,
reset-password, account activation/unlock, invitation codes) are still on the global
60/min; `password-forgotten` and `reset-password` in particular are credential-adjacent and
deserve the stricter limit.

---

## 5. Missing DTO Validation

**Problem:** Most DTOs lack `class-validator` decorators. User input is not validated for length, format, or content. This affects:

- `HnUserEditDetailDto` — no `@MaxLength`, `@IsUrl`, `@IsOptional`
- `HnCreateBrickDTO` — no validation on name, URLs, version format
- `HnEditBrickDTO` — credentials and URLs not validated
- Comment/story/tag creation DTOs — no content length limits

**Suggested approach:**

- Add `class-validator` decorators progressively, starting with endpoints exposed to external users.
- Prioritize: auth DTOs > brick creation/edit DTOs > content DTOs (comments, stories).
- Ensure `ValidationPipe` is enabled globally (check `main.ts`).

---

## 6. Config Variables Not Validated at Startup

**File:** `src/app/core/modules/core-config/hn-core-config.service.ts`

**Problem:** `HnCoreConfigService` retrieves config values via `configService.get()` without validating that required values are present or have valid formats at startup. Missing or malformed config (JWT secret, DB connection, S3 credentials) will cause unpredictable runtime failures instead of a clean startup error.

**Suggested fix:**

- Use NestJS `ConfigModule.forRoot()` with a Joi or `class-validator` validation schema.
- Alternatively, add an `onModuleInit()` method to `HnCoreConfigService` that checks all required config keys and throws a clear error if any are missing.

---

## 7. Missing Pagination on Internal Queries

**Locations:**

- `hn-agent-version.service.ts:103` — `find()` without limit
- `hn-brick.service.ts:44` — `find()` without limit
- `hn-partner.service.ts:39` — `find()` unbounded
- `hn-space.service.ts:17` — `find()` no limit
- `hn-story.service.ts:112, 613` — `find()` returns all records
- `hn-user.service.ts:152, 184` — `find()` without take/skip

**Problem:** These queries fetch all records without pagination. As data grows, they risk high memory usage and slow response times.

**Suggested fix:**

- Add `take` limits to internal queries that don't need all records.
- For admin/migration endpoints (`checkAllStatus`, `migrateTitlePaths`), consider streaming or batch processing instead of loading all records at once.
- Prioritize: public-facing endpoints first, then internal admin endpoints.

---

# MCP + OAuth 2.1 v1 trade-offs (July 2026)

**Context.** The app now exposes an MCP server for the community documentation (`POST /mcp/community-doc`, module `src/app/mcp-doc/`) protected by a general-purpose OAuth 2.1 authorization server (module `src/app/oauth/`: discovery, dynamic client registration, `/oauth/authorize`, `/oauth/token`, plus a reusable Resource Server guard). It reuses the existing Constellab login and JWT — OAuth is only the procedure for obtaining the token; the JWT remains the token format.

The design is deliberately **resource-agnostic**: the long-term goal is a federation of MCP servers (community doc, space doc, external bricks) behind an aggregator gateway MCP, all sharing this one authorization server. Token audiences (`aud`) are what isolate the resources from each other.

The items below are the v1 shortcuts. Item 8 is the only one that can break in production in a surprising way.

---

## 8. In-memory OAuth stores break under multiple replicas — RESOLVED

**Files:** `src/app/oauth/hn-oauth-code.store.ts`, `src/app/oauth/hn-oauth-client.store.ts`, `libs/back-core-lib/src/lib/modules/bl-redis/`

**Was:** both stores were plain in-process `Map`s. Running more than one replica behind the CapRover load balancer meant an authorization code minted by instance A was unknown to instance B, and a `client_id` registered on A did not exist on B — an **intermittent** `invalid_grant` / `invalid_client` depending on which replica served each leg of the flow, invisible in single-instance testing. A separate leak: expired codes were only evaluated on consume, so a code created and never redeemed was retained forever, driven by an endpoint reachable by any registered client.

**Fixed by** a new `BlRedisModule` in `back-core-lib` (there was no injectable Redis client before, only BullMQ's internal connection) and rewriting both stores on top of it:

- `ioredis` is now an explicit dependency instead of being used transitively through `bullmq`.
- Connection details come from `getTransportModuleConfig()` — the same `QUEUE_SERVICE_*` variables BullMQ already needs, so **nothing new to configure** in any environment. Keys are namespaced with a `hn:` prefix so sharing one server with another app is safe.
- Codes: `SET … EX 60` + `GETDEL`. `GETDEL` is atomic (Redis >= 6.2, deployed version is 8.8), which is what preserves single-use semantics under concurrent replicas — a `GET` then `DEL` would let two replicas both read the same code.
- Clients: 30-day TTL rather than unbounded. Registrations are disposable, so this also bounds what an unauthenticated caller can accumulate.
- TTL expiry is now the server's job, which closes the retained-codes leak.

Consumers depend on the narrow `BlRedisStore` abstraction (`get` / `setWithTtl` / `getAndDelete`), not on the ioredis-backed class, which is what makes the stores unit-testable against `hn-oauth-redis.mock.ts`.

**Cost paid:** the store methods became `async`, which propagated to `HnClientLookup.find`, `hnValidateAuthorizeParams`, and the three OAuth endpoints. No HTTP contract changed.

**Verification:** 98 unit tests (single-use, TTL expiry, corrupt-entry handling). Note that the mock cannot catch a wrong ioredis command or argument order, so the command contract — `SET … EX`, atomic `GETDEL`, `keyPrefix`, server-side expiry — was additionally checked against a live server.

---

## 9. Audience separation is one-way — RESOLVED

**File:** `libs/back-core-lib/src/lib/modules/bl-jwt/bl-jwt.strategy.ts`

**Was:** access tokens minted for an MCP resource carry `aud = <resource URI>`, and `HnMcpResourceGuard` requires that `aud` to match the endpoint being called — which blocked one direction (a session JWT, having no `aud`, cannot be used against the MCP). The reverse was open: the global auth path ignored `aud`, so an MCP access token was accepted as a **full session credential on every other API route**, for its whole 7-day lifetime.

**Fixed by:** `BlJwtStrategy.validate()` now refuses any token carrying an `aud` claim, before the user lookup. Unconditional rather than opt-in, so a future application minting resource-scoped tokens is protected by default. Safe because `aud` is only ever set by `BlJwtService.generateTokenForAudience()`, whose sole caller is `/oauth/token`: session tokens, `cli-auth` tokens and `BlTokenHelper.encodeToken()` carry no audience, so no existing flow is affected — including in `cn-space-api`, which mints no `aud` at all. Covered by `bl-jwt.strategy.spec.ts`.

Isolation is now bidirectional: MCP tokens work only against their resource, session tokens only against the rest of the API.

---

## 10. Long-lived access tokens with no revocation — RESOLVED (August 2026)

**Files:** `src/app/oauth/hn-oauth.controller.ts`, `src/app/oauth/hn-oauth.config.ts`,
`libs/back-core-lib/src/lib/modules/bl-oauth/bl-oauth-metadata.builder.ts`,
`libs/back-core-lib/src/lib/modules/bl-refresh-token/`, `src/app/auth/refresh-token/`

**Was:** MCP access tokens inherited `HN_JWT_CONFIG.legacyTokenDurationInSeconds`
(**7 days**), with no token store, no `/revoke` endpoint and no refresh token. A leaked
token stayed valid for a week with no way to invalidate it. Shortening the lifetime on
its own was not an option: with no refresh grant, Claude would have had to re-authorize
on every expiry.

**Fixed by** the refresh-token table introduced for session auth — not a Redis store as
originally sketched. It already carried `kind: 'session' | 'oauth'`, `clientId` and
`resource`, so the OAuth surface reuses the same row, the same atomic rotation and the
same purge cron:

- MCP access tokens are down to **1 hour** (`MCP_ACCESS_TOKEN_DURATION_SECONDS`,
  defaulting to `HN_JWT_CONFIG.defaultMcpAccessTokenDurationInSeconds`).
- `/oauth/token` issues an `oauth`-kind refresh token with the code, bound to
  `client_id` and `resource`.
- `grant_type=refresh_token` renews it. **The audience is read from the stored row and
  never from the request** — that is what prevents a client granted one MCP from
  widening to another at renewal. A `resource` repeated in the body (RFC 8707 §2.2) is
  honoured only as an assertion and rejected on mismatch, rather than ignored.
- `POST /oauth/revoke` (RFC 7009), always 200, scoped to `kind: 'oauth'` **and** the
  calling `client_id` so this unauthenticated endpoint cannot end a browser session or
  another client's session.
- Discovery now advertises `refresh_token` and `revocation_endpoint`; without them a
  client ignores both capabilities. The DCR response's `grant_types` matches.
- `/oauth/token` and `/oauth/revoke` moved from `@BlPublic()` to `@BlPublicSecure()`:
  they were the last unauthenticated routes with no throttler at all.

**One defect fixed in passing:** `expires_in` and the signature lifetime were separate
expressions that agreed only because both happened to read the same constant. They now
come from a single getter (`HnOAuthConfig.mcpAccessTokenDurationInSeconds`) — a client
trusting an `expires_in` longer than the signature stops refreshing in time.

**Remaining, by design:** an access token in flight survives revocation for up to an
hour. That is inherent to a self-contained JWT and is exactly why the lifetime is short
(item 12 does not change this either).

**Verification:** 43 unit tests over the token/revoke endpoints and the rotation. Not
yet exercised end-to-end against a live client — the test that matters is Claude
connected for more than an hour, refreshing silently.

---

## 11. No consent screen (DCR is restricted, registration itself stays open)

**Files:** `src/app/oauth/hn-oauth.controller.ts` (`register()`), `libs/back-core-lib/src/lib/modules/bl-oauth/bl-oauth-redirect-uri.validator.ts`

**Problem:** `POST /oauth/register` is public and unauthenticated (RFC 7591 allows this), so anyone can register an OAuth client. Combined with the deliberate absence of a consent screen, a third party can initiate an authorization flow against this server; a logged-in user would then be redirected back with a code without ever being asked to approve the client.

**Mitigated by two changes:**

- Item 9 shrank the blast radius: a code obtained this way now yields a token scoped to the MCP resource — documentation read access — not a full API session.
- The redirect target is now constrained at registration (`blRedirectUriAllowed`): non-loopback URIs must be `https` and match `OAUTH_ALLOWED_REDIRECT_URIS` exactly (scheme, host, port, path, query — no wildcards, no subdomain matching), while loopback is accepted on any port and path per RFC 8252 §7.3. That removes the remote exfiltration vector: an attacker can still register a client, but cannot have the code delivered to a host they control. DCR stays usable by first-party clients, which need it to connect on their own.

**What remains:** no consent screen, so a first-party-looking client can still obtain a code for a logged-in user without an explicit approval step. Acceptable while clients are first-party and trusted (Claude); not acceptable once third-party clients are a real possibility.

**Remaining fix:** add a consent screen — front-end work, note `lab-front` already has an `/oauth-consent` page using a `?redirect_uri=` convention, with no back-end counterpart in this repo yet. Optionally also require an initial access token on `/oauth/register`.

**Deployment note:** `OAUTH_ALLOWED_REDIRECT_URIS` is a required config value. It is set in `hn-dev.env` / `hn-test.env`; **it must be added to the CapRover environment for pre-prod and prod**, otherwise `/oauth/register` fails on the missing-config error. An empty value is valid and means loopback-only.

**Triggered by:** opening the server to non-first-party OAuth clients.

---

## 12. HS256 signing prevents splitting resource servers out of this app

**File:** `libs/back-core-lib/src/lib/modules/bl-jwt/bl-jwt.module.ts`

**Problem:** JWTs are signed with a **symmetric** secret (HS256). This is fine today because the MCP resource server lives in the same application as the authorization server and can validate tokens with the same secret. But any resource server running in a **different process** (the planned aggregator gateway, or an MCP for another domain) would need to know the signing secret in order to validate tokens — which is exactly what asymmetric signing exists to avoid.

**Suggested fix:** migrate to RS256 (or ES256) and expose a JWKS endpoint (`/.well-known/jwks.json`), so resource servers validate with the public key only. This touches the existing login and `cli-auth` flows too, so it is a prerequisite task for the federation rather than a local change.

**Triggered by:** the first MCP resource server or gateway deployed outside this application.

---

## 13. Discovery exposes a single protected resource — RESOLVED (August 2026)

**Files:** `src/app/oauth/hn-oauth.controller.ts`,
`libs/back-core-lib/src/lib/modules/bl-oauth/bl-oauth-resource-url.util.ts`,
`src/app/oauth/hn-mcp-resource.guard.ts`

**Was:** `GET /.well-known/oauth-protected-resource` always returned metadata for
`config.resources[0]`. Correct with one MCP resource, wrong with two: RFC 9728 expects one
document **per resource**, and a client calling the space MCP would have been told to
request a community-doc audience.

**Fixed by** serving the per-resource form (RFC 9728 §3.1 inserts the well-known segment
**between the host and the resource path**, so the document for
`https://host/mcp/community-doc` lives at
`https://host/.well-known/oauth-protected-resource/mcp/community-doc`). An unregistered
path is a 404, not a document for a resource we do not serve.

The URL convention and its inverse live in `bl-oauth-resource-url.util.ts`, shared with
the guard and tested on their own — the two directions have to agree, and they are used
from opposite ends of the flow.

**One change the original note got wrong:** it claimed `HnMcpResourceGuard` needed no
change. It did. The guard emitted a fixed `resource_metadata` URL, so every MCP pointed
at the same document and per-resource discovery had no entry point. It now advertises the
document of the resource actually being called.

**Note:** the authorization server document (`/.well-known/oauth-authorization-server`) is
global and stays as is — there is only one authorization server. The pathless protected
resource document also stays, answering for the primary resource: clients that predate the
split ask for it, and a discovery document that 404s makes a client abandon the flow.

**Verification:** 26 unit tests — the URL util (both directions, round-trip), the two
controller routes, and `hn-mcp-resource.guard.spec.ts`, which the guard had been missing
entirely despite validating signature and audience on every MCP call.

---

## 14. MCP documentation search matches raw rich-text JSON

**File:** `src/app/mcp-doc/hn-mcp-doc.service.ts`

**Problem:** `search()` runs a SQL `LIKE` against `documentation.content`, which stores the `TeRichText` document as a JSON blob. Recall is acceptable, but the query also matches JSON keys and inline HTML markup, so precision is limited and irrelevant results appear. (The _snippet_ returned to the caller is fine — it is extracted from the markdown rendering, not from the raw JSON.)

**Suggested fix options:**

- A MySQL FULLTEXT index on an extracted plain-text column, maintained when a doc is saved.
- Or reuse the existing RAG pipeline (`src/app/ragflow-chatbot/`), which already indexes this documentation and would give semantic search — worth investigating before building a second retrieval mechanism.
