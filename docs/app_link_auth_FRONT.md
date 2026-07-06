# Front-end changes — stable app links (lab SPA + space front)

Companion to `app_link_auth_plan.md` (gws_core backend). This doc covers only the **front-end**
work: the lab's Angular SPA and the space front. It does **not** cover gws_core backend or the space
backend (see `app_link_auth_SPACE_BACK.md`).

Context: the app is opened through a stable lab route `GET /open/app/{app_key}` that authenticates the
user, cold-starts the app, shows progress, then redirects into the app. No iframe. See the gws_core
plan for the backend contract.

---

## A. Lab Angular SPA

### A1. Interstitial "starting…" page (the progress screen)

**Why:** the gateway starts the app async and needs a page to show progress while it boots
(up to ~120s for a Reflex build). This replaces the role the resource-detail panel plays today.

- **Route:** a full-page Angular route, e.g. `/open/app/:appKey` (a real navigable route, reachable
  directly from a link — NOT a modal/panel inside another page).
- **Behavior:**
  1. On load, the lab backend has already kicked off the async start and told the page which
     process/token to watch (passed in the redirect / page bootstrap).
  2. Poll `GET /{core-api}/apps/process/{token}/status` (this route already exists) every ~1s.
  3. Render `status_text` verbatim — the same strings shown today: "Building app (it may take a
     while)…", "Starting app…", "Waiting for app to be ready…". **Reuse the existing progress
     component from the resource-detail panel** — same look, nothing new to design.
  4. On `status == RUNNING`: navigate (full-page) to `GET /open/app/{appKey}/ready` (backend mints the
     handoff code and 302s into the app). Do **not** try to build the app URL in the front.
  5. On `STOPPED` / error: show `status_text` + a **Retry** button (re-hits `/open/app/{appKey}`).
- **Must work as a standalone navigation target:** a user (or the space) may land here from just a
  link, with the datalab not otherwise open. Ensure the route doesn't depend on prior in-app state.

  > Alternative considered: a tiny standalone HTML+JS page served by the lab backend instead of an
  > Angular route. Only choose that if the SPA boot time on cold-open is a problem, or you want the
  > flow independent of the SPA's own login/session bootstrap. Default = reuse the SPA route + its
  > existing progress UI.

### A2. Lab-hosted auth page participation (OAuth hop)

**Why:** when the gateway can't identify the visitor, it redirects to the lab login page with a
`redirect_uri`; after login the flow returns to the gateway.

- The lab **already has** a login screen backed by `/login` + `/login-2fa`. The only front change:
  the login page must **honor a `redirect_uri` query param** and, on successful login, navigate back
  to it (instead of the default post-login landing).
- **Security:** the front must only redirect to a `redirect_uri` that is a same-origin `/open/app/…`
  URL (the backend also enforces this — belt and suspenders). Never redirect to an arbitrary URL.
- No new page — this is a small enhancement to the existing login flow.

### A3. "Open app" entry points inside the datalab (optional consolidation)

**Why:** today the resource page embeds the app in an iframe after polling. You may keep that as the
in-datalab experience, OR route "Open app" through the new gateway for one consistent path.

- **Minimum:** add an "Open app (new tab / full page)" action on the app-resource page that navigates
  to `/open/app/{appKey}`. This gives datalab users the iframe-free, bookmarkable open immediately.
- **Optional later:** replace the embedded-iframe panel entirely with the gateway navigation. Not
  required for the feature; decide based on whether you still want the app embedded in the datalab UI.
- From the datalab the user already has a lab session, so the gateway skips the auth hop — this is
  just a navigation.

### A4. Bookmarkable / favorite link

- The `/open/app/{appKey}` URL is stable (backed by the resource id or a custom slug). Surface it as a
  copyable "shareable link" on the app-resource page so users can bookmark / favorite it. The link
  self-serves: auth hop if needed → cold-start → open.

---

## B. Space front

### B1. Stop iframing the app; navigate to the returned URL

**Why:** today the space embeds the app via a nested iframe (space iframe → datalab resource-open page
→ app iframe). The client whose company blocks iframes can't use this.

- The space front already calls the space backend to get an `access_url` for a shared app, then
  **iframes** it. Change: **navigate top-level** (e.g. `window.location` / open in a new tab) to that
  `access_url` instead of embedding it in an iframe.
- After the backend change (see `app_link_auth_SPACE_BACK.md`), that `access_url` is a lab gateway
  URL (`/open/app/{key}?code=…`) — a normal page that runs the auth/cold-start/handoff itself. The
  space front does not need to know anything about app hosts, tokens, or readiness.
- **Fetch fresh each open:** the space must request a new `access_url` right before every open (the
  code in it is single-use — see the gws_core plan step 2b). Do not cache or reuse a previous
  `access_url`.

### B2. Loading affordance (optional)

- Because the gateway shows its own "starting…" page, the space front doesn't need its own progress
  UI. If desired, show a brief "Opening app…" state until the top-level navigation takes over.

### B3. Iframe fallback during rollout (optional)

- The gateway URL also works _inside_ an iframe (it's a normal page). If a staged rollout is wanted,
  the space can keep iframing the new URL first, then flip to top-level navigation — the iframe-blocked
  client only benefits once B1 (navigation) ships.

---

## Ordering / dependencies

- **A1 (interstitial) + A2 (redirect_uri on login)** are the core lab-front deliverables — required for
  any external/space open to complete. Land with the gateway (gws_core step 3).
- **A3/A4** are datalab-UX niceties — independent, ship anytime after the gateway.
- **B1** depends on the space backend returning a gateway URL (SPACE_BACK doc) — coordinate that release.
- The gateway URL works in an iframe, so the lab front (A1/A2) and space backend can ship before the
  space front flips to navigation (B1), without breaking the current experience.
