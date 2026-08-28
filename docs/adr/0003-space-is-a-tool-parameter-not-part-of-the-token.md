# A Grant spans every Space, and the Space is named per tool call

A browser knows which Space it is in from the request origin, and the Space API resolves
membership and role from there. A machine client sends no origin, so the Space has to arrive
some other way. We decided that **a Grant spans every Space the user belongs to**, and that
**the Space is a required parameter on each tool call**, discovered through dedicated tools
rather than configured out of band. The MCP server holds no notion of a "current Space".

## Considered options

**Pinning one Space into the Grant** — the user chooses a Space at approval time and the token
carries it. Rejected because it means re-approving per Space, and because a client would have
to hold as many Grants as the user has Spaces to do anything across them.

**One Resource per Space**, with the Space in the audience. Rejected: it turns a static
Resource registry into a dynamic one, requires separate consent per Space, and makes discovery
documents multiply without bound.

**Out of band, via a request header or a URL path segment.** This was the design for a while
and was rejected late. A header is fixed per connection, so the model cannot honour "now use
the Gencovery space" within a conversation; it also depends on the client being able to set
custom headers at all, which was the project's largest unverified assumption. A path segment
avoids that but drags the Space into the request path, from which the expected audience is
derived — so it would have had to be normalised back out, one subtle step away from every
Space silently becoming its own Resource.

**Server-side session state** holding a selected Space. Rejected: the MCP servers are stateless
by design, which is what keeps additional HTTP consumers and the planned gateway simple, and a
remembered Space is a value that can drift from what the user believes is selected.

## Consequences

A Grant carries more authority than a browser session scoped to one origin, though not more
than the Session token already granted across the platform's wildcard domain. Narrowing it
later invalidates existing Grants, because tokens already issued carry the wider meaning — a
re-consent, not a migration.

The Space named by a caller is untrusted input chosen by a language model on every call. It
**selects**; the existing membership and role lookup **authorizes**. That check must live in
one shared place every tool passes through: a single tool that forgets it is a cross-tenant
read, and "every tool remembers" is not a property anyone can verify by reading.

The Space parameter is required rather than defaulted. A silent default would let the model
omit it and operate on a Space the user never confirmed, with nothing in the conversation
revealing which one was chosen. A separate tool returns the user's last-connected Space, so
the model can look it up and state it before acting.

An MCP server cannot prompt before it is called. The behaviour of establishing a Space up
front comes from the server's instructions and from space-specific tools failing usefully when
the parameter is absent — not from the server pushing anything to the user.
