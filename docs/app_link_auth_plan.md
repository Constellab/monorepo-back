# Implementation plan — stable app links, steps 1–3

Covers build-order steps 1–3 from the rev-3 proposal: JWT identity, delete the in-memory
space-access store, and the launcher gateway with the Model-B auth hop. Steps 4–5 (app-side
code exchange, point the space at the gateway) are scoped at the end but not detailed.

## Hard constraints (verified in code)

- **`gws_reflex_base` / `gws_streamlit_base` must NOT import `gws_core`** (they run in virtual-env
  apps without it — see both `CLAUDE.md`). So the app side can never call `JWTService` /
  `UniqueCodeService` directly. It must relay a code/token to a **lab endpoint** that does the check.
  This is why the handoff is a _code the app exchanges_, not a JWT the app validates locally.
- `_user_access_tokens` carries **two literal sentinel keys** the app looks up by string:
  `DEV_MODE_USER_ACCESS_TOKEN_KEY = "dev_mode_token"` and
  `SYSTEM_USER_ACCESS_TOKEN_KEY = "system_user_token"`
  (app_process.py:83,89; mirrored in both base states). Any change must preserve this contract or
  update all four sites together.
- `UniqueCodeService` is **in-memory + single-process** (dict, destructive read). Fine for a ~60s
  single-use handoff on a single-process lab; noted as a scaling caveat, out of scope here.
- Keep the current async/iframe path working throughout — every step is additive.

---

## Step 1 — App identity via a single-use code exchanged for a JWT

**Goal:** remove the persisted/in-memory `user_access_token → user_id` map as the _identity_
mechanism; the app authenticates by exchanging a one-time code for a JWT at a lab endpoint.
Keep the two sentinel keys for dev/system fallback.

### 1a. New lab endpoint: exchange code → JWT

- Add `POST /apps/exchange-code` (core_app, **no auth dependency** — the code _is_ the credential).
  - Body: `{ app_id, code }`.
  - Impl: `code_obj = UniqueCodeService.check_code(code)` (consumes it), then
    `AppsManager.user_has_access_to_app(app_id, ...)` is replaced by a check that the resolved
    `code_obj.user_id` is allowed on `app_id` (see 1c), then return
    `{ user_access_token: JWTService.create_jwt(user_id) }`.
  - Errors: invalid/expired code → 403 (`InvalidUniqueCodeException` already does this).
- Rationale: the app can't run `check_code` itself (no gws_core), so this is the "app relays code to
  lab" endpoint from the design. Response is a JWT the app then presents on API calls, validated by
  the existing `check_user_access_token`.

### 1b. Launch side mints a code, not a map entry

- In `app_process.py`, the AUTHENTICATED branch of `get_app_full_url` (line ~403) currently does
  `user_access_token = self._add_user(user.id)` and puts it in the URL as `gws_user_access_token`.
  Change to: mint a `UniqueCodeService.generate_code(user.id, {"app_id": ...}, 60)` and put it in the
  URL as `gws_code`.
- Keep `gws_token` (the process gate) as-is for now — it's orthogonal and step 3/4 territory.

### 1c. Where the "may this user open this app" check lives

- Today: implicit — being in `_user_access_tokens` _is_ the grant. Once we stop storing per-user
  entries, we need an explicit check. For step 1, keep it minimal: the code was minted by a lab path
  that already authenticated the user (view / gateway), so exchange = proof of a prior authorized
  launch. Defer a durable `ShareLink`-based grant to the gateway work (step 3) where external users
  first appear. **Do not add a new table.**

### 1d. Preserve dev/system sentinels

- `DEV_MODE_USER_ACCESS_TOKEN_KEY` / `SYSTEM_USER_ACCESS_TOKEN_KEY` stay as literal-key entries in
  the app config `user_access_tokens` dict (they are NOT per-user identity — they're opt-in fallbacks).
  Keep `_add_user(..., <sentinel>)` writing those two keys and keep `user_access_tokens` in the config
  DTO for them. Only the _real user_ identity moves to the code→JWT path.
- Net: `user_access_tokens` shrinks to {dev?, system?} sentinels only; the map is no longer the
  restart-fragile per-user store.

### 1e. Tests

- `test_app_*` (find existing app process tests): exchange happy-path, expired code, wrong app_id,
  reused code (second exchange → 403), dev/system sentinels still resolve.

**Ships alone?** Yes — the app can be taught to accept `gws_code` in step 4; until then, step 1 can
land the endpoint + code minting behind the existing `gws_user_access_token` fallback (emit both for
one release), so nothing breaks.

---

## Step 2 — Delete `ShareLinkSpaceAccess`, back the space handoff with a code

**Goal:** remove the buggy in-memory access list; reuse `UniqueCodeService`.

### 2a. Rewrite `generate_user_access_token_for_space_link` (share_link_service.py:153)

- Replace `ShareLinkSpaceAccessService.generate_share_link_space_access(...)` with
  `code = UniqueCodeService.generate_code(user.id, {"share_link_id": share_link.id}, ACCESS_DURATION)`.
- `access_url = share_link.get_space_link(code)` (unchanged shape; the value is now a unique code).

### 2b. Rewrite the verify side (authorization_service.py:174, `auth_share_link_from_token`)

- Replace `ShareLinkSpaceAccessService.find_by_token_and_check_validity(user_access_token, share_link.id)`
  with `code_obj = UniqueCodeService.check_code(user_access_token)` +
  assert `code_obj.obj["share_link_id"] == share_link.id`, then resolve `code_obj.user_id`.
- **Single-use is intended (Option A — decided).** `check_code` consumes the code on first read; the
  token works exactly once. This is safe because the **space front always fetches a fresh access URL
  via `generate-user-access-token` right before every open** (confirmed) — it never reuses or reloads a
  stale URL. Matches the OAuth authorization-code model; no `peek_code`, no extra code.
- ⚠️ **Rollout note:** this only holds once the space is on the "always fetch fresh" behavior. Since the
  current `ShareLinkSpaceAccess` token was reusable-for-1h, verify no _older_ space client relies on
  reusing the URL before shipping (or gate behind a short overlap where both stores are accepted).

### 2c. Delete the class

- Remove `share_link_space_access.py` and its two imports (authorization_service.py:10,
  share_link_service.py:8). This removes the `user_id != user_id` prune bug outright.

### 2d. Tests

- Space link happy-path (generate → open), expired code, wrong share_link_id, reused code.

**Ships alone?** Yes — self-contained to the space share path. Independent of step 1.

---

## Step 3 — Launcher gateway route + Model-B auth hop

**Goal:** one stable, bookmarkable, iframe-free entrypoint that cold-starts and hands off.

### 3a. App-key resolver

- `AppKeyResolver.resolve(app_key)`: try resource-model-id first; else match a custom-subdomain
  (reuse the existing uniqueness field/validation in app_resource.py). Return the `AppResource`.

### 3b. `GET /open/app/{app_key}` (core_app, response_model=None)

- Resolve user (Model B): `AuthorizationService.check_unique_code(code).get_user()` if `?code=` present,
  else `AuthorizationService.current_user(request)` (lab session cookie). **No `log_user`, no cookie set.**
- If user is None → `RedirectResponse(auth_page_url(redirect_uri=str(request.url)))`.
  - `auth_page_url` starts **lab-hosted** (reuse `/login` → `check_credentials`). Space-hosted is a
    later swap of this one function.
  - **Open-redirect guard:** validate `redirect_uri` is one of our own `/open/app/…` routes.
- Authorize: check the user may open this app (ShareLink grant for external; implicit for from-lab).
- Start async: `AppsManager.create_or_get_app_async(build_instance(resource_model, user))`.
- Return the interstitial (SPA route or standalone — see 3d).

### 3c. `GET /open/app/{app_key}/ready`

- Resolve user (session or a short re-auth); confirm process RUNNING via `find_app_by_resource_model_id`.
- Mint handoff code #2: `UniqueCodeService.generate_code(user.id, {"app_id": ...}, 60)`.
- `RedirectResponse(app_url.host_url + "?gws_code=" + code)`.

### 3d. Interstitial

- Default: 302 to the Angular SPA route that reuses the existing "Building…/Starting…" progress
  component, polling `GET /apps/process/{token}/status`; on RUNNING calls `/open/app/{key}/ready`.
- Alternative: a tiny standalone lab HTML+JS page (only if the fast/dumb cold-open path is wanted).

### 3e. Tests

- From-lab (session present) → no auth hop, straight to interstitial → ready → redirect.
- External no session → redirect to auth page; return with code → resolves → starts.
- Bad redirect_uri rejected. Stopped app cold-starts. Unknown app_key → 404.

**Ships alone?** Yes for the from-lab + lab-hosted-auth path. External/space path fully lights up once
step 4 (app reads `gws_code`) and step 5 (space points at the gateway) land.

---

## Sequencing & risk

- Steps 1 and 2 are independent and can go in either order / in parallel.
- Step 3 depends on nothing but is only end-to-end useful once step 4 teaches the app to read
  `gws_code` and exchange it (step 1's endpoint). Land 1 → 4 → 3 for a demoable external flow, or
  1 → 2 → 3 → 4 → 5 for the full sequence.
- 2b single-use code: **resolved (Option A)** — space always fetches a fresh URL, so single-use is
  safe. Only residual risk is an _older_ space client reusing a URL during rollout (see 2b rollout note).
- Keep `gws_user_access_token` emitted alongside `gws_code` for one release (steps 1/4) so old app
  builds keep working during rollout.

---

## Step 4 — App bases read `gws_code`, exchange it for a JWT (gws_core-free)

**Goal:** the app authenticates by relaying `gws_code` to the lab's `/apps/exchange-code` (step 1a)
and holding the returned JWT. No `gws_core` import anywhere in the base modules.

### Verified facts this relies on

- The base modules already reach the lab over plain HTTP with `requests` + an env-provided URL:
  `gws_reflex_download_service.py` reads `GWS_REFLEX_API_URL` (set by the reflex launcher) and calls
  the backend with `requests`. Reuse that exact pattern — do **not** import gws_core.
- `GWS_APP_TOKEN` (the process gate) is already an env var in the app (app_process.py:416). Use it as
  a bearer on the exchange call so a random caller can't spend codes against the endpoint.
- Streamlit stores auth in `st.session_state["__gws_user_id__"] / ["__gws_user_access_token__"]`;
  Reflex stores `authenticated_user_id` + `user_access_token` on the state and surfaces
  `ReflexUserAuthInfo(app_id, user_access_token)` to components. The JWT becomes the new
  `user_access_token` value in both — components are unaffected (same field).

### 4a. Shared exchange helper (duplicated per base module — they can't share code)

- Add a tiny helper in **each** base module (`gws_reflex_base`, `gws_streamlit_base`), pure `requests`:
  `exchange_code_for_jwt(app_id, code) -> str | None`:
  - `POST {LAB_API_URL}/apps/exchange-code` with `{app_id, code}` and header
    `Authorization: Bearer {GWS_APP_TOKEN}`.
  - Return the JWT on 200; `None` on 403/failure.
  - LAB_API_URL: reflex already has `GWS_REFLEX_API_URL`; for streamlit, add the lab API URL to the
    env in `streamlit_process._get_base_env` (mirror how reflex sets `GWS_REFLEX_API_URL`). Both come
    from `AppProcess` / `Settings.get_lab_api_url()` on the launch side (gws_core side — allowed there).

### 4b. Reflex: `_check_user_token` (reflex_main_state_base.py:202)

- Before the current `gws_user_access_token` lookup, add: if `gws_code` in query params →
  `jwt = exchange_code_for_jwt(self.get_app_id(), code)`; if `jwt`, set `self.user_access_token = jwt`
  and **redirect to the same URL without `gws_code`** (Reflex `rx.redirect`, or history replace via a
  small client script) so the code doesn't linger.
- The JWT is then what `_get_user_access_token()` returns; identity resolution changes from
  "look up user_access_token in the map" to "the token IS a JWT" (see 4d).

### 4c. Streamlit: `_check_authentication` (streamlit_main_state_base.py:186)

- Same shape: if `st.query_params.get("gws_code")` → exchange → store JWT as the access token in
  `st.session_state["__gws_user_access_token__"]`, set `__gws_user_id__`, then
  `del st.query_params["gws_code"]` (Streamlit supports mutating query_params) to scrub the URL.

### 4d. Identity resolution — the map lookup goes away for real users

- Today both bases resolve identity by `user_access_tokens.get(token)` (a dict lookup). With a JWT,
  the app can't decode it (no gws_core / no secret). Two options:
  1. **The exchange endpoint returns `{user_access_token: jwt, user_id}`** — the app stores both and
     uses `user_id` directly for display; the JWT is only carried to the API. **Simplest; recommended.**
  2. App calls a lab "whoami" with the JWT. More round-trips; skip.
- So 1a's response becomes `{ user_access_token, user_id }`. The `user_access_tokens` map in the config
  is then used **only** for the two sentinels (dev/system) — see 4e.

### 4e. Dev + system fallbacks stay map-based

- Dev mode: still uses `DEV_MODE_USER_ACCESS_TOKEN_KEY` (no code exchange in dev; `is_dev_mode()`
  branch is untouched).
- `fallback_to_system_user`: still reads `SYSTEM_USER_ACCESS_TOKEN_KEY` from the config map. These two
  sentinels remain literal-key entries; only the real-user path uses code→JWT. Keep both base states'
  sentinel lookups (reflex :301, streamlit :324) exactly as-is.

### 4f. Backward-compat window

- Keep the old `gws_user_access_token` branch as a fallback in both bases for one release, so an app
  launched by an old lab (URL still carries `gws_user_access_token`) keeps working, and a new lab that
  emits both (step 1b) works with an old app build. Remove the fallback once both sides are rolled.

### 4g. Tests

- Reflex + streamlit: `gws_code` present → exchanged → user resolved → URL scrubbed. Invalid code →
  behaves like today's invalid token (PUBLIC = anonymous, AUTHENTICATED = blocked). Dev/system
  sentinels unaffected. Old `gws_user_access_token` path still works during the compat window.

**Ships alone?** Needs 1a (the endpoint) live. With 1a + 4, the in-datalab and gateway flows are
end-to-end for real users.

---

## Step 5 — Point the space at the gateway (retire the double iframe)

**Goal:** the space opens the app via a single navigation to `/open/app/{key}` instead of the nested
datalab-resource-page-in-an-iframe.

### 5a. New space-facing open URL

- `share_link.get_space_link` (share_link.py:140) currently returns
  `FrontService().get_resource_open_space_url(token, user_access_token)` (the datalab `/open/resource`
  page + `gws_user_access_token` + `hide_header`). Add a gateway variant, e.g.
  `FrontService().get_app_gateway_url(app_key, code)` →
  `{lab_url}/open/app/{app_key}?code={code}` (front_service.py OPEN URLS block).
- In `generate_user_access_token_for_space_link` (share_link_service.py:154), for a share link whose
  resource **is an AppResource**, return the gateway URL (carrying the step-2 code as `?code=`);
  for non-app resources keep the existing resource-open URL.
  - Detect app-ness: `ResourceModel.get_by_id(share_link.entity_id)` → is it an `AppResource` subtype?
    (reuse `ResourceModel.select_by_type_and_sub_types(AppResource)` logic / an `isinstance` on the
    loaded resource.)

### 5b. Gateway accepts the space's code as Model-B `?code=`

- This is exactly step 3b's `?code=` branch: `AuthorizationService.check_unique_code(code)`. The code
  minted in step 2a already carries `{"share_link_id": ...}`; for the gateway path we only need
  `user_id`, so no extra work — the same code resolves the user. (If you want the gateway to _also_
  re-assert the share-link grant, check `obj["share_link_id"]` maps to this app.)

### 5c. Space side (space repo, not gws_core)

- The space calls `POST /space-api/share/{token}/generate-user-access-token` (space_controller.py:202)
  and today iframes the returned `access_url`. Change the space to **navigate** (top-level) to the
  returned URL instead of nesting it in an iframe. Since 5a now returns a gateway URL for apps, the
  space gets a single-navigation, iframe-free open for free.
- ⚠️ Cross-repo: coordinate the gws_core release (5a/5b) with the space change (5c). Until the space
  stops iframing, the gateway URL still _works_ inside an iframe (it's just a normal page), so 5a/5b
  can ship first without breaking the space.

### 5d. Tests

- App share link → `generate_user_access_token_for_space_link` returns a gateway URL with a code.
- Non-app resource share link → unchanged resource-open URL.
- Hitting the gateway URL with the space code → resolves user → starts → hands off.

**Ships alone?** 5a/5b ship on gws_core independently (backward-compatible: gateway URL works even if
still iframed). 5c is a separate space release that flips to top-level navigation.

---

## Cross-repo & rollout summary

- **gws_core only:** steps 1, 2, 3, 4, 5a, 5b.
- **space repo:** 5c (flip iframe → navigation). Optional later: space-hosted auth page (§3·c) —
  swap `auth_page_url` target; no gateway change.
- **Compat windows:** emit `gws_user_access_token` + `gws_code` together (1b/4f) for one release;
  keep gateway-URL-works-in-iframe until 5c lands.

## Out of scope (future)

- Durable `ShareLink`-based app grant model (only needed when external users can self-open an app they
  weren't explicitly launched into — beyond the space/datalab entry points covered here).
- `UniqueCodeService` multi-process/replicated store (needed only if the lab becomes multi-worker).
- Space-hosted auth page as the default (currently the optional §3·c swap).
