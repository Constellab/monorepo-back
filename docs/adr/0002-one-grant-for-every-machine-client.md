# Every protected surface is a Resource, and every machine client uses one grant

We need machine access in four combinations — an AI client against either application's MCP,
and the CLI against either application's ordinary API — and the obvious reading is that a
terminal needs a different mechanism from a browser-based client. It does not. We decided
that **all four use the same authorization code + PKCE grant**, differing only in where the
authorization code is delivered, and that **every protected surface is a Resource identified
by its URL** and named in the `aud` of the tokens that may reach it. A browser session token,
which carries no `aud`, is the one remaining exception.

## Considered options

**A separate device flow for the CLI.** Rejected as the default. The redirect URI policy
already accepts loopback on any port and path (RFC 8252 §7.3), so a CLI that can open a
browser and bind a port uses the existing flow with no server-side change at all. Device flow
(RFC 8628) remains the right answer for a genuinely headless client — an SSH session, a
container, CI — and is deferred until such a client exists. Building it first would have meant
two flows each exercised once, instead of one flow exercised by every client.

**A CLI-specific token shape.** Rejected. The CLI calls the same endpoints a browser calls,
so the tempting shortcut was to hand it a session token with no `aud`. That would make any
token obtained through the authorization server equivalent to a full browser login, which is
precisely what audience binding exists to prevent.

## Consequences

`BlJwtStrategy` currently rejects **any** token carrying an `aud`, which was correct while
every audience named an MCP endpoint. Once an API is itself a Resource, that rule must narrow
rather than relax: accept a token with no `aud`, or one whose `aud` is this API's own resource
identifier, and reject every other audience. The protection it was written for — an MCP token
must not work as a session token — survives unchanged.

The Resource registry and the resource-server library must therefore not assume a Resource is
an MCP endpoint. Only MCP Resources ship initially; API Resources are registered when the CLI
lands.

A client needing several Resources holds several Grants, because a refresh token row binds to
exactly one `resource` and that is what stops a renewal from widening scope. One pass through
the consent screen may cover several Resources, so the user approves once even though several
Grants result.

**Amendment, with the consent screen.** A Grant is its own row (`oauth_grant`), not the refresh
token row: a refresh token is one live _session_ of a Grant, rotates on every renewal and is
gone as soon as the client stops renewing, whereas the approval is the thing the user gave and
only the user takes back. Both carry exactly one `resource`, so the rule above is unchanged —
a renewal still reads its audience from the row it rotates. What the separate row adds is that
approving twice refreshes one Grant instead of accumulating two, that an authorization request
for an already-approved client and Resource needs no second prompt, and that revoking a token
can end the approval as well as the session.
