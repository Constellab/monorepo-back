# The Space API is the single Authorization Server, and Resource Servers verify asymmetrically

Machine clients (AI clients over MCP, and the CLI) need tokens for endpoints in both the Space
API and the Community API. We decided there is **exactly one Authorization Server and it is
the Space API**: the Community API keeps its own browser login untouched, but stops issuing
MCP access tokens and becomes a Resource Server that only verifies them. Consequently, MCP
access tokens are signed with an **asymmetric key held by the Space API** and verified by
Resource Servers through a JWKS document, while each application keeps its own symmetric
secret for its own Session tokens.

## Considered options

**Which application issues.** The authorization server was built in the Community API, so
leaving it there was the cheapest option and it had already been exercised against a real
client. We moved it because the Community API is the dependent application: it holds no
credentials, does no two-factor authentication, and mirrors the user record under the Space
API's own user id — its login already calls the Space API to verify a password. Leaving the
issuer there would have made the smaller, dependent application the identity provider for the
larger one. A neutral third issuer host was also considered and deliberately deferred: it is
likely where this ends up once an aggregating gateway exists, and the decision to package the
server as a mountable library module is what keeps that move cheap. Running two authorization
servers was rejected outright — two issuers means clients register twice and users approve
twice, for one set of accounts.

**How Resource Servers verify.** Sharing one symmetric secret between the applications would
have worked with no key distribution at all. It was rejected because the same key signs both
Session tokens and MCP access tokens: any application holding it could mint a Session token
for any user and call the other application as them. Per-request token introspection was also
rejected — it would put a network round trip on every MCP call and make the Space API a
per-request dependency of the Community API rather than a startup one.

## Consequences

The issuer's URL is recorded by clients when they register, so relocating it later invalidates
existing registrations — this is not a decision that stays cheap to revisit.

Because there is one issuer, one of the two products always sends users to the other's login
page when approving a client. Connecting a client to the Community MCP will send the user to
the Space API login. This is the same account and the same password, but it is a visible
change and it is inherent to having a single Authorization Server rather than to choosing the
Space API.

Two signing algorithms now coexist. Every verification path must pin the algorithm it accepts:
a verifier that accepts both can be defeated by signing symmetrically with the published
public key.

The issuer has to know every Resource it issues for, including those it does not serve. A
Resource Server cannot opt itself in: it can point clients at the Space API, but the list of
audiences that may be signed belongs to the signer, and an unlisted one is refused at
`/authorize` with `invalid_target`. So each application added as a Resource Server also costs
an entry in the Space API's own configuration, coupling their deployments — the identifier is
compared byte for byte and the two applications read it from two independently set environment
variables. Nothing detects a mismatch before a user hits it.

Minting for a Resource grants nothing on the issuer's host: an entry of this kind publishes no
discovery document there and protects no endpoint there. Issuing a token and honouring one are
separate rights, and the code keeps them as two separate questions.
