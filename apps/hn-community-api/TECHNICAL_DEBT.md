# Technical Debt - hn-community-api

This document lists known technical debt items identified during a code review (April 2026). Items are ordered by priority.

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

## 4. No Rate Limiting on Auth Endpoints

**File:** `src/app/auth/hn-auth.controller.ts`

**Problem:** Login and authentication endpoints have no rate limiting. This allows brute-force attacks on credentials.

**Suggested fix options:**

- **NestJS Throttler** (`@nestjs/throttler`): add `@Throttle()` decorator on auth endpoints. Simple to implement, application-level.
- **Reverse proxy level**: configure rate limiting in nginx/CapRover. More robust, survives app restarts.
- **Recommended:** both. Throttler as defense-in-depth, reverse proxy as primary protection.

**Example with Throttler:**

```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } })
@Post('login')
async login(...) { }
```

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
