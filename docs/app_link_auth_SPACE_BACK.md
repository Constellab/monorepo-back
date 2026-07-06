# Space backend changes — stable app links

Companion to `app_link_auth_plan.md` (gws_core backend) and `app_link_auth_FRONT.md` (fronts). This
doc covers only the **space backend**. The space is the _credential authority_ in this design; the lab
is the _authorization server_ (issues codes/JWTs, runs the gateway, owns the session). See the gws_core
plan for the lab side.

Guiding constraint (from the user): **the lab should be as autonomous from the space as possible** — the
space verifies credentials, nothing more. The space does NOT issue lab sessions, JWTs, or run the app
gateway.

---

## What the space already does (baseline)

- `POST /space-api/share/{token}/generate-user-access-token` (lab's `space_controller.py:202`) — the
  space calls the **lab** to get an access URL for a shared resource, then the space front opens it.
  Note: the **lab** mints the code today; the space triggers it and receives the URL. That stays true.
- The space verifies passwords / 2FA for lab login via the lab's `/login` → `check_credentials` /
  `check_2_fa` calls (the lab calls the space, not the reverse).

Most of the app-link work is lab-side. The space backend changes are small and mostly about the
**auth hop** and the **open URL now being a gateway URL**.

---

## S1. Nothing required for the app _open_ URL itself (it stays lab-minted)

- The change from "resource-open page URL" to "gateway URL" happens **in the lab backend**
  (`generate_user_access_token_for_space_link` / `get_space_link` — gws_core plan step 5a). The space
  still calls the same `generate-user-access-token` endpoint and receives an `access_url`; that URL is
  now a lab gateway URL instead of a resource-open URL.
- **Space backend impact:** none for URL generation — it already just relays what the lab returns. The
  only associated change is **space front** navigating instead of iframing (FRONT doc B1).
- ✅ Confirms lab autonomy: the space doesn't learn app hosts, tokens, or readiness.

## S2. Auth hop — ONLY if the space hosts the auth page (Option A, optional)

The gateway redirects unidentified visitors to an auth page with a `redirect_uri`. Two hosting choices
(gws_core plan §3·c). **Recommended default = lab-hosted (Option B) → the space backend does nothing
here.** Detail the space-hosted variant only if/when you choose it:

- **If lab-hosted (recommended, default):** the lab reuses its own `/login` (which already calls the
  space's `check_credentials`). **No new space endpoint. No space backend change.** This is the most
  autonomous option and covers labs reached without a space.
- **If space-hosted (optional, later, for SSO / no extra prompt):** the space would need:
  - An **authorize endpoint** (a page/route) that accepts `redirect_uri` (+ app identity), ensures the
    user is signed into the space (reuse existing space auth), performs the app-access check the space
    owns, then redirects to the lab with a **one-time code**.
  - The code must be one the **lab** can consume. Since the lab owns `UniqueCodeService`, the space
    obtains the code by calling a lab endpoint (like today's `generate-user-access-token`), NOT by
    minting its own. Keeps the lab autonomous and the code lab-side.
  - **redirect_uri allow-list:** the space must only redirect back to allow-listed lab origins.

> Because the lab's gateway calls one swappable `auth_page_url(redirect_uri=…)`, you can ship lab-hosted
> with zero space work and add the space-hosted page later with no lab-gateway change.

## S3. Authorization — space owns "may this user open this app"

- Decision (from design): **the space decides, the lab trusts a valid code.** The space performs the
  app-access check **before** it asks the lab to mint the access code / issues the auth-hop code.
- **Space backend impact:** ensure the existing share/permission check the space already runs for
  "open shared resource" also covers the app case. If apps are just shared resources in the space's
  model, this is likely already covered — verify. No new lab-side permission logic is added.

## S4. Single-use code — space must fetch fresh each open

- The lab's access code is now **single-use** (gws_core plan step 2b, decided). The space backend/front
  must call `generate-user-access-token` **right before each open** and never reuse a previous
  `access_url`. Confirmed the space already fetches fresh — this is a _do-not-regress_ note, not new work.
- ⚠️ Rollout: the old `ShareLinkSpaceAccess` token was reusable for ~1h. Ensure no space code path caches
  the access URL across opens before the lab flips to single-use.

## S5. Reflex access token (unrelated, do-not-touch)

- The space already serves a "reflex access token" to the lab (`get_reflex_access_token`, used by
  `ReflexProcess` for enterprise apps). This is a **separate** mechanism from user auth — not affected
  by this work. Listed only to avoid confusion during review.

---

## Space backend summary

| Item                                        | Space backend change?                                                      |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| App open URL becomes a gateway URL (S1)     | **No** — lab-side; space relays as before                                  |
| Auth hop, lab-hosted (S2, default)          | **No**                                                                     |
| Auth hop, space-hosted (S2, optional later) | Yes — an authorize route + redirect_uri allow-list + call lab to mint code |
| Space owns app-access check (S3)            | Verify existing share check covers apps; likely no new code                |
| Single-use code, fetch fresh (S4)           | **No new code** — do-not-regress                                           |
| Reflex access token (S5)                    | **No** — unrelated                                                         |

**Bottom line:** with the recommended lab-hosted auth page, the space backend needs **essentially no
changes** — only the space _front_ flips from iframe to navigation (FRONT doc B1), and you verify S3/S4.
The space stays a pure credential authority; the lab remains autonomous. Space backend work only appears
if you later choose the optional space-hosted SSO auth page (S2).

---

## Verified against code (2026-07-03)

Confirmed the "no changes needed" conclusion holds in the current space backend. `getResourceAccess`
(`apps/cn-space-api/src/app/cn-lab-folder-aggregate/cn-lab-folder-aggregate.service.ts:207`) is the single
path the space uses to open a shared resource/app in a lab, reached via `GET /resources/:id` and
`GET /resources/:id/redirect` (`cn-resources.controller.ts:16-28`).

- **S1 (gateway URL passes through):** it relays `userAccess.access_url` verbatim into
  `CnResourceAccessDTO.accessUrl` (`cn-lab-folder-aggregate.service.ts:227-232`) — the lab can swap the
  resource-open URL for a gateway URL with no space change.
- **S3 (space checks permission before minting):** `resourceAggregateService.findResource` runs
  `securityService.getAndCheckAuthorizationForFindOne(resourceId)` before the resource/lab is returned
  (`cn-resource-aggregate.service.ts:55-57`), i.e. before the lab is asked to mint a code.
- **S4 (fresh single-use code each open):** both controller routes call `getResourceAccess` live per
  request and it calls the lab each time; nothing caches or reuses a previous `access_url`.

These invariants are now locked by unit tests:
`cn-lab-folder-aggregate.service.spec.ts` and `cn-resource-aggregate.service.spec.ts` (run with
`npm run cn-space-api:test`). No feature code was added — the space backend needs none for the
recommended lab-hosted path.
