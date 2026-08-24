# The MCP writes documentation by operations, on a server-side definition of a valid document

The Community documentation is EditorJS rich text whose modification history is **derived**
from a block-by-block comparison of the old and the new content, matched **by id**. Two write
paths reach it: the `gws community` Python CLI, which pushes a whole document, and — from this
point on — MCP tools driven by a language model.

Three decisions were taken together, because each is only safe given the others.

## The MCP writes by operations; the CLI keeps writing whole documents

An MCP edit is a list of `update` / `insert` / `delete` / `move` operations, each naming a
`blockId` the model has read. Untouched blocks are reused as they are, id included, and the ids
of inserted blocks are minted by the server.

The CLI is unchanged: it writes the document entire, and that is right for it. It pushes a file
a human edited in a repository, where whole-file replacement is the operation the user actually
performed, and the ids it sends come from the file it previously pulled.

A model has neither property. Handed a whole-document endpoint, its natural move is to return
the document with regenerated ids — which is not a bad edit but an invisible one: the derived
history reads "everything deleted, everything recreated", and the page's real history is gone
with no error anywhere. Operations remove the possibility rather than warn about it. They also
make a batch group as one user action, and let the model describe its changes against the state
it read instead of simulating intermediate ones.

**Considered and rejected:** accepting a whole document from the MCP and diffing it
server-side. It works exactly as long as the model preserves ids, and fails silently the first
time it does not — the failure mode we are trying to eliminate, kept and merely made less
likely. **Also rejected:** having the CLI move to operations for symmetry. It would be a
protocol change for every installed CLI, to solve a problem the CLI does not have.

## The definition of a valid document lives on the server, not in the CLI

Validation and sanitization of that rich text existed only in the Python CLI. The server built
the object and stored it as given, so neither the UI nor the MCP benefited — and these pages are
public, which makes uncontrolled inline HTML a stored XSS rather than a formatting bug.

One definition now lives server-side, in the text-editor library beside the markdown
conversion, and applies to every write path at once. It cleans and reports what it removed,
rather than refusing: a refusal breaks the editor for a user who did nothing wrong, and silence
would let a model believe it wrote what it wrote.

This is what makes the MCP's write path affordable at all. The alternative — validating in each
writer — means the MCP re-implementing rules the CLI already has, in another language, and the
two drifting on the first change. It has a real cost: the CLI may now be refused content it
used to accept, wherever its own rules were laxer.

## Reading the MCP requires a Community account

The documentation is public on the web, and the read tools shipped `BlPublic()` +
`BlResourceGuard` — a verified token, and nobody in the request context. Every MCP call now
resolves the token's `sub` to an `HnUser` before any tool runs, reads included.

A token whose subject has no `HnUser` gets **403**, not 401: the token is intact and was minted
for this Resource, so a client told to re-authenticate would come back with the same token and
loop. And no account is created on that path — the access token carries `sub` and nothing else a
user record needs (name, category, language, photo), so a row built here would be a half-empty
one the Space API's own synchronization would then have to repair.

**Considered and rejected:** resolving the user only in the write tools, leaving reads
anonymous. It keeps a public thing public, and costs one thing we are not willing to spend: the
identity resolution stops being a property of the endpoint and becomes a step each new tool has
to remember. A write tool that forgets it fails with "No user in the context" at best; the same
omission on a path that has a fallback user is worse. One place, before the transport dispatches
anything, is verifiable by reading the module.

The practical consequence is narrow: a caller reaching this endpoint holds a Grant approved by a
named Constellab user, so an unsynchronized account is the rare case — a Constellab user who has
never visited the Community site — and it now gets a message saying exactly that instead of an
empty result or a 500 from deeper in.
