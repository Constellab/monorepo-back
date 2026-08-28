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

## A write locks on a revision it read, and the lock is optional

An edit names the state it was prepared against: a **revision**, a short hash of the document's
blocks, computed at read time and sent back on write. A stale one is refused with a 409. It is
derived from the content on every read, never stored, so there is no column to keep in step with
the blocks.

The lock is **optional**, and that is the whole reason nothing breaks: a request without a
revision keeps the historical last-write-wins, which is what every caller written before this did.
A caller adopts the lock when it has something to lose.

The something is concrete. Two write paths reach one document, and only one of them is driven by
a human watching the page. Without the lock, a CLI push overwrites a concurrent MCP edit
silently — and the model that wrote it is told the save succeeded, which is the failure this ADR
exists to remove in the other direction too.

**Considered and rejected:** a version column bumped on write. It is the same lock with a
migration and a second source of truth, and it answers "has anyone written since?" where what an
edit actually needs to know is "is this the content I read?" — a rollback that restores the
content I read is not a conflict, and a bumped counter would say it is. **Also rejected:** making
the revision mandatory, which would break the editor and the installed CLIs at once, for a
guarantee neither of them was asking for.

The response of a write carries the revision of what was **stored**, not of what was sent: the
sanitizer above may have cleaned the content, and an edit chained onto the previous one has to
lock against the content that now exists.

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

## Writing requires being the brick's author, and a refusal is a result

Reading is the endpoint's; writing to a brick's documentation is the brick's. `community_doc_edit`
applies the brick's own rule — creator or co-author, `HnBrickSecurity` — rather than one written for
the MCP, so an author gains and loses nothing by editing through a model instead of through the
site.

Every refusal of that tool is a **value in the response**, not an exception: not authorized, a stale
revision, a malformed batch. All three are things the caller acts on — by asking the brick's author,
by reading the page again, by fixing the operation — and none is a server fault. An exception thrown
out of a tool handler reaches a model as a transport error stripped of exactly the detail that makes
it actionable, and the read side already models its refusals this way.

The stale-revision refusal carries the new revision **and the blocks that changed since**, found by
replaying the recorded history backwards until the document hashes to the revision the caller holds.
Told only that the page moved on, a model's only move is to read the whole page again and redo its
work; told which blocks moved, it can see its batch touched none of them and replay it. Nothing
stored ties a revision to a point in the history — that is the price of a revision being a hash of
content rather than a counter — so the point has to be found by replaying, and a revision older than
the walk's bound gets an honest "cannot be listed" instead of a guess.

**Considered and rejected:** letting the tool write with no revision, the way the REST endpoint
still allows. The optional lock exists for callers written before it; a model that has just read the
page has nothing to lose by naming what it read, and everything to lose by overwriting an edit it
never saw.
