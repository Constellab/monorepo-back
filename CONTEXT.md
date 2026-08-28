# Constellab Backend

The monorepo behind Constellab: the platform, the community site, and the machine clients
(AI clients over MCP, and the CLI) that authenticate against them. This glossary fixes the
words we use for identity and for machine access, because both are split across two
applications and the same word has meant different things in each.

## Language

### Applications

**Space API**:
The Constellab platform application. Owns credentials, two-factor authentication, and the
canonical user record, and hosts every **Space**.
_Avoid_: cn, the space app, the main app, and **Space** unqualified — that is the tenant, not
the application. This distinction is the reason this entry exists.

**Community API**:
The public documentation and community application. Holds a mirror of the user record, keyed
by the Space API's user id, and never verifies a credential itself.
_Avoid_: hn, the community app, the doc site.

### Tenancy

**Space**:
A tenant hosted by the Space API — the thing a user belongs to with a role, and the owner of
the data a request touches. Every request that reaches tenant-owned data names exactly one,
and naming one is a separate question from being allowed to reach it.
_Avoid_: workspace, organization, team, tenant, project.

### Identity and machine access

**Authorization Server**:
The single component that issues tokens to machine clients. There is exactly one, and it is
the Space API. Its URL is its identity — clients record it at registration, so it cannot be
relocated silently.
_Avoid_: auth server, identity provider, SSO, issuer (except as the JWT claim `iss`).

**Resource Server**:
An application that validates access tokens and serves protected endpoints, but never mints a
token. The Community API is one; the Space API is also one for its own endpoints.
_Avoid_: API server, backend, consumer.

**Resource**:
One protected surface, identified by its absolute URL, which doubles as the audience of the
tokens that may reach it. Each has its own discovery document, served by the one application
that serves the Resource. A **Space** is never part of a Resource's identity — one MCP endpoint
is one Resource however many Spaces it can reach.
_Avoid_: scope, service, audience (except as the JWT claim `aud`), MCP server.

**Remote Resource**:
A Resource the **Authorization Server** mints tokens for and does not serve — a Resource of
another application, named there by full URL. It has to be declared on the issuing side:
minting for a Resource and honouring a token for one are separate rights, and the issuer is the
only one that can say which audiences it will sign. It publishes no discovery document on the
issuer's host and no endpoint there is protected by it.
_Avoid_: external resource, third-party resource, delegated resource.

**Grant**:
A user's standing authorization for one client to reach one **Resource**. It is pinned when
the user approves it and is never widened afterwards — in particular, the **Resource** is read
from stored state, never from the renewing request. It is a record of its own, outliving every
**Refresh token** issued under it: a refresh token is one live session of a Grant, while the
Grant is the approval itself, which only the user takes back. There is at most one per user,
client and **Resource**, so approving a second time refreshes it rather than adding another.
_Avoid_: permission, authorization, consent (which is the act of approving, not the result).

**Consent**:
The act of a user being shown what a client is asking for and approving or refusing it. It
happens once per client and **Resource**, may cover several **Resources** in one pass, and
produces one **Grant** each. Refusing produces nothing, and so does walking away.
_Avoid_: authorization (the flow is the thing being authorized, not this step), permission
prompt, opt-in.

**Pending authorization**:
An authorization request that has been validated and is waiting for the user to answer,
identified by a `consent_id`. It is a question, not an answer: it holds everything the request
established — client, redirect target, verifier challenge, **Resources** — so that nothing is
re-read from the browser once the user decides, and it expires on its own if they never do.
_Avoid_: pending grant (nothing is granted yet), consent request, session.

### Tokens

**Session token**:
The short-lived JWT that authenticates a human's browser against the application that minted
it. Carries no `aud`. Each application issues its own, and they are not interchangeable.
_Avoid_: access token (ambiguous — see below), auth token, JWT.

**MCP access token**:
The short-lived JWT that authenticates a machine client against one **Resource**. Always
carries an `aud`, which is what makes it structurally impossible to present as a **Session
token**, and vice versa.
_Avoid_: access token (unqualified), bearer token, API token.

**Refresh token**:
An opaque, single-use, rotating secret stored as a row, exchanged for a new token pair. Its
`kind` records which surface it belongs to — a browser session or a **Grant** — and the two
can never be exchanged across that boundary.
_Avoid_: renewal token, long-lived token.

**CLI authorization**:
The flow by which a terminal obtains a token by asking the user to approve it in a browser.
It uses the same grant as any other machine client, differing only in that the authorization
code comes back to a loopback address. Not a separate mechanism.
_Avoid_: CLI login, device login, cli-auth (the current module name, whose bespoke
implementation this term deliberately does not describe).
